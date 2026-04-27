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
import { useToolboxSetup } from "./composables/useToolboxSetup";
import type { BlocklyOptions } from "./composables/useToolboxSetup";
import { useWorkspace } from "./composables/useWorkspace";
import { useTheme } from "./composables/useTheme";

/** Shape of the INIT config from payload.config. */
interface InitConfig {
  style: string;
  parameters: unknown;
  data: unknown;
  userInfo: UserInfo;
}

/** Shape of the generated code object. */
interface CodeState {
  lua: string;
  javascript: string;
}

window.URL = window.URL || window.webkitURL;
window.BlobBuilder =
  window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

const { postMessage, postResponse, onMessage } = useMessageBridge();
const { setDark, isDark } = useTheme();

const buildTime: string = __BUILD_TIME__;
const { generateAll } = useCodeGenerator();
const { buildOptions } = useToolboxSetup();
const { saveWorkspace, watchWorkspaceReady } = useWorkspace();

const userInfo = ref<UserInfo>({});
const access = computed<Access>(() => new Access(userInfo.value));

let oldValue: Record<string, unknown> | null = null;
const editor = ref<InstanceType<typeof BlocklyComponent> | null>(null);
const code = ref<CodeState>({
  lua: "",
  javascript: "",
});

const options = ref<BlocklyOptions | undefined>();

const save = (): void => {
  const data = saveWorkspace(editor.value!.workspace!);
  if (JSON.stringify(data) == JSON.stringify(oldValue)) {
    postResponse({ action: "save", noChange: true });
  } else {
    const generated = generateAll(editor.value!.workspace!);
    postResponse({
      action: "save",
      js: generated.js,
      lua: generated.lua,
      data: data,
    });

    oldValue = data;
  }
};

const doInit = (config: InitConfig): void => {
  console.log("doInit executed with role:", config.userInfo?.role);
  console.error("init", config);
  userInfo.value = config.userInfo || {};
  options.value = buildOptions(config.style, config.parameters, access.value);
  nextTick(() => {
    oldValue = config.data as Record<string, unknown> | null;

    const upgradedData = upgradeTweenData(config.data);

    watchWorkspaceReady(
      editor as Parameters<typeof watchWorkspaceReady>[0],
      upgradedData as object,
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
      }
    );
  });
};

// 更新 Lua 代码并发送到主页面
const updateCode = (): void => {
  if (editor.value && editor.value.workspace) {
    const blocklyData = saveWorkspace(editor.value.workspace);
    const generated = generateAll(editor.value.workspace);
    postMessage("EVENT", {
      event: "update",
      lua: generated.lua,
      js: generated.js,
      blocklyData: blocklyData,
    });
  }
};

// 处理工作区变化
const onWorkspaceChange = (): void => {
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

onMessage("THEME_CHANGE", (payload: unknown) => {
  const p = payload as { dark?: boolean };
  if (typeof p?.dark === "boolean") {
    setDark(p.dark);
  }
});

onMessage("DESTROY", () => {
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
      code.value.lua = generateAll(editor.value.workspace).lua;
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
      code.value.javascript = generateAll(editor.value.workspace).js;
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
