<template>
  <div>
    <div class="blocklyDiv" style="background: #000" ref="blocklyDiv"></div>
    <xml ref="blocklyToolbox" style="display: none">
      <slot></slot>
    </xml>
  </div>
</template>
<script setup>
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly Vue Component.
 * @author dcoodien@gmail.com (Dylan Coodien)
 */

import { onMounted, onBeforeUnmount, ref, shallowRef, toRaw } from "vue";
import * as Blockly from "blockly/core";
import * as En from "blockly/msg/en";
import * as Zh from "blockly/msg/zh-hans";
import * as JA from "blockly/msg/ja";
import "blockly/blocks";
import { luaGenerator } from "blockly/lua";
import { overrideProcedureMessages } from "../localization/procedure_override";
import { Multiselect } from "@mit-app-inventor/blockly-plugin-workspace-multiselect";

const urlParams = new URLSearchParams(window.location.search);
const lg = urlParams.get("language");
console.log("LG", lg);

const props = defineProps(["options"]);
const blocklyToolbox = ref();
const blocklyDiv = ref();
const workspace = shallowRef();
let multiselectPlugin = null;

defineExpose({ workspace });
onMounted(() => {
  if (lg && lg.includes("zh-cn")) {
    Blockly.setLocale(Zh);
  } else if (lg && lg.includes("en")) {
    Blockly.setLocale(En);
  } else if (lg && lg.includes("ja")) {
    Blockly.setLocale(JA);
  }
  
  // 覆盖函数模块的本地化文本
  overrideProcedureMessages();

  const options = props.options || {};
  if (!options.toolbox) {
    // options.toolbox = blocklyToolbox.value;
    options.toolbox = toRaw(blocklyToolbox.value); // 将代理对象转换为原始对象
  }
  console.log("工具箱内容", options.toolbox);
  workspace.value = Blockly.inject(blocklyDiv.value, options);

  // 初始化 multiselect 插件
  try {
    const pluginOptions = Object.assign({}, options, {
      // Shift 键作为多选模式开关
      multiSelectKeys: ['Shift'],
      // 为多选控件使用自定义图标。
    multiselectIcon : { 
    hideIcon : false , 
    weight : 3 , 
    enabledIcon : '/media/select.svg' , 
    disabledIcon : '/media/unselect.svg' , 
  } , 
    });
    multiselectPlugin = new Multiselect(workspace.value);
    multiselectPlugin.init(pluginOptions);
    console.log("multiselect plugin initialized");
  } catch (e) {
    console.error("Failed to initialize multiselect plugin:", e);
  }
});

onBeforeUnmount(() => {
  try {
    if (multiselectPlugin && typeof multiselectPlugin.dispose === 'function') {
      multiselectPlugin.dispose();
      multiselectPlugin = null;
    }
  } catch (e) {
    console.error('Error disposing multiselect plugin', e);
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.blocklyDiv {
  height: 100%;
  width: 100%;
  text-align: left;
}
</style>
