<template>
  <div id="app">
    <BlocklyComponent
      v-if="options"
      id="blockly2"
      :options="options"
      ref="foo"
    ></BlocklyComponent>
    <div id="code">
      <button v-on:click="luaCode()">Show Lua</button>
      <button v-on:click="jsCode()">Show JavaScript</button>
      <pre v-html="code"></pre>
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

import { onMounted, ref } from 'vue'
import BlocklyComponent from './components/BlocklyComponent.vue'
import './blocks/stocks'
import * as Custom from './custom'
import { javascriptGenerator } from 'blockly/javascript'
import { luaGenerator } from 'blockly/lua'
window.URL = window.URL || window.webkitURL
window.BlobBuilder =
  window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder
const init = (message) => {
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
}
const handleMessage = async (message) => {
  try {
    const data = JSON.parse(message.data)
    if (data.type === 'init') {
      init(data.message)
    }
  } catch (e) {
    console.error(message)
    console.error(e)
  }
}
onMounted(() => {
  window.parent.postMessage(JSON.stringify({ type: 'ready' }), '*')
  window.parent.postMessage(
    JSON.stringify({
      type: 'init',
      message: {
        language: ['lua', 'js'],
        style: ['base', 'meta'],
        parameters: []
      }
    }),
    '*'
  )
  window.addEventListener('message', handleMessage)
})

const foo = ref()
const code = ref()
let options = ref()

/*
: `<xml>
          <category name="Logic" colour="%{BKY_LOGIC_HUE}">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="logic_operation"></block>
            <block type="logic_negate"></block>
            <block type="logic_boolean"></block>
          </category>
          <category name="Loops" colour="%{BKY_LOOPS_HUE}">
            <block type="controls_repeat_ext">
              <value name="TIMES">
                <block type="math_number">
                  <field name="NUM">10</field>
                </block>
              </value>
            </block>
            <block type="controls_whileUntil"></block>
          </category>
          <category name="Math" colour="%{BKY_MATH_HUE}">
            <block type="math_number">
              <field name="NUM">123</field>
            </block>
            <block type="math_arithmetic"></block>
            <block type="math_single"></block>
          </category>
          <category name="Text" colour="%{BKY_TEXTS_HUE}">
            <block type="text"></block>
            <block type="text_length"></block>
            <block type="text_print"></block>
          </category>
          <category name="Variables" custom="VARIABLE" colour="%{BKY_VARIABLES_HUE}">
            </category>
          <category name="Stocks" colour="%{BKY_LOOPS_HUE}">
            <block type="stock_buy_simple"></block>
            <block type="stock_buy_prog"></block>
            <block type="stock_fetch_price"></block>
          </category>
        </xml>`
         */
const luaCode = () =>
  (code.value = luaGenerator.workspaceToCode(foo.value.workspace))
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
}

#code {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 50%;
  height: 100%;
  margin: 0;
  background-color: beige;
}

#blockly1 {
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 50%;
}

#blockly2 {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50%;
  height: 100%;
}
</style>
