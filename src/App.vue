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

import { ref, nextTick, computed } from "vue";
import type * as Blockly from "blockly";
import BlocklyComponent from "./components/BlocklyComponent.vue";
import "./blocks/stocks";
import { upgradeTweenData } from "./utils/dataUpgrade";
import { Access } from "./utils/Access";
import type { UserInfo } from "./utils/Access";
import { useMessageBridge } from "./composables/useMessageBridge";
import { useCodeGenerator } from "./composables/useCodeGenerator";
import type {
  CodeGenerationWarning,
  GeneratedCode,
} from "./composables/useCodeGenerator";
import { useToolboxSetup } from "./composables/useToolboxSetup";
import type { BlocklyOptions } from "./composables/useToolboxSetup";
import { useWorkspace } from "./composables/useWorkspace";
import { useTheme } from "./composables/useTheme";
import {
  hasPersistedChanges,
  prepareWorkspaceInitData,
  SaveCoordinator,
} from "./utils/saveCoordinator";
import {
  clearWorkspaceValidationFeedback,
  serializeWorkspaceWarnings,
  showWorkspaceValidationWarnings,
  validateWorkspaceForSave,
  type WorkspaceValidationIssue,
} from "./utils/workspaceValidation";

/** Shape of the INIT config from payload.config. */
interface InitConfig {
  style: string;
  parameters: unknown;
  data: unknown;
  userInfo: UserInfo;
  code?: {
    js?: string;
    lua?: string;
  };
}

/** Shape of the generated code object. */
interface CodeState {
  lua: string;
  javascript: string;
}

interface WorkspaceChangeEvent {
  element?: string;
  isUiEvent?: boolean;
}

interface PendingPersistedSnapshot {
  saveId: string;
  data: Record<string, unknown>;
  code: GeneratedCode;
}

const SAVE_ACK_TIMEOUT_MS = 30_000;

window.URL = window.URL || window.webkitURL;
window.BlobBuilder =
  window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

const { postMessage, postResponse, onMessage } = useMessageBridge();
const { setDark, isDark } = useTheme();

const buildTime: string = __BUILD_TIME__;
const { generateAllSafely } = useCodeGenerator();
const { buildOptions } = useToolboxSetup();
const { saveWorkspace, watchWorkspaceReady } = useWorkspace();

const userInfo = ref<UserInfo>({});
const access = computed<Access>(() => new Access(userInfo.value));

let oldValue: unknown = null;
let persistedCode: GeneratedCode = { js: "", lua: "" };
let lastGeneratedCode: GeneratedCode = { js: "", lua: "" };
const saveCoordinator = new SaveCoordinator<PendingPersistedSnapshot>();
let pendingSaveTimeout: number | null = null;
let saveSequence = 0;
const editor = ref<InstanceType<typeof BlocklyComponent> | null>(null);
const code = ref<CodeState>({
  lua: "",
  javascript: "",
});

const options = ref<BlocklyOptions | undefined>();

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

const currentWorkspaceDiffersFromPersisted = (): boolean => {
  const workspace = editor.value?.workspace;
  if (!workspace) return false;

  try {
    const data = saveWorkspace(workspace);
    const generation = generateAllSafely(workspace, lastGeneratedCode);
    lastGeneratedCode = generation.generated;
    code.value = {
      javascript: generation.generated.js,
      lua: generation.generated.lua,
    };
    return hasPersistedChanges(
      data,
      generation.generated,
      oldValue,
      persistedCode
    );
  } catch {
    // Let the queued save produce the normal technical save-error response.
    return true;
  }
};

function save(): void {
  if (saveCoordinator.queueIfPending()) return;

  const workspace = editor.value?.workspace;
  if (!workspace) {
    postResponse({
      action: "save-error",
      error: true,
      message: "Blockly 工作区尚未就绪，无法保存。",
    });
    return;
  }

  let data: Record<string, unknown>;
  try {
    data = saveWorkspace(workspace) as Record<string, unknown>;
  } catch (error) {
    postResponse({
      action: "save-error",
      error: true,
      message: `工作区序列化失败，无法保存：${
        error instanceof Error ? error.message : String(error)
      }`,
    });
    return;
  }

  const generation = generateAllSafely(workspace, lastGeneratedCode);
  lastGeneratedCode = generation.generated;
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
  const hasChanges = hasPersistedChanges(
    data,
    generation.generated,
    oldValue,
    persistedCode
  );

  if (!hasChanges) {
    postResponse({
      action: "save",
      noChange: true,
      warnings: serializedWarnings,
    });
  } else {
    const saveId = `save-${Date.now()}-${++saveSequence}`;
    const snapshot: PendingPersistedSnapshot = {
      saveId,
      data,
      code: { ...generation.generated },
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
      if (settlement.hadQueuedSave && currentWorkspaceDiffersFromPersisted()) {
        save();
      }
    }, SAVE_ACK_TIMEOUT_MS);
    postResponse({
      action: "save",
      saveId,
      js: generation.generated.js,
      lua: generation.generated.lua,
      data: data,
      warnings: serializedWarnings,
    });
  }
}

const settlePendingSave = (saveId: string, persisted: boolean): void => {
  const settlement = saveCoordinator.settle(saveId);
  if (!settlement.matched || !settlement.snapshot) return;

  clearPendingSaveTimeout();
  if (persisted) {
    oldValue = settlement.snapshot.data;
    persistedCode = settlement.snapshot.code;
  }

  if (settlement.hadQueuedSave && currentWorkspaceDiffersFromPersisted()) {
    save();
  }
};

const doInit = (config: InitConfig): void => {
  console.log("doInit executed with role:", config.userInfo?.role);
  console.error("init", config);
  userInfo.value = config.userInfo || {};
  clearPendingSaveTimeout();
  saveCoordinator.reset();
  oldValue = null;
  persistedCode = {
    js: typeof config.code?.js === "string" ? config.code.js : "",
    lua: typeof config.code?.lua === "string" ? config.code.lua : "",
  };
  lastGeneratedCode = { ...persistedCode };
  code.value = {
    javascript: lastGeneratedCode.js,
    lua: lastGeneratedCode.lua,
  };
  options.value = buildOptions(config.style, config.parameters, access.value);
  nextTick(() => {
    const { baseline, loadData } = prepareWorkspaceInitData(
      config.data,
      upgradeTweenData
    );
    oldValue = baseline;

    watchWorkspaceReady(
      editor as Parameters<typeof watchWorkspaceReady>[0],
      loadData as object,
      (workspace: Blockly.WorkspaceSvg) => {
        // 添加工作区变化的监听器
        workspace.addChangeListener(onWorkspaceChange);
        updateCode();
      },
      () => {
        postMessage("EVENT", {
          event: "error",
          message: "Workspace failed to initialize within 5 seconds",
        });
      },
      (error: unknown) => {
        postMessage("EVENT", {
          event: "error",
          message: `脚本数据加载失败，已停止回写空工作区：${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    );
  });
};

// 更新 Lua 代码并发送到主页面
const updateCode = (): void => {
  if (editor.value && editor.value.workspace) {
    const blocklyData = saveWorkspace(editor.value.workspace);
    const generation = generateAllSafely(
      editor.value.workspace,
      lastGeneratedCode
    );
    lastGeneratedCode = generation.generated;
    code.value = {
      javascript: generation.generated.js,
      lua: generation.generated.lua,
    };
    postMessage("EVENT", {
      event: "update",
      lua: generation.generated.lua,
      js: generation.generated.js,
      blocklyData: blocklyData,
      warnings: generation.warnings,
    });
  }
};

// 处理工作区变化
const onWorkspaceChange = (event?: WorkspaceChangeEvent): void => {
  if (event?.isUiEvent || event?.element === "warning") return;
  if (editor.value?.workspace) {
    clearWorkspaceValidationFeedback(editor.value.workspace);
  }
  updateCode();
};

// Register message handlers
onMessage("INIT", (payload: unknown) => {
  console.log("blockly-INIT received");
  const p = payload as { config?: InitConfig };
  if (p?.config) {
    doInit(p.config);
  }
});

onMessage("REQUEST", (payload: unknown) => {
  const p = payload as { action?: string };
  if (p?.action === "save") {
    save();
  }
});

onMessage("SAVE_ACK", (payload: unknown) => {
  const saveId = (payload as { saveId?: unknown } | null)?.saveId;
  if (typeof saveId !== "string") return;
  settlePendingSave(saveId, true);
});

onMessage("SAVE_NACK", (payload: unknown) => {
  const saveId = (payload as { saveId?: unknown } | null)?.saveId;
  if (typeof saveId !== "string") return;
  settlePendingSave(saveId, false);
});

onMessage("THEME_CHANGE", (payload: unknown) => {
  const p = payload as { dark?: boolean };
  if (typeof p?.dark === "boolean") {
    setDark(p.dark);
  }
});

onMessage("DESTROY", () => {
  clearPendingSaveTimeout();
  saveCoordinator.reset();
  if (editor.value?.workspace) {
    editor.value.workspace.dispose();
  }
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
      lastGeneratedCode = generation.generated;
      code.value.lua = generation.generated.lua;
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
      lastGeneratedCode = generation.generated;
      code.value.javascript = generation.generated.js;
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
