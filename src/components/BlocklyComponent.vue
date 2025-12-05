<template>
  <div class="blockly-wrapper">
    <div class="blocklyDiv" ref="blocklyDiv"></div>
    <xml ref="blocklyToolbox" style="display: none">
      <slot></slot>
    </xml>

    <!-- Minimap 按钮 -->
    <div
      v-if="minimapState.isEnoughSpace"
      class="minimap-toggle-btn"
      :class="{ 'btn-hidden': minimapState.isVisible }"
      @mouseenter="minimapActions.show"
      @click="minimapActions.show"
      @mouseleave="minimapActions.hide"
      title="Minimap"
    >
      <img src="/media/map.svg" alt="Map" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, shallowRef, toRaw } from "vue";
import * as Blockly from "blockly/core";
import "blockly/blocks";
import * as En from "blockly/msg/en";
import * as ZhCn from "blockly/msg/zh-hans";
import * as ZhTw from "blockly/msg/zh-hant";
import * as JA from "blockly/msg/ja";
import * as Th from "blockly/msg/th";

import { overrideProcedureMessages } from "../localization/procedure_override";
import { localizedContextMenu } from "../localization/context_menu";
import { usePluginManager } from "../plugins";
const { initPlugins, minimapState, minimapActions } = usePluginManager();
const props = defineProps(["options"]);
const blocklyDiv = ref();
const blocklyToolbox = ref();
const workspace = shallowRef();

defineExpose({ workspace });

// 简单的语言设置工具函数
const setupLocale = () => {
  const lg = new URLSearchParams(window.location.search).get("language");
  const localeMap = { "zh-cn": ZhCn, "zh-tw": ZhTw, en: En, ja: JA, th: Th };
  const matched = Object.keys(localeMap).find((k) => lg?.includes(k));
  if (matched) {
    Blockly.setLocale(localeMap[matched]);
  }
};

onMounted(() => {
  // 1. 多语言配置
  setupLocale();
  overrideProcedureMessages();
  localizedContextMenu();

  // 2. 注入 Blockly
  const options = props.options || {};
  if (!options.toolbox) options.toolbox = toRaw(blocklyToolbox.value);

  workspace.value = Blockly.inject(blocklyDiv.value, options);

  // 3. 一键初始化所有插件
  initPlugins(workspace.value, blocklyDiv.value, options);
});
</script>

<style scoped>
.blockly-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.blocklyDiv {
  height: 100%;
  width: 100%;
  text-align: left;
  background: #000;
}

/* --- Minimap 按钮样式 --- */
.minimap-toggle-btn {
  position: absolute;
  top: 100px;
  right: 35px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  z-index: 70;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.minimap-toggle-btn img {
  width: 100%;
  height: 100%;
  display: block;
}

.minimap-toggle-btn:hover {
  transform: scale(1.1);
}

.minimap-toggle-btn.btn-hidden {
  opacity: 0;
  pointer-events: none;
}

:global(.blockly-minimap) {
  z-index: 80 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

:global(.blockly-minimap.minimap-hidden) {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

/* --- Search 插件样式 --- */
:global(.blockly-ws-search) {
  top: 10px !important;
  left: 50% !important;
  transform: translateX(-50%) scale(1.2);
  transform-origin: top center;
}

:global(.blockly-ws-search-highlight) {
  fill: #ffd700 !important;
  stroke: #ffa500 !important;
}

:global(.blockly-ws-search-current) {
  fill: #ff6347 !important;
  stroke: #ff4500 !important;
}
</style>
