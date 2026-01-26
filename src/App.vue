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

import { onMounted, ref, nextTick, watch, computed } from "vue";
import * as Blockly from "blockly";
import BlocklyComponent from "./components/BlocklyComponent.vue";
import "./blocks/stocks";
import * as Custom from "./custom";
import { upgradeTweenData } from "./utils/dataUpgrade.js";
import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import { Access } from "./utils/Access";
window.URL = window.URL || window.webkitURL;
window.BlobBuilder =
  window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;


const initPayload = ref(null);
const isUserInfoReady = ref(false);

const userInfo = ref({
  id: "",
  //roles: [],
  role: "",
});
const access = computed(() => new Access(userInfo.value));
const postMessage = (action, data = {}) => {
  window.parent.postMessage({ action, data, from: "script.blockly" }, "*");
};

const save = (message) => {
  const data = Blockly.serialization.workspaces.save(editor.value.workspace);
  if (JSON.stringify(data) == JSON.stringify(oldValue)) {
    postMessage("post:no-change");
  } else {
    postMessage("post", {
      js: javascriptGenerator.workspaceToCode(editor.value.workspace),
      lua: luaGenerator.workspaceToCode(editor.value.workspace),
      data: data,
    });
    //alert(luaGenerator.workspaceToCode(foo.value.workspace))

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
  const toolbox = Custom.setup(message.style, message.parameters, access.value);
  options.value = {
    media: "media/",
    grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
    toolbox,
    move: {
      scrollbars: {
        horizontal: true,
        vertical: true,
      },
      drag: true,
      wheel: false,
    },
    zoom: {
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      controls: true,
      wheel: true,
      pinch: true,
    },
  };
  nextTick(() => {
    oldValue = message.data;
   
    const upgradedData = upgradeTweenData(message.data);

    const loadWorkspace = (retries = 0) => {
      if (editor.value && editor.value.workspace) {
        // console.log("loadWorkspace: workspace found, loading data");
        try {
          Blockly.serialization.workspaces.load(upgradedData, editor.value.workspace);
        //  console.log("loadWorkspace: data loaded");
        } catch (e) {
         // console.error("loadWorkspace: error loading data", e);
        }

        // 添加工作区变化的监听器
        editor.value.workspace.addChangeListener(onWorkspaceChange);
        updateCode();
      } else {
        if (retries < 100) {
          // console.log(`loadWorkspace retry: ${retries}, editor: ${!!editor.value}, workspace: ${!!(editor.value && editor.value.workspace)}`);
          setTimeout(() => loadWorkspace(retries + 1), 50);
        } else {
        //  console.error("Blockly workspace failed to initialize in time after 100 retries.");
        }
      }
    };
    
    loadWorkspace();
  });
};

// 更新 Lua 代码并发送到主页面
const updateCode = () => {
  if (editor.value && editor.value.workspace) {
    const blocklyData = Blockly.serialization.workspaces.save(
      editor.value.workspace
    );
    //console.log("更新Lua 代码：", code.value.lua);
    postMessage("update", {
      lua: luaGenerator.workspaceToCode(editor.value.workspace),
      js: javascriptGenerator.workspaceToCode(editor.value.workspace),
      blocklyData: blocklyData,
    });
  }
};

// 处理工作区变化
const onWorkspaceChange = () => {
  updateCode();
};

const handleMessage = async (message) => {
  try {
    if (!message.data || !message.data.action || !message.data.from) {
      return;
    }
    if (
      message.data.from !== "script.meta.web" &&
      message.data.from !== "script.verse.web"
    ) {
      return;
    }

    const action = message.data.action;
    const data = message.data.data;

    if (action === "init") {      
      console.log("blockly-init received");
      initPayload.value = data;
      tryInit();
    } else if (action === "user-info") {
      console.log("blockly-user-info received", data);
      userInfo.value = data;
      isUserInfoReady.value = true;
      console.log("blockly-userInfo updated", userInfo.value);
      tryInit();
    } else if (action === "save") {
      save(data);
    }
  } catch (e) {
    console.error(e);
  }
};
onMounted(async () => {
  await window.addEventListener("message", handleMessage);
  await postMessage("ready");
});

let oldValue = null;
const editor = ref();
const code = ref({
  lua: "",
  javascript: "",
});

let options = ref();

function luaCode() {
  if (editor.value && editor.value.workspace) {
    console.log("foo.value.workspace", editor.value.workspace);
    const blockCount = editor.value.workspace.getAllBlocks(false).length;
    if (blockCount === 0) {
      console.log("工作区为空，无法生成 Lua 代码");
      code.value.lua = "";
    } else {
      code.value.lua = luaGenerator.workspaceToCode(editor.value.workspace);
      console.log("Lua 代码：", code.value);
    }
  }
}

function jsCode() {
  if (editor.value && editor.value.workspace) {
    const blockCount = editor.value.workspace.getAllBlocks(false).length;
    if (blockCount === 0) {
      console.log("工作区为空，无法生成 JavaScript 代码");
      code.value.javascript = "";
    } else {
      code.value.javascript = javascriptGenerator.workspaceToCode(
        editor.value.workspace
      );
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
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
</style>
