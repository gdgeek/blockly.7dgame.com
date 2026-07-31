import { reactive } from "vue";
import { PositionedMinimap } from "@blockly/workspace-minimap";
import * as Blockly from "blockly/core";

type WorkspaceChangeListener = (event: Blockly.Events.Abstract) => void;

interface RegisteredWindowListener {
  type: string;
  listener: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

type WindowAddEventListener = (
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) => void;

const restoreOwnProperty = (
  target: object,
  property: PropertyKey,
  descriptor: PropertyDescriptor | undefined
): void => {
  if (descriptor) {
    Object.defineProperty(target, property, descriptor);
  } else {
    Reflect.deleteProperty(target, property);
  }
};

/**
 * workspace-minimap 0.3.8 only mirrors events emitted after init and does not
 * retain enough references to remove all listeners it registers. Keep the
 * compatibility workarounds local so the third-party package remains untouched.
 */
class ManagedPositionedMinimap extends PositionedMinimap {
  private readonly workspaceChangeListeners: WorkspaceChangeListener[] = [];
  private readonly windowListeners: RegisteredWindowListener[] = [];
  private disposed = false;

  override init(): void {
    this.captureListenersDuringBaseInit();
    this.loadExistingWorkspaceState();
  }

  private captureListenersDuringBaseInit(): void {
    const workspace = this.primaryWorkspace;
    const workspaceDescriptor = Object.getOwnPropertyDescriptor(
      workspace,
      "addChangeListener"
    );
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      window,
      "addEventListener"
    );
    const originalWorkspaceAddChangeListener = workspace.addChangeListener;
    const originalWindowAddEventListener =
      window.addEventListener as WindowAddEventListener;
    let workspaceMethodOverridden = false;
    let windowMethodOverridden = false;

    try {
      Object.defineProperty(workspace, "addChangeListener", {
        configurable: true,
        writable: true,
        value: (listener: WorkspaceChangeListener): WorkspaceChangeListener => {
          const registeredListener = originalWorkspaceAddChangeListener.call(
            workspace,
            listener
          );
          this.workspaceChangeListeners.push(listener);
          return registeredListener;
        },
      });
      workspaceMethodOverridden = true;

      Object.defineProperty(window, "addEventListener", {
        configurable: true,
        writable: true,
        value: (
          type: string,
          listener: EventListenerOrEventListenerObject,
          options?: boolean | AddEventListenerOptions
        ): void => {
          originalWindowAddEventListener.call(window, type, listener, options);
          this.windowListeners.push({ type, listener, options });
        },
      });
      windowMethodOverridden = true;

      super.init();
    } finally {
      if (windowMethodOverridden) {
        restoreOwnProperty(window, "addEventListener", windowDescriptor);
      }
      if (workspaceMethodOverridden) {
        restoreOwnProperty(workspace, "addChangeListener", workspaceDescriptor);
      }
    }
  }

  private loadExistingWorkspaceState(): void {
    const minimapWorkspace = this.minimapWorkspace;
    if (!minimapWorkspace) {
      throw new Error("Minimap workspace was not initialized");
    }

    const blockStates: Blockly.serialization.blocks.State[] = [];
    for (const block of this.primaryWorkspace.getTopBlocks(false)) {
      const state = Blockly.serialization.blocks.save(block, {
        addCoordinates: true,
        doFullSerialization: true,
        saveIds: true,
      });
      if (state) blockStates.push(state);
    }

    const previousEventGroup = Blockly.Events.getGroup();
    const previousRecordUndo = Blockly.Events.getRecordUndo();
    Blockly.Events.disable();
    try {
      for (const state of blockStates) {
        Blockly.serialization.blocks.append(state, minimapWorkspace, {
          recordUndo: false,
        });
      }
    } catch (error) {
      try {
        minimapWorkspace.clear();
      } catch (rollbackError) {
        console.error("Minimap state rollback failed:", rollbackError);
      }
      throw error;
    } finally {
      try {
        Blockly.Events.setGroup(previousEventGroup);
      } finally {
        try {
          Blockly.Events.setRecordUndo(previousRecordUndo);
        } finally {
          Blockly.Events.enable();
        }
      }
    }

    minimapWorkspace.zoomToFit();
    void Blockly.renderManagement
      .finishQueuedRenders()
      .then(() => {
        if (!this.disposed && this.minimapWorkspace === minimapWorkspace) {
          minimapWorkspace.zoomToFit();
        }
      })
      .catch((error: unknown) => {
        console.error("Minimap render completion failed:", error);
      });
  }

  private removeCapturedListeners(): void {
    const workspaceListeners = this.workspaceChangeListeners.splice(0);
    for (const listener of workspaceListeners) {
      try {
        this.primaryWorkspace.removeChangeListener(listener);
      } catch (error) {
        console.error("Minimap workspace listener cleanup failed:", error);
      }
    }

    const windowListeners = this.windowListeners.splice(0);
    for (const { type, listener, options } of windowListeners) {
      try {
        window.removeEventListener(type, listener, options);
      } catch (error) {
        console.error("Minimap window listener cleanup failed:", error);
      }
    }
  }

  override dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.removeCapturedListeners();
    try {
      super.dispose();
    } finally {
      // The upstream callbacks only guard on this reference being null.
      this.minimapWorkspace = null;
      this.focusRegion = null;
      this.onMouseMoveWrapper = null;
      this.onMouseDownWrapper = null;
      this.onMouseUpWrapper = null;
      this.minimapWrapper = null;
    }
  }
}

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
  private mapElement: HTMLElement | null;
  private graceTimer: ReturnType<typeof setTimeout> | null;
  private resizeObserver: ResizeObserver | null;
  private enabled: boolean;
  private readonly SAFE_HEIGHT: number;
  private readonly handleMapMouseEnter: () => void;
  private readonly handleMapMouseLeave: () => void;

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
    this.mapElement = null;
    this.graceTimer = null;
    this.resizeObserver = null;
    this.enabled = false;
    this.SAFE_HEIGHT = 550;
    this.handleMapMouseEnter = () => this._clearTimer();
    this.handleMapMouseLeave = () => this.hide(0);
  }

  init(
    workspace: Blockly.WorkspaceSvg,
    blocklyDiv: HTMLElement,
    options: MinimapOptions
  ): void {
    this.dispose();

    this.enabled = options.minimap !== false;
    if (!this.enabled) return;

    this.workspace = workspace;
    this.blocklyDiv = blocklyDiv;
    this._updateAvailableHeight(blocklyDiv.clientHeight);
    this._startResizeObserver();
  }

  // --- 交互逻辑 ---

  show(): void {
    if (!this.enabled || !this.state.isEnoughSpace) return;
    this._clearTimer();

    if (!this._ensureMinimap()) return;

    this.state.isVisible = true;
    this._toggleDom(true);
  }

  hide(delay: number = 0): void {
    this._clearTimer();
    if (delay > 0) {
      this.graceTimer = setTimeout(() => {
        this.graceTimer = null;
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
    if (this.mapElement) {
      if (show) this.mapElement.classList.remove("minimap-hidden");
      else this.mapElement.classList.add("minimap-hidden");
    }
  }

  private _bindDomEvents(mapEl: HTMLElement): void {
    // 鼠标移入地图：保持显示
    mapEl.addEventListener("mouseenter", this.handleMapMouseEnter);
    // 鼠标移出地图：立即隐藏
    mapEl.addEventListener("mouseleave", this.handleMapMouseLeave);
  }

  private _startResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          this._updateAvailableHeight(entry.contentRect.height);
        }
      }
    );
    this.resizeObserver.observe(this.blocklyDiv!);
  }

  private _updateAvailableHeight(height: number): void {
    this.state.isEnoughSpace = height >= this.SAFE_HEIGHT;
    if (!this.state.isEnoughSpace) this.hide(0);
  }

  private _ensureMinimap(): boolean {
    if (this.minimapPlugin) return true;
    if (!this.workspace || !this.blocklyDiv) return false;

    const plugin = new ManagedPositionedMinimap(this.workspace);
    try {
      plugin.init();
      this.minimapPlugin = plugin;
      this.mapElement = this._findMapElement();
      if (this.mapElement) {
        this.mapElement.classList.add("minimap-hidden");
        this._bindDomEvents(this.mapElement);
      }
      return true;
    } catch (e) {
      this._disposeMinimapPlugin(plugin);
      console.error("Minimap init failed:", e);
      return false;
    }
  }

  private _findMapElement(): HTMLElement | null {
    if (!this.workspace || !this.blocklyDiv) return null;

    const element = document.getElementById(
      `minimapWrapper${this.workspace.id}`
    );
    if (element instanceof HTMLElement) return element;

    return this.blocklyDiv.parentElement?.querySelector(
      ".blockly-minimap"
    ) as HTMLElement | null;
  }

  private _clearTimer(): void {
    if (this.graceTimer !== null) {
      clearTimeout(this.graceTimer);
      this.graceTimer = null;
    }
  }

  private _disposeMinimapPlugin(plugin: PositionedMinimap): void {
    try {
      const componentManager = this.workspace?.getComponentManager();
      if (componentManager?.getComponent("minimap") === plugin) {
        componentManager.removeComponent("minimap");
      }
    } catch (e) {
      console.error("Minimap component cleanup failed:", e);
    }

    try {
      plugin.dispose();
    } catch (e) {
      console.error("Minimap dispose failed:", e);
    }
  }

  dispose(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this._clearTimer();

    if (this.mapElement) {
      this.mapElement.removeEventListener(
        "mouseenter",
        this.handleMapMouseEnter
      );
      this.mapElement.removeEventListener(
        "mouseleave",
        this.handleMapMouseLeave
      );
    }
    this.mapElement = null;

    if (this.minimapPlugin) {
      this._disposeMinimapPlugin(this.minimapPlugin);
      this.minimapPlugin = null;
    }

    this.workspace = null;
    this.blocklyDiv = null;
    this.enabled = false;
    this.state.isVisible = false;
    this.state.isEnoughSpace = false;
  }
}
