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

import { onMounted, ref, nextTick } from 'vue'
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
    const script =
      message.language === 'js'
        ? javascriptGenerator.workspaceToCode(foo.value.workspace)
        : luaGenerator.workspaceToCode(foo.value.workspace)
    postMessage('post', {
      language: message.language,
      script: script,
      data: data
    })

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
    Blockly.serialization.workspaces.load(message.data, foo.value.workspace)
  })
}
const handleMessage = async (message) => {
  try {
    //alert(message.data.action)
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
onMounted(() => {
  window.addEventListener('message', handleMessage)
  postMessage('ready')
})

let oldValue = null
const foo = ref()
const code = ref()
let options = ref()

function luaCode() {
  code.value = luaGenerator.workspaceToCode(foo.value.workspace)
}

const jsCode = () =>
  (code.value = javascriptGenerator.workspaceToCode(foo.value.workspace))
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
