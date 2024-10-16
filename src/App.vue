<template>
  <div id="app">
    <BlocklyComponent
      v-if="options"
      id="blockly"
      :options="options"
      ref="foo"
    ></BlocklyComponent>
    <div v-else>7d game</div>
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

import { onMounted, ref, nextTick, watch } from 'vue'
import * as Blockly from 'blockly'
import BlocklyComponent from './components/BlocklyComponent.vue'
import './blocks/stocks'
import * as Custom from './custom'
import { javascriptGenerator } from 'blockly/javascript'
import { luaGenerator } from 'blockly/lua'
window.URL = window.URL || window.webkitURL
window.BlobBuilder =
  window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder
const postMessage = (action, data = {}) => {
  window.parent.postMessage({ action, data, from: 'script.blockly' }, '*')
}

const save = (message) => {
  const data = Blockly.serialization.workspaces.save(foo.value.workspace)
  if (JSON.stringify(data) == JSON.stringify(oldValue)) {
    postMessage('post:no-change')
  } else {
    postMessage('post', {
      js: javascriptGenerator.workspaceToCode(foo.value.workspace),
      lua: luaGenerator.workspaceToCode(foo.value.workspace),
      data: data
    })
    //alert(luaGenerator.workspaceToCode(foo.value.workspace))

    oldValue = data
  }
}
const init = (message) => {
  console.error('init', message)
  const toolbox = Custom.setup(message.style, message.parameters)
  options.value = {
    media: 'media/',
    grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
    toolbox,
    move: {
      scrollbars: {
        horizontal: false,
        vertical: true
      },
      drag: true,
      wheel: false
    },
    zoom: {
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      controls: true,
      wheel: true,
      pinch: true
    }
  }
  nextTick(() => {
    oldValue = message.data

    console.error(message.data)
    Blockly.serialization.workspaces.load(message.data, foo.value.workspace)

    // const allBlocks = foo.value.workspace.getAllBlocks(false);
    // console.log("初始化工作区块内容", allBlocks); // 打印工作区的块内容
    // allBlocks.forEach((block) => {
    //   const blockLuaCode = luaGenerator.blockToCode(block);
    //   console.log(`块类型: ${block.type}, Lua 代码: ${blockLuaCode}`);
    // });

    // 添加工作区变化的监听器
    foo.value.workspace.addChangeListener(onWorkspaceChange)
    updateCode()
  })
}

// 更新 Lua 代码并发送到主页面
const updateCode = () => {
  if (foo.value && foo.value.workspace) {
    console.log('更新Lua 代码：', code.value.lua)
    postMessage('update', {
      lua: luaGenerator.workspaceToCode(foo.value.workspace),
      js: javascriptGenerator.workspaceToCode(foo.value.workspace)
    })
  }
}

// 处理工作区变化
const onWorkspaceChange = () => {
  updateCode()
}

const handleMessage = async (message) => {
  try {
    if (!message.data || !message.data.action || !message.data.from) {
      return
    }
    if (
      message.data.from !== 'script.meta.web' &&
      message.data.from !== 'script.verse.web'
    ) {
      return
    }

    const action = message.data.action
    const data = message.data.data

    if (action === 'init') {
      init(data)
    } else if (action === 'save') {
      save(data)
    }
  } catch (e) {
    console.error(e)
  }
}
onMounted(async () => {
  await window.addEventListener('message', handleMessage)
  await postMessage('ready')
})

let oldValue = null
const foo = ref()
const code = ref({
  lua: '',
  javascript: ''
})

let options = ref()

function luaCode() {
  if (foo.value && foo.value.workspace) {
    console.log('foo.value.workspace', foo.value.workspace)
    const blockCount = foo.value.workspace.getAllBlocks(false).length
    if (blockCount === 0) {
      console.log('工作区为空，无法生成 Lua 代码')
      code.value.lua = ''
    } else {
      code.value.lua = luaGenerator.workspaceToCode(foo.value.workspace)
      console.log('Lua 代码：', code.value)
    }
  }
}

function jsCode() {
  if (foo.value && foo.value.workspace) {
    const blockCount = foo.value.workspace.getAllBlocks(false).length
    if (blockCount === 0) {
      console.log('工作区为空，无法生成 JavaScript 代码')
      code.value.javascript = ''
    } else {
      code.value.javascript = javascriptGenerator.workspaceToCode(
        foo.value.workspace
      )
      console.log('JavaScript 代码：', code.value)
    }
  }
}

defineExpose({
  code
})
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
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
