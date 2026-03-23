<template>
  <div id="app">
    <BlocklyComponent
      v-if="options"
      id="blockly"
      :options="options"
      ref="editor"
    ></BlocklyComponent>
    <div v-else>7d game 1023</div>
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
  pad: 0;
}

#code {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  pad: 0;
  background-color: beige;
}

#blockly {
  position: absolute;
  left: 8px;
  bottom: 8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(49, 73, 107, 0.1);
}
</style>
