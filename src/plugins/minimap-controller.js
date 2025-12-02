import { reactive, toRaw } from "vue";
import { PositionedMinimap } from "@blockly/workspace-minimap";

export class MinimapController {
  constructor() {
    // 响应式状态，供 Vue 模板使用
    this.state = reactive({
      isVisible: false, // 地图是否显示
      isEnoughSpace: true, // 高度是否足够
      isHoveringBtn: false, // 鼠标是否在按钮上
    });

    this.minimapPlugin = null;
    this.workspace = null;
    this.blocklyDiv = null;
    this.graceTimer = null;
    this.resizeObserver = null;
    this.SAFE_HEIGHT = 550;
  }

  init(workspace, blocklyDiv, options) {
    if (options.minimap === false) return;

    this.workspace = workspace;
    this.blocklyDiv = blocklyDiv;

    try {
      // 初始化 Blockly 插件
      this.minimapPlugin = new PositionedMinimap(workspace);
      this.minimapPlugin.init();

      // 获取地图 DOM (Blockly 生成的)
      const mapEl = blocklyDiv.querySelector(".blockly-minimap");
      if (mapEl) {
        mapEl.classList.add("minimap-hidden"); // 初始隐藏
        this._bindDomEvents(mapEl);
        this._startResizeObserver();
      }
    } catch (e) {
      console.error("Minimap init failed:", e);
    }
  }

  // --- 交互逻辑 ---

  show() {
    if (!this.state.isEnoughSpace) return;
    this._clearTimer();
    this.state.isVisible = true;
    this._toggleDom(true);
  }

  hide(delay = 0) {
    this._clearTimer();
    if (delay > 0) {
      this.graceTimer = setTimeout(() => {
        this.state.isVisible = false;
        this._toggleDom(false);
      }, delay);
    } else {
      this.state.isVisible = false;
      this._toggleDom(false);
    }
  }

  // --- 内部私有方法 ---

  _toggleDom(show) {
    const mapEl = this.blocklyDiv?.querySelector(".blockly-minimap");
    if (mapEl) {
      if (show) mapEl.classList.remove("minimap-hidden");
      else mapEl.classList.add("minimap-hidden");
    }
  }

  _bindDomEvents(mapEl) {
    // 鼠标移入地图：保持显示
    mapEl.addEventListener("mouseenter", () => this._clearTimer());
    // 鼠标移出地图：立即隐藏
    mapEl.addEventListener("mouseleave", () => this.hide(0));
  }

  _startResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        this.state.isEnoughSpace = height >= this.SAFE_HEIGHT;
        if (!this.state.isEnoughSpace) this.hide(0);
      }
    });
    this.resizeObserver.observe(this.blocklyDiv);
  }

  _clearTimer() {
    if (this.graceTimer) clearTimeout(this.graceTimer);
  }

  dispose() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this._clearTimer();
  }
}
