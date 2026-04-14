import { reactive } from "vue";
import { PositionedMinimap } from "@blockly/workspace-minimap";
import type Blockly from "blockly";

interface MinimapState {
  isVisible: boolean;
  isEnoughSpace: boolean;
  isHoveringBtn: boolean;
}

interface MinimapOptions {
  minimap?: boolean;
  [key: string]: unknown;
}

export class MinimapController {
  state: MinimapState;
  private minimapPlugin: PositionedMinimap | null;
  private workspace: Blockly.WorkspaceSvg | null;
  private blocklyDiv: HTMLElement | null;
  private graceTimer: ReturnType<typeof setTimeout> | null;
  private resizeObserver: ResizeObserver | null;
  private readonly SAFE_HEIGHT: number;

  constructor() {
    // 响应式状态，供 Vue 模板使用
    this.state = reactive<MinimapState>({
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

  init(
    workspace: Blockly.WorkspaceSvg,
    blocklyDiv: HTMLElement,
    options: MinimapOptions
  ): void {
    if (options.minimap === false) return;

    this.workspace = workspace;
    this.blocklyDiv = blocklyDiv;

    try {
      // 初始化 Blockly 插件
      this.minimapPlugin = new PositionedMinimap(workspace);
      this.minimapPlugin.init();

      // 获取地图 DOM (Blockly 生成的)
      const mapEl = blocklyDiv.querySelector(
        ".blockly-minimap"
      ) as HTMLElement | null;
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

  show(): void {
    if (!this.state.isEnoughSpace) return;
    this._clearTimer();
    this.state.isVisible = true;
    this._toggleDom(true);
  }

  hide(delay: number = 0): void {
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

  private _toggleDom(show: boolean): void {
    const mapEl = this.blocklyDiv?.querySelector(
      ".blockly-minimap"
    ) as HTMLElement | null;
    if (mapEl) {
      if (show) mapEl.classList.remove("minimap-hidden");
      else mapEl.classList.add("minimap-hidden");
    }
  }

  private _bindDomEvents(mapEl: HTMLElement): void {
    // 鼠标移入地图：保持显示
    mapEl.addEventListener("mouseenter", () => this._clearTimer());
    // 鼠标移出地图：立即隐藏
    mapEl.addEventListener("mouseleave", () => this.hide(0));
  }

  private _startResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          this.state.isEnoughSpace = height >= this.SAFE_HEIGHT;
          if (!this.state.isEnoughSpace) this.hide(0);
        }
      }
    );
    this.resizeObserver.observe(this.blocklyDiv!);
  }

  private _clearTimer(): void {
    if (this.graceTimer) clearTimeout(this.graceTimer);
  }

  dispose(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this._clearTimer();
  }
}
