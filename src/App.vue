<template>
  <div id="app">
    <BlocklyComponent
      v-if="options"
      id="blockly"
      :options="options"
      ref="editor"
    ></BlocklyComponent>
    <div v-if="options" class="build-version">{{ buildTime }}</div>
    <div v-else class="landing">
      <div class="landing-bg">
        <div class="landing-orb landing-orb--1"></div>
        <div class="landing-orb landing-orb--2"></div>
        <div class="landing-orb landing-orb--3"></div>
      </div>
      <div class="landing-card">
        <div class="landing-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect x="4" y="4" width="20" height="20" rx="4" fill="#4F8EF7" opacity="0.9"/>
            <rect x="32" y="4" width="20" height="20" rx="4" fill="#A78BFA" opacity="0.8"/>
            <rect x="4" y="32" width="20" height="20" rx="4" fill="#34D399" opacity="0.8"/>
            <rect x="32" y="32" width="20" height="20" rx="4" fill="#FBBF24" opacity="0.85"/>
          </svg>
        </div>
        <h1 class="landing-title">7D Game Blockly</h1>
        <p class="landing-subtitle">可视化脚本编辑器</p>
        <div class="landing-divider"></div>
        <div class="landing-status">
          <span class="landing-dot"></span>
          <span>等待连接...</span>
        </div>
        <p class="landing-version">Build: {{ buildTime }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
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
import BlocklyComponent from "./components/BlocklyComponent.vue";
import "./blocks/stocks";
import { upgradeTweenData } from "./utils/dataUpgrade.js";
import { Access } from "./utils/Access";
import { useMessageBridge } from "./composables/useMessageBridge";
import { useCodeGenerator } from "./composables/useCodeGenerator";
import { useToolboxSetup } from "./composables/useToolboxSetup";
import { useWorkspace } from "./composables/useWorkspace";

window.URL = window.URL || window.webkitURL;
window.BlobBuilder =
  window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

const { postMessage, onAction } = useMessageBridge();

const buildTime = __BUILD_TIME__;
const { generateAll } = useCodeGenerator();
const { buildOptions } = useToolboxSetup();
const { saveWorkspace, watchWorkspaceReady } = useWorkspace();

const initPayload = ref(null);
const isUserInfoReady = ref(false);

const userInfo = ref({
  id: "",
  role: "",
});
const access = computed(() => new Access(userInfo.value));

let oldValue = null;
const editor = ref();
const code = ref({
  lua: "",
  javascript: "",
});

let options = ref();

// eslint-disable-next-line no-unused-vars -- message 参数保留用于后续消息处理
const save = (message) => {
  const data = saveWorkspace(editor.value.workspace);
  if (JSON.stringify(data) == JSON.stringify(oldValue)) {
    postMessage("post:no-change");
  } else {
    const generated = generateAll(editor.value.workspace);
    postMessage("post", {
      js: generated.js,
      lua: generated.lua,
      data: data,
    });

    oldValue = data;
  }
};

const tryInit = () => {
  if (initPayload.value && isUserInfoReady.value) {
    doInit(initPayload.value);
    initPayload.value = null;
    isUserInfoReady.value = false;
  }
};

const doInit = (message) => {
  console.log("doInit executed with role:", userInfo.value.role);
  console.error("init", message);
  options.value = buildOptions(message.style, message.parameters, access.value);
  nextTick(() => {
    oldValue = message.data;

    const upgradedData = upgradeTweenData(message.data);

    watchWorkspaceReady(editor, upgradedData, (workspace) => {
      // 添加工作区变化的监听器
      workspace.addChangeListener(onWorkspaceChange);
      updateCode();
    }, () => {
      postMessage('error', { message: 'Workspace failed to initialize within 5 seconds' });
    });
  });
};

// 更新 Lua 代码并发送到主页面
const updateCode = () => {
  if (editor.value && editor.value.workspace) {
    const blocklyData = saveWorkspace(editor.value.workspace);
    const generated = generateAll(editor.value.workspace);
    postMessage("update", {
      lua: generated.lua,
      js: generated.js,
      blocklyData: blocklyData,
    });
  }
};

// 处理工作区变化
const onWorkspaceChange = () => {
  updateCode();
};

// Register message handlers
onAction("init", (data) => {
  console.log("blockly-init received");
  initPayload.value = data;
  tryInit();
});

onAction("user-info", (data) => {
  console.log("blockly-user-info received", data);
  userInfo.value = data;
  isUserInfoReady.value = true;
  console.log("blockly-userInfo updated", userInfo.value);
  tryInit();
});

onAction("save", (data) => {
  save(data);
});

// eslint-disable-next-line no-unused-vars -- 保留用于调试和后续功能
function luaCode() {
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
function jsCode() {
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
  background: #edf2f8;
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
  background: linear-gradient(135deg, #e8eef6 0%, #dce4f2 50%, #eae6f6 100%);
  overflow: hidden;
}

.landing-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.landing-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 8s ease-in-out infinite;
}

.landing-orb--1 {
  width: min(400px, 60vw);
  height: min(400px, 60vw);
  background: #4F8EF7;
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

.landing-orb--2 {
  width: min(350px, 50vw);
  height: min(350px, 50vw);
  background: #A78BFA;
  bottom: -10%;
  right: -10%;
  animation-delay: -3s;
}

.landing-orb--3 {
  width: min(250px, 40vw);
  height: min(250px, 40vw);
  background: #34D399;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -5s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -20px) scale(1.05); }
  66% { transform: translate(-15px, 15px) scale(0.95); }
}

.landing-card {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(49, 73, 107, 0.1);
  width: min(380px, calc(100vw - 48px));
  box-sizing: border-box;
}

.landing-icon {
  margin: 0 auto 20px;
  width: 56px;
  height: 56px;
}

.landing-title {
  margin: 0 0 6px;
  font-size: clamp(20px, 5vw, 28px);
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1e293b;
}

.landing-subtitle {
  margin: 0 0 24px;
  font-size: clamp(13px, 3vw, 15px);
  color: #64748b;
  font-weight: 400;
}

.landing-divider {
  width: 40px;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, #4F8EF7, #A78BFA);
  margin: 0 auto 24px;
}

.landing-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(79, 142, 247, 0.08);
  border-radius: 20px;
  font-size: clamp(12px, 2.8vw, 14px);
  color: #4F8EF7;
  font-weight: 500;
}

.landing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4F8EF7;
  animation: pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

.landing-version {
  margin: 20px 0 0;
  font-size: clamp(10px, 2.5vw, 12px);
  color: #94a3b8;
  font-weight: 400;
}
</style>
