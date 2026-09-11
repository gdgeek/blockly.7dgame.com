<template>
  <div id="app" :class="{ dark: isDark }">
    <BlocklyComponent
      v-if="options"
      id="blockly"
      :options="options"
      ref="editor"
    ></BlocklyComponent>
    <div v-if="options" class="build-version">{{ buildTime }}</div>
    <div v-else class="landing">
      <span class="landing-spinner" aria-label="loading"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Main Vue component that includes the Blockly component.
 * @author dcoodien@google.com (Dylan Coodien)
 */

import { ref, nextTick, computed, onBeforeUnmount } from "vue";
import type * as Blockly from "blockly";
import BlocklyComponent from "./components/BlocklyComponent.vue";
import "./blocks/stocks";
import { upgradeTweenData } from "./utils/dataUpgrade";
import { createWebMcpScriptRequestHandlers } from "./utils/webMcpScriptHandlers";
import { createWebMcpRequestDispatcher } from "./utils/webMcpRequestDispatcher";
import { Access } from "./utils/Access";
import type { UserInfo } from "./utils/Access";
import { useMessageBridge } from "./composables/useMessageBridge";
import { useCodeGenerator } from "./composables/useCodeGenerator";
import type {
  CodeGenerationWarning,
  GeneratedCode,
  SafeGeneratedCode,
} from "./composables/useCodeGenerator";
import { useToolboxSetup } from "./composables/useToolboxSetup";
import type { BlocklyOptions } from "./composables/useToolboxSetup";
import { useWorkspace } from "./composables/useWorkspace";
import { useTheme } from "./composables/useTheme";
import {
  cloneWorkspaceValue,
  hasPersistedChanges,
  SaveCoordinator,
} from "./utils/saveCoordinator";
import {
  clearTrackedWorkspaceValidationFeedback,
  serializeWorkspaceWarnings,
  showWorkspaceValidationWarnings,
  validateWorkspaceForSave,
  type WorkspaceValidationIssue,
} from "./utils/workspaceValidation";
import { createFrameCoalescer } from "./utils/frameCoalescer";
import { createWorkspaceChangeListenerBinding } from "./utils/workspaceChangeListenerBinding";
import {
  resolveActiveWorkspace,
  shouldQueueWorkspaceUpdate,
  type WorkspaceRuntimeEvent,
} from "./utils/workspaceRuntimePolicy";

/** Shape of the INIT config from payload.config. */
interface InitConfig {
  style: string;
  parameters: unknown;
  data: unknown;
  userInfo: UserInfo;
  /**
   * Opaque host-owned session token. New hosts use it to ignore late messages
   * emitted by an earlier INIT that reused the same iframe.
   */
  hostSessionId?: string;
  code?: {
    js?: string;
    lua?: string;
  };
  /**
   * Confirmed server state. `data` above may instead be an unsaved draft when
   * the host rebuilds the iframe (for example after a language change).
   */
  persisted?: {
    data?: unknown;
    code?: {
      js?: string;
      lua?: string;
    };
  };
}

/** Shape of the generated code object. */
interface CodeState {
  lua: string;
  javascript: string;
}

interface PendingPersistedSnapshot {
  saveId: string;
  data: Record<string, unknown>;
  code: GeneratedCode;
  hostSessionId?: string;
}

interface WorkspaceSnapshot {
  workspace: Blockly.Workspace;
  data: Record<string, unknown>;
  generation: SafeGeneratedCode;
  revision: number;
}

interface KnownGeneratedCode {
  js: boolean;
  lua: boolean;
}

const SAVE_ACK_TIMEOUT_MS = 30_000;

window.URL = window.URL || window.webkitURL;
window.BlobBuilder =
  window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

const { postMessage, postResponse, onMessage } = useMessageBridge();
const { setDark, isDark } = useTheme();

const buildTime: string = __BUILD_TIME__;
const { generateAllSafely, generateAll } = useCodeGenerator();
const { buildOptions } = useToolboxSetup();
const {
  saveWorkspace,
  loadWorkspace,
  watchWorkspaceReady,
  cancelWorkspaceReadyWatch,
} = useWorkspace();

const userInfo = ref<UserInfo>({});
const access = computed<Access>(() => new Access(userInfo.value));

let oldValue: unknown = null;
let persistedCode: GeneratedCode = { js: "", lua: "" };
let lastGeneratedCode: GeneratedCode = { js: "", lua: "" };
let knownGeneratedCode: KnownGeneratedCode = { js: false, lua: false };
const saveCoordinator = new SaveCoordinator<PendingPersistedSnapshot>();
let pendingSaveTimeout: number | null = null;
let saveSequence = 0;
let workspaceInitSequence = 0;
let queuedSaveRequestIds: Array<string | undefined> = [];
let workspaceRevision = 0;
let activeHostSessionId: string | undefined;
let activeWorkspace: Blockly.WorkspaceSvg | null = null;
let lastWorkspaceSnapshot: WorkspaceSnapshot | null = null;
const disposedWorkspaces = new WeakSet<Blockly.Workspace>();
const editor = ref<InstanceType<typeof BlocklyComponent> | null>(null);
const code = ref<CodeState>({
  lua: "",
  javascript: "",
});

const options = ref<BlocklyOptions | undefined>();

const withHostSession = (
  payload: Record<string, unknown>
): Record<string, unknown> =>
  activeHostSessionId === undefined
    ? payload
    : { ...payload, hostSessionId: activeHostSessionId };

const postSessionResponse = (
  payload: Record<string, unknown>,
  requestId?: string
): void => {
  postResponse(withHostSession(payload), requestId ?? null);
};

const hasSnapshotChanges = (snapshot: WorkspaceSnapshot): boolean =>
  hasPersistedChanges(
    snapshot.data,
    snapshot.generation.generated,
    oldValue,
    persistedCode
  );

const snapshotPayload = (
  snapshot: WorkspaceSnapshot
): Record<string, unknown> => ({
  js: snapshot.generation.generated.js,
  lua: snapshot.generation.generated.lua,
  data: snapshot.data,
  dirty: hasSnapshotChanges(snapshot),
  workspaceRevision: snapshot.revision,
});

const generationWarningsToValidationWarnings = (
  warnings: CodeGenerationWarning[]
): WorkspaceValidationIssue[] =>
  warnings.map((item) => ({
    ...item,
    severity: "warning",
  }));

const clearPendingSaveTimeout = (): void => {
  if (pendingSaveTimeout !== null) {
    window.clearTimeout(pendingSaveTimeout);
    pendingSaveTimeout = null;
  }
};

const failedGenerationLanguages = (
  generation: SafeGeneratedCode
): Set<CodeGenerationWarning["language"]> =>
  new Set(generation.warnings.map((warning) => warning.language));

/**
 * A successful generation is a valid fallback even when its code is an empty
 * string (for example, an intentionally empty workspace).
 */
const rememberGeneratedCode = (generation: SafeGeneratedCode): void => {
  const failedLanguages = failedGenerationLanguages(generation);
  if (!failedLanguages.has("javascript")) knownGeneratedCode.js = true;
  if (!failedLanguages.has("lua")) knownGeneratedCode.lua = true;

  lastGeneratedCode = generation.generated;
  code.value = {
    javascript: generation.generated.js,
    lua: generation.generated.lua,
  };
};

/**
 * Older hosts did not include persisted code in INIT. If a generator then
 * throws before ever succeeding, its empty fallback is not known to be the
 * user's real saved code and must not be written back over it.
 */
const generationFailuresWithoutFallback = (
  generation: SafeGeneratedCode
): CodeGenerationWarning["language"][] => {
  const missing = new Set<CodeGenerationWarning["language"]>();
  for (const warning of generation.warnings) {
    if (warning.language === "javascript" && !knownGeneratedCode.js) {
      missing.add(warning.language);
    }
    if (warning.language === "lua" && !knownGeneratedCode.lua) {
      missing.add(warning.language);
    }
  }
  return [...missing];
};

const captureWorkspaceSnapshot = (
  workspace: Blockly.Workspace
): WorkspaceSnapshot => {
  const data = saveWorkspace(workspace);
  const generation = generateAllSafely(workspace, lastGeneratedCode);
  rememberGeneratedCode(generation);

  const snapshot = {
    workspace,
    data,
    generation,
    revision: workspaceRevision,
  };
  lastWorkspaceSnapshot = snapshot;
  return snapshot;
};

// Generate and publish the complete state for a single settled workspace turn.
const updateCode = (
  workspace: Blockly.WorkspaceSvg | null = activeWorkspace
): WorkspaceSnapshot | undefined => {
  if (!workspace || editor.value?.workspace !== workspace) return;

  const snapshot = captureWorkspaceSnapshot(workspace);
  postMessage(
    "EVENT",
    withHostSession({
      event: "update",
      lua: snapshot.generation.generated.lua,
      js: snapshot.generation.generated.js,
      blocklyData: snapshot.data,
      dirty: hasSnapshotChanges(snapshot),
      workspaceRevision: snapshot.revision,
      warnings: snapshot.generation.warnings,
    })
  );
  return snapshot;
};

const workspaceUpdateQueue = createFrameCoalescer(() => {
  try {
    updateCode();
  } catch (error) {
    console.error("工作区更新生成失败：", error);
  }
});

const onWorkspaceChange = (rawEvent: Blockly.Events.Abstract): void => {
  const event = rawEvent as WorkspaceRuntimeEvent;
  if (!shouldQueueWorkspaceUpdate(event)) return;

  const workspace = activeWorkspace;
  if (!workspace || editor.value?.workspace !== workspace) return;

  clearTrackedWorkspaceValidationFeedback(workspace);
  workspaceRevision += 1;
  lastWorkspaceSnapshot = null;
  workspaceUpdateQueue.schedule();
};

const workspaceChangeListener =
  createWorkspaceChangeListenerBinding(onWorkspaceChange);

const resetWorkspaceRuntime = (): void => {
  workspaceUpdateQueue.cancel();
  cancelWorkspaceReadyWatch();
  lastWorkspaceSnapshot = null;

  if (activeWorkspace) {
    clearTrackedWorkspaceValidationFeedback(activeWorkspace);
  }
  workspaceChangeListener.detach();
  activeWorkspace = null;
};

const captureFreshWorkspaceSnapshot = (
  workspace: Blockly.Workspace
): WorkspaceSnapshot => {
  const flushedQueuedUpdate = workspaceUpdateQueue.flush();
  if (flushedQueuedUpdate && lastWorkspaceSnapshot?.workspace === workspace) {
    return lastWorkspaceSnapshot;
  }
  return captureWorkspaceSnapshot(workspace);
};

function save(
  precomputedSnapshot?: WorkspaceSnapshot,
  requestId?: string
): void {
  const respond = (payload: Record<string, unknown>) =>
    postSessionResponse(payload, requestId);
  const workspace = resolveActiveWorkspace(
    editor.value?.workspace,
    activeWorkspace
  );
  if (!workspace) {
    respond({
      action: "save-error",
      error: true,
      message: "Blockly 工作区尚未就绪，无法保存。",
    });
    return;
  }

  if (saveCoordinator.queueIfPending()) {
    queuedSaveRequestIds.push(requestId);
    return;
  }

  let workspaceSnapshot: WorkspaceSnapshot;
  try {
    workspaceSnapshot =
      precomputedSnapshot?.workspace === workspace
        ? precomputedSnapshot
        : captureFreshWorkspaceSnapshot(workspace);
  } catch (error) {
    respond({
      action: "save-error",
      error: true,
      message: `工作区序列化失败，无法保存：${
        error instanceof Error ? error.message : String(error)
      }`,
    });
    return;
  }

  const { data, generation } = workspaceSnapshot;
  const failuresWithoutFallback = generationFailuresWithoutFallback(generation);
  const validation = validateWorkspaceForSave(
    workspace,
    () => generation.generated
  );
  const warnings = [
    ...generationWarningsToValidationWarnings(generation.warnings),
    ...validation.warnings,
  ];

  if ("centerOnBlock" in workspace) {
    try {
      showWorkspaceValidationWarnings(workspace, warnings);
    } catch (error) {
      console.warn("显示工作区保存警告失败，继续保存：", error);
    }
  }

  const serializedWarnings = serializeWorkspaceWarnings(warnings);
  if (failuresWithoutFallback.length > 0) {
    const languageNames = failuresWithoutFallback
      .map((language) => (language === "javascript" ? "JavaScript" : "Lua"))
      .join("、");
    respond({
      action: "save-error",
      error: true,
      errorCode: "missing-generated-code-fallback",
      message: `${languageNames} 代码生成器发生技术异常，且当前旧版主系统未提供可安全回退的历史代码。为避免用空代码覆盖已保存脚本，本次未写入；请刷新主系统后重试。`,
      warnings: serializedWarnings,
    });
    return;
  }

  const hasChanges = hasSnapshotChanges(workspaceSnapshot);

  if (!hasChanges) {
    // Return the exact snapshot that produced noChange. The host can rebase
    // its own dirty indicator without guessing which update Blockly compared.
    respond({
      action: "save",
      noChange: true,
      ...snapshotPayload(workspaceSnapshot),
      warnings: serializedWarnings,
    });
  } else {
    const saveId = `save-${Date.now()}-${++saveSequence}`;
    const snapshot: PendingPersistedSnapshot = {
      saveId,
      data,
      code: { ...generation.generated },
      hostSessionId: activeHostSessionId,
    };
    if (!saveCoordinator.begin(snapshot)) return;
    clearPendingSaveTimeout();
    pendingSaveTimeout = window.setTimeout(() => {
      const settlement = saveCoordinator.settle(saveId);
      if (!settlement.matched) return;

      pendingSaveTimeout = null;
      console.warn(
        `保存 ${saveId} 在 ${SAVE_ACK_TIMEOUT_MS}ms 内未收到 ACK/NACK，已释放等待状态。`
      );
      // A missing ACK is not proof of persistence: the legacy host may have
      // failed after receiving the RESPONSE. Keep the confirmed baseline and
      // allow the queued request to retry, even when that means an idempotent
      // duplicate write on legacy hosts.
      if (settlement.hadQueuedSave) {
        saveQueuedWorkspace();
      }
    }, SAVE_ACK_TIMEOUT_MS);
    respond({
      action: "save",
      saveId,
      ...snapshotPayload(workspaceSnapshot),
      warnings: serializedWarnings,
    });
  }
}

const saveQueuedWorkspace = (): void => {
  const requests = queuedSaveRequestIds.splice(0);
  for (const requestId of requests) save(undefined, requestId);
};

const settlePendingSave = (
  saveId: string,
  persisted: boolean,
  hostSessionId?: string
): void => {
  if (
    activeHostSessionId !== undefined &&
    hostSessionId !== activeHostSessionId
  ) {
    return;
  }

  const settlement = saveCoordinator.settle(saveId);
  if (!settlement.matched || !settlement.snapshot) return;
  if (settlement.snapshot.hostSessionId !== activeHostSessionId) return;

  clearPendingSaveTimeout();
  if (persisted) {
    oldValue = settlement.snapshot.data;
    persistedCode = settlement.snapshot.code;

    // ACK advances only the snapshot that was actually persisted. If the user
    // edited while the host request was in flight, the next update remains
    // dirty relative to this confirmed baseline.
    const workspace = resolveActiveWorkspace(
      editor.value?.workspace,
      activeWorkspace
    );
    if (workspace) {
      try {
        updateCode(workspace);
      } catch (error) {
        console.error("保存确认后刷新工作区状态失败：", error);
      }
    }
  }

  // Every queued REQUEST needs a RESPONSE. Calling save unconditionally lets
  // it return noChange after ACK, retry after NACK, or report a technical error.
  if (settlement.hadQueuedSave) {
    saveQueuedWorkspace();
  }
};

const doInit = (config: InitConfig): void => {
  const initSequence = ++workspaceInitSequence;
  resetWorkspaceRuntime();
  console.log("doInit executed with role:", config.userInfo?.role);
  userInfo.value = config.userInfo || {};
  clearPendingSaveTimeout();
  saveCoordinator.reset();
  queuedSaveRequestIds = [];
  oldValue = null;
  workspaceRevision = 0;
  activeHostSessionId =
    typeof config.hostSessionId === "string" ? config.hostSessionId : undefined;
  const persistedCodeConfig = {
    js: config.persisted?.code?.js ?? config.code?.js,
    lua: config.persisted?.code?.lua ?? config.code?.lua,
  };
  knownGeneratedCode = {
    js: typeof persistedCodeConfig?.js === "string",
    lua: typeof persistedCodeConfig?.lua === "string",
  };
  persistedCode = {
    js:
      typeof persistedCodeConfig?.js === "string" ? persistedCodeConfig.js : "",
    lua:
      typeof persistedCodeConfig?.lua === "string"
        ? persistedCodeConfig.lua
        : "",
  };
  lastGeneratedCode = { ...persistedCode };
  code.value = {
    javascript: lastGeneratedCode.js,
    lua: lastGeneratedCode.lua,
  };
  options.value = buildOptions(config.style, config.parameters, access.value);
  nextTick(() => {
    if (initSequence !== workspaceInitSequence) return;

    const loadData = upgradeTweenData(cloneWorkspaceValue(config.data));
    oldValue = cloneWorkspaceValue(
      config.persisted?.data === undefined ? config.data : config.persisted.data
    );

    watchWorkspaceReady(
      editor as Parameters<typeof watchWorkspaceReady>[0],
      loadData as object,
      (workspace: Blockly.WorkspaceSvg) => {
        if (initSequence !== workspaceInitSequence) return;

        activeWorkspace = workspace;
        workspaceChangeListener.attach(workspace);
        updateCode(workspace);
      },
      () => {
        if (initSequence !== workspaceInitSequence) return;
        postMessage(
          "EVENT",
          withHostSession({
            event: "error",
            message: "Workspace failed to initialize within 5 seconds",
          })
        );
      },
      (error: unknown) => {
        if (initSequence !== workspaceInitSequence) return;
        postMessage(
          "EVENT",
          withHostSession({
            event: "error",
            message: `脚本数据加载失败，已停止回写空工作区：${
              error instanceof Error ? error.message : String(error)
            }`,
          })
        );
      }
    );
  });
};

const webMcpHandlers = createWebMcpScriptRequestHandlers({
  getWorkspace: () =>
    resolveActiveWorkspace(editor.value?.workspace, activeWorkspace),
  getGeneration: () => workspaceInitSequence,
  getToolbox: () => options.value?.toolbox,
  saveWorkspace,
  loadWorkspace,
  generateAll,
  generateAllSafely,
  onMutationSettled: () => {
    workspaceUpdateQueue.flush();
  },
});
const dispatchWebMcpRequest = createWebMcpRequestDispatcher({
  handlers: webMcpHandlers,
  getSession: () => ({
    generation: workspaceInitSequence,
    hostSessionId: activeHostSessionId,
    workspace: activeWorkspace,
  }),
  respond: (payload, requestId) => postResponse(payload, requestId),
});

// Register message handlers
onMessage("INIT", (payload: unknown) => {
  console.log("blockly-INIT received");
  const p = payload as { config?: InitConfig };
  if (p?.config) {
    doInit(p.config);
  }
});

onMessage("REQUEST", (payload: unknown, message) => {
  const p = payload as { action?: string; hostSessionId?: unknown };
  if (
    activeHostSessionId !== undefined &&
    p?.hostSessionId !== activeHostSessionId
  ) {
    return false;
  }
  if (p?.action === "save") {
    save(undefined, message?.id);
    return true;
  }
  return dispatchWebMcpRequest(p as Record<string, unknown>, message?.id ?? "");
});

onMessage("SAVE_SHORTCUT", () => {
  if (activeHostSessionId === undefined) {
    // Legacy hosts do not understand save-request. Preserve their existing
    // direct Ctrl/Cmd+S behavior until both sides support session correlation.
    save();
    return;
  }

  postMessage(
    "EVENT",
    withHostSession({
      event: "save-request",
    })
  );
});

onMessage("SAVE_ACK", (payload: unknown) => {
  const acknowledgement = payload as {
    saveId?: unknown;
    hostSessionId?: unknown;
  } | null;
  const saveId = acknowledgement?.saveId;
  if (typeof saveId !== "string") return;
  settlePendingSave(
    saveId,
    true,
    typeof acknowledgement?.hostSessionId === "string"
      ? acknowledgement.hostSessionId
      : undefined
  );
});

onMessage("SAVE_NACK", (payload: unknown) => {
  const acknowledgement = payload as {
    saveId?: unknown;
    hostSessionId?: unknown;
  } | null;
  const saveId = acknowledgement?.saveId;
  if (typeof saveId !== "string") return;
  settlePendingSave(
    saveId,
    false,
    typeof acknowledgement?.hostSessionId === "string"
      ? acknowledgement.hostSessionId
      : undefined
  );
});

onMessage("THEME_CHANGE", (payload: unknown) => {
  const p = payload as { dark?: boolean };
  if (typeof p?.dark === "boolean") {
    setDark(p.dark);
  }
});

onMessage("DESTROY", () => {
  workspaceInitSequence += 1;
  const workspace = editor.value?.workspace;
  resetWorkspaceRuntime();
  clearPendingSaveTimeout();
  saveCoordinator.reset();
  queuedSaveRequestIds = [];
  if (workspace && !disposedWorkspaces.has(workspace)) {
    disposedWorkspaces.add(workspace);
    workspace.dispose();
  }
});

onBeforeUnmount(() => {
  workspaceInitSequence += 1;
  resetWorkspaceRuntime();
  clearPendingSaveTimeout();
  saveCoordinator.reset();
  queuedSaveRequestIds = [];
});

// eslint-disable-next-line no-unused-vars -- 保留用于调试和后续功能
function luaCode(): void {
  if (editor.value && editor.value.workspace) {
    console.log("foo.value.workspace", editor.value.workspace);
    const blockCount = editor.value.workspace.getAllBlocks(false).length;
    if (blockCount === 0) {
      console.log("工作区为空，无法生成 Lua 代码");
      code.value.lua = "";
    } else {
      const generation = generateAllSafely(
        editor.value.workspace,
        lastGeneratedCode
      );
      rememberGeneratedCode(generation);
      console.log("Lua 代码：", code.value);
    }
  }
}

// eslint-disable-next-line no-unused-vars -- 保留用于调试和后续功能
function jsCode(): void {
  if (editor.value && editor.value.workspace) {
    const blockCount = editor.value.workspace.getAllBlocks(false).length;
    if (blockCount === 0) {
      console.log("工作区为空，无法生成 JavaScript 代码");
      code.value.javascript = "";
    } else {
      const generation = generateAllSafely(
        editor.value.workspace,
        lastGeneratedCode
      );
      rememberGeneratedCode(generation);
      console.log("JavaScript 代码：", code.value);
    }
  }
}

defineExpose({
  code,
});
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background: #f9fafb;
  width: 100%;
  height: 100%;
  transition: background-color 0.18s ease;
}

#app.dark {
  background: #111827;
}

.blocklySelected .blocklyPath {
  stroke-width: 3px !important;
}

.blockly-save-validation-warning .blocklyPath {
  stroke: #f59e0b !important;
  stroke-width: 3px !important;
  filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4));
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#code {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: beige;
}

#blockly {
  position: absolute;
  left: 8px;
  bottom: 8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  overflow: hidden;
}

.build-version {
  position: fixed;
  right: 12px;
  bottom: 12px;
  font-size: 11px;
  color: rgba(120, 120, 140, 0.6);
  pointer-events: none;
  z-index: 100;
  font-family: monospace;
}

/* Landing page */
.landing {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.landing-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgb(6 167 238 / 18%);
  border-top-color: #06a7ee;
  border-radius: 50%;
  animation: landing-spin 0.8s linear infinite;
}

@keyframes landing-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-color-scheme: dark) {
  .landing {
    background: #1e1e1e;
  }

  .landing-spinner {
    border-color: rgb(80 160 255 / 18%);
    border-top-color: #5db2ff;
  }
}
</style>
