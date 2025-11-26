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

import { onMounted, ref, shallowRef, toRaw } from "vue";
import * as Blockly from "blockly/core";
import * as En from "blockly/msg/en";
import * as Zh from "blockly/msg/zh-hans";
import * as JA from "blockly/msg/ja";
import "blockly/blocks";
import { luaGenerator } from "blockly/lua";
import { overrideProcedureMessages } from "../localization/procedure_override";
import { localizedContextMenu } from "../localization/context_menu";
import { Multiselect } from "@mit-app-inventor/blockly-plugin-workspace-multiselect";
import { PositionedMinimap } from "@blockly/workspace-minimap";
import {Backpack} from '@blockly/workspace-backpack';
import { WorkspaceSearch } from '@blockly/plugin-workspace-search';

const urlParams = new URLSearchParams(window.location.search);
const lg = urlParams.get("language");
console.log("LG", lg);

const props = defineProps(["options"]);
const blocklyToolbox = ref();
const blocklyDiv = ref();
const workspace = shallowRef();
let multiselectPlugin = null;
let minimap = null;
let backpack = null;

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

  // 右键菜单本地化（Backpack 等插件）
  localizedContextMenu();

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
    // 注销 Select all Blocks 菜单项
    Blockly.ContextMenuRegistry.registry.unregister('workspaceSelectAll');
    console.log("multiselect plugin initialized");
  } catch (e) {
    console.error("Failed to initialize multiselect plugin:", e);
  }

  // 初始化 minimap 插件
  try {
    if (options.minimap !== false) {
      // 使用 PositionedMinimap（基于工作区布局自动定位）
      minimap = new PositionedMinimap(workspace.value);
      minimap.init();
      console.log('minimap plugin initialized');
    }
  } catch (e) {
    console.error('Failed to initialize minimap plugin:', e);
  }

  // 初始化 backpack 插件
  try{
    const backpackOptions = {
      allowEmptyBackpackOpen: true,
      useFilledBackpackImage: true,
      skipSerializerRegistration: false,
      contextMenu: {
      emptyBackpack: true,
      removeFromBackpack: true,
      copyToBackpack: true,
      copyAllToBackpack: true,
      pasteAllToBackpack: true,
      disablePreconditionChecks: false,
      },
    };
    backpack = new Backpack(workspace.value, backpackOptions);
    backpack.init();
    console.log('backpack plugin initialized');
  }catch (e){
    console.error('Failed to initialize backpack plugin:', e);
  }

  // 初始化 workspace search 插件
  try {
    const workspaceSearch = new WorkspaceSearch(workspace.value);
    workspaceSearch.init();
    console.log('workspace search plugin initialized');
  } catch (e) {
    console.error('Failed to initialize workspace search plugin:', e);
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

/* WorkspaceSearch 搜索框位置调整 - 顶部居中 */
:global(.blockly-ws-search) {
  top: 10px !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) scale(1.2); /* scale(1.2) 放大 20%，可调整 */
  transform-origin: top center; /* 以顶部中心为缩放原点 */
}

/* 搜索到的块高亮颜色 - 匹配块 */
:global(.blockly-ws-search-highlight) {
  fill: #FFD700 !important; /* 金黄色高亮 */
  stroke: #FFA500 !important; /* 橙色描边 */
}

/* 搜索到的块高亮颜色 - 当前选中块 */
:global(.blockly-ws-search-current) {
  fill: #FF6347 !important; /* 番茄红色高亮 */
  stroke: #FF4500 !important; /* 深橙红色描边 */
}
</style>
