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

    <button
      v-show="flyoutLockState.showButton"
      class="flyout-lock-btn"
      :class="{ locked: flyoutLockState.locked }"
      :style="{
        top: `${flyoutLockState.top}px`,
        left: `${flyoutLockState.left}px`,
      }"
      :title="flyoutLockState.locked ? '解锁二级栏' : '锁定二级栏'"
      @pointerdown.stop.prevent="toggleFlyoutLock"
      @mousedown.stop.prevent
      @click.stop.prevent
      type="button"
    >
      <svg
        v-if="flyoutLockState.locked"
        class="flyout-lock-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M7 10V8a5 5 0 0 1 10 0v2"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.9"
        />
        <rect
          x="5"
          y="10"
          width="14"
          height="10"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
        />
        <circle cx="12" cy="15" r="1.2" fill="currentColor" />
      </svg>
      <svg
        v-else
        class="flyout-lock-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M8 10V8a4 4 0 1 1 8 0"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.9"
        />
        <path
          d="M16 10.5V8a4 4 0 0 0-7-2.65"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.9"
        />
        <rect
          x="5"
          y="10"
          width="14"
          height="10"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
        />
        <path
          d="M18.8 5.2 5.2 18.8"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="1.9"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, shallowRef, toRaw } from "vue";
import * as Blockly from "blockly/core";
import "blockly/blocks";
import * as En from "blockly/msg/en";
import * as ZhCn from "blockly/msg/zh-hans";
import * as ZhTw from "blockly/msg/zh-hant";
import * as JA from "blockly/msg/ja";
import * as Th from "blockly/msg/th";

import { overrideProcedureMessages } from "../localization/procedure_override";
import { overrideMathRandomRangeMessages } from "../localization/math_override";
import { localizedContextMenu } from "../localization/context_menu";
import { usePluginManager } from "../plugins";
import { useTheme } from "../composables/useTheme";

const { initPlugins, minimapState, minimapActions } = usePluginManager();
const { watchTheme } = useTheme();

interface Props {
  options?: Record<string, unknown>;
}

const props = defineProps<Props>();

const blocklyDiv = ref<HTMLDivElement | null>(null);
const blocklyToolbox = ref<HTMLElement | null>(null);
const workspace = shallowRef<Blockly.WorkspaceSvg | null>(null);
const flyoutLockState = reactive({
  locked: false,
  showButton: false,
  top: 8,
  left: 8,
});
const lastSelectedCategoryId = ref<string | null>(null);
let flyoutObserver: MutationObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let unpatchFlyoutHide: (() => void) | null = null;
let unpatchToolboxSelection: (() => void) | null = null;
let toolboxEventListener: ((event: Blockly.Events.Abstract) => void) | null = null;
let positionSyncFrame = 0;

defineExpose({ workspace });

const findCategoryById = (toolbox: unknown, id: string): unknown => {
  const getToolboxItems = (toolbox as { getToolboxItems?: () => unknown[] })
    .getToolboxItems;
  if (typeof getToolboxItems !== "function") return null;
  const items = getToolboxItems.call(toolbox);
  return (
    items.find((item) => {
      const getId = (item as { getId?: () => string }).getId;
      return typeof getId === "function" && getId.call(item) === id;
    }) ?? null
  );
};

const getWorkspaceFlyout = (): {
  isVisible: () => boolean;
  getX: () => number;
  getY: () => number;
  getWidth: () => number;
} | null => {
  if (!workspace.value) return null;
  const toolbox = workspace.value.getToolbox?.();
  if (!toolbox) return null;
  const flyout = (toolbox as { getFlyout?: () => unknown }).getFlyout?.();
  if (!flyout) return null;

  const typedFlyout = flyout as {
    isVisible?: () => boolean;
    getX?: () => number;
    getY?: () => number;
    getWidth?: () => number;
  };

  if (
    typeof typedFlyout.isVisible !== "function" ||
    typeof typedFlyout.getX !== "function" ||
    typeof typedFlyout.getY !== "function" ||
    typeof typedFlyout.getWidth !== "function"
  ) {
    return null;
  }

  return {
    isVisible: typedFlyout.isVisible.bind(flyout),
    getX: typedFlyout.getX.bind(flyout),
    getY: typedFlyout.getY.bind(flyout),
    getWidth: typedFlyout.getWidth.bind(flyout),
  };
};

const refreshLockButtonPosition = (): void => {
  const wrapper = blocklyDiv.value?.parentElement;
  const flyout = getWorkspaceFlyout();
  if (!(wrapper instanceof HTMLElement) || !flyout) {
    flyoutLockState.showButton = false;
    return;
  }

  const flyoutVisible = flyout.isVisible();
  flyoutLockState.showButton = flyoutVisible;

  if (!flyoutLockState.showButton) return;

  const buttonSize = 26;
  const margin = 8;
  const wrapperWidth = wrapper.clientWidth;
  const flyoutTop = flyout.getY();
  const flyoutLeft = flyout.getX();
  const flyoutRight = flyoutLeft + flyout.getWidth();
  const outsideLeft = flyoutRight + margin;
  const insideLeft = flyoutRight - buttonSize - margin;

  flyoutLockState.top = Math.max(8, flyoutTop + 8);
  flyoutLockState.left =
    outsideLeft + buttonSize <= wrapperWidth - 8
      ? outsideLeft
      : Math.max(8, insideLeft);
};

const syncLockButtonPosition = (): void => {
  if (flyoutLockState.locked) {
    keepFlyoutOpenWhenLocked();
  }
  refreshLockButtonPosition();
  positionSyncFrame = window.requestAnimationFrame(syncLockButtonPosition);
};

const keepFlyoutOpenWhenLocked = (): void => {
  if (!flyoutLockState.locked || !lastSelectedCategoryId.value || !workspace.value)
    return;

  const toolbox = workspace.value.getToolbox?.();
  if (!toolbox) return;

  const getSelectedItem = (toolbox as { getSelectedItem?: () => unknown })
    .getSelectedItem;
  const current = typeof getSelectedItem === "function" ? getSelectedItem.call(toolbox) : null;
  const currentId =
    current && typeof (current as { getId?: () => string }).getId === "function"
      ? (current as { getId: () => string }).getId()
      : null;

  if (currentId === lastSelectedCategoryId.value) return;

  const target = findCategoryById(toolbox, lastSelectedCategoryId.value);
  const setSelectedItem = (toolbox as { setSelectedItem?: (item: unknown) => void })
    .setSelectedItem;
  if (target && typeof setSelectedItem === "function") {
    setSelectedItem.call(toolbox, target);
  }
};

const toggleFlyoutLock = (): void => {
  flyoutLockState.locked = !flyoutLockState.locked;
  if (flyoutLockState.locked) {
    keepFlyoutOpenWhenLocked();
    setTimeout(() => {
      keepFlyoutOpenWhenLocked();
      refreshLockButtonPosition();
    }, 0);
  }
  refreshLockButtonPosition();
};

const setupFlyoutLockBridge = (): void => {
  if (!workspace.value || !blocklyDiv.value) return;

  const toolbox = workspace.value.getToolbox?.();
  if (!toolbox) return;
  const selected = (toolbox as { getSelectedItem?: () => unknown }).getSelectedItem?.();
  if (selected && typeof (selected as { getId?: () => string }).getId === "function") {
    lastSelectedCategoryId.value = (selected as { getId: () => string }).getId();
  }

  const flyout = (toolbox as { getFlyout?: () => unknown }).getFlyout?.();
  if (flyout && !unpatchFlyoutHide) {
    const originalHide = (flyout as { hide?: () => void }).hide;
    if (typeof originalHide === "function") {
      const boundOriginalHide = originalHide.bind(flyout);
      (flyout as { hide: () => void }).hide = () => {
        if (flyoutLockState.locked) {
          keepFlyoutOpenWhenLocked();
          return;
        }
        boundOriginalHide();
      };
      unpatchFlyoutHide = () => {
        (flyout as { hide: () => void }).hide = originalHide.bind(flyout);
      };
    }
  }

  if (!unpatchToolboxSelection) {
    const typedToolbox = toolbox as {
      clearSelection?: () => void;
      setSelectedItem?: (item: unknown) => void;
    };
    const originalClearSelection = typedToolbox.clearSelection;
    const originalSetSelectedItem = typedToolbox.setSelectedItem;

    if (
      typeof originalClearSelection === "function" &&
      typeof originalSetSelectedItem === "function"
    ) {
      typedToolbox.clearSelection = () => {
        if (flyoutLockState.locked) {
          keepFlyoutOpenWhenLocked();
          return;
        }
        originalClearSelection.call(toolbox);
      };

      typedToolbox.setSelectedItem = (item: unknown) => {
        if (flyoutLockState.locked && item == null) {
          keepFlyoutOpenWhenLocked();
          return;
        }
        originalSetSelectedItem.call(toolbox, item);
      };

      unpatchToolboxSelection = () => {
        typedToolbox.clearSelection = originalClearSelection.bind(toolbox);
        typedToolbox.setSelectedItem = originalSetSelectedItem.bind(toolbox);
      };
    }
  }

  toolboxEventListener = (event: Blockly.Events.Abstract) => {
    const e = event as { type?: string; newItem?: string | null };
    if (e.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
      if (e.newItem) {
        lastSelectedCategoryId.value = e.newItem;
      } else if (flyoutLockState.locked) {
        keepFlyoutOpenWhenLocked();
      }
      setTimeout(refreshLockButtonPosition, 0);
    }
  };
  workspace.value.addChangeListener(toolboxEventListener);

  const flyoutEl = blocklyDiv.value.querySelector(".blocklyFlyout");
  if (flyoutEl instanceof SVGElement) {
    flyoutObserver = new MutationObserver(() => {
      refreshLockButtonPosition();
      if (flyoutLockState.locked) keepFlyoutOpenWhenLocked();
    });
    flyoutObserver.observe(flyoutEl, {
      attributes: true,
      attributeFilter: ["style", "transform", "class"],
    });
  }

  resizeObserver = new ResizeObserver(() => refreshLockButtonPosition());
  resizeObserver.observe(blocklyDiv.value);
  window.addEventListener("resize", refreshLockButtonPosition);
  if (!positionSyncFrame) {
    positionSyncFrame = window.requestAnimationFrame(syncLockButtonPosition);
  }
  setTimeout(refreshLockButtonPosition, 0);
};

// 简单的语言设置工具函数
const setupLocale = (): void => {
  const lg = new URLSearchParams(window.location.search).get("language");
  const localeMap: Record<string, typeof En> = {
    "zh-CN": ZhCn,
    "zh-TW": ZhTw,
    "en-US": En,
    "ja-JP": JA,
    "th-TH": Th,
  };
  const matched = Object.keys(localeMap).find((k: string) => lg?.includes(k));
  if (matched) {
    Blockly.setLocale(localeMap[matched]);
  }
};

onMounted(() => {
  //console.log("BlocklyComponent onMounted");
  // 1. 多语言配置
  setupLocale();
  overrideMathRandomRangeMessages();
  overrideProcedureMessages();
  localizedContextMenu();

  // 2. 注入 Blockly
  const options: Record<string, unknown> = props.options
    ? { ...props.options }
    : {};
  if (!options.toolbox) options.toolbox = toRaw(blocklyToolbox.value);

  try {
    workspace.value = Blockly.inject(
      blocklyDiv.value as HTMLDivElement,
      options
    );
    //  console.log("Blockly injected, workspace:", workspace.value);
  } catch (e) {
    // console.error("Blockly inject error:", e);
  }

  // 3. 一键初始化所有插件
  if (workspace.value) {
    try {
      initPlugins(workspace.value, blocklyDiv.value as HTMLDivElement, options);
      //console.log("Plugins initialized");
    } catch (e) {
      // console.error("Plugin init error:", e);
    }

    // 4. 监听系统深色/浅色模式切换
    watchTheme(workspace.value);
    setupFlyoutLockBridge();
  }
});

onBeforeUnmount(() => {
  flyoutObserver?.disconnect();
  flyoutObserver = null;

  resizeObserver?.disconnect();
  resizeObserver = null;

  if (workspace.value && toolboxEventListener) {
    workspace.value.removeChangeListener(toolboxEventListener);
    toolboxEventListener = null;
  }

  if (unpatchFlyoutHide) {
    unpatchFlyoutHide();
    unpatchFlyoutHide = null;
  }

  if (unpatchToolboxSelection) {
    unpatchToolboxSelection();
    unpatchToolboxSelection = null;
  }

  if (positionSyncFrame) {
    window.cancelAnimationFrame(positionSyncFrame);
    positionSyncFrame = 0;
  }

  window.removeEventListener("resize", refreshLockButtonPosition);
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
}

/* --- Minimap 按钮样式 --- */
.minimap-toggle-btn {
  position: absolute;
  top: 100px;
  right: 35px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  z-index: 15;
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

.flyout-lock-btn {
  position: absolute;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(148, 163, 184, 0.55);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  backdrop-filter: blur(8px);
  line-height: 1;
  cursor: pointer;
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 6px 16px rgba(148, 163, 184, 0.18);
  transition: all 0.18s ease;
}

.flyout-lock-btn:hover {
  border-color: rgba(14, 165, 233, 0.5);
  color: #0284c7;
  background: rgba(240, 249, 255, 0.96);
}

.flyout-lock-btn.locked {
  border-color: rgba(2, 132, 199, 0.45);
  color: #0369a1;
  background: rgba(224, 242, 254, 0.98);
}

.flyout-lock-icon {
  width: 15px;
  height: 15px;
  display: block;
}

:global(.blockly-minimap) {
  z-index: 15 !important;
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

:global(.blocklyMainBackground) {
  stroke: none !important;
}

/* 去掉 Blockly 左侧分类栏默认焦点/选中描边，保留分类色条和选中底色。 */
:global(.blocklyToolboxDiv),
:global(.blocklyToolboxDiv:focus),
:global(.blocklyToolboxDiv:focus-visible),
:global(.blocklyToolboxCategoryContainer),
:global(.blocklyToolboxCategoryContainer:focus),
:global(.blocklyToolboxCategoryContainer:focus-visible),
:global(.blocklyToolboxCategory),
:global(.blocklyToolboxCategory:focus),
:global(.blocklyToolboxCategory:focus-visible),
:global(.blocklyToolboxSelected),
:global(.blocklyToolboxSelected:focus),
:global(.blocklyToolboxSelected:focus-visible),
:global(.blocklyTreeRoot),
:global(.blocklyTreeRoot:focus),
:global(.blocklyTreeRoot:focus-visible),
:global(.blocklyTreeRow),
:global(.blocklyTreeRow:focus),
:global(.blocklyTreeRow:focus-visible),
:global(.blocklyTreeSelected),
:global(.blocklyTreeSelected:focus),
:global(.blocklyTreeSelected:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
}

:global(.blocklyToolboxDiv) {
  border: 0 !important;
}
</style>
