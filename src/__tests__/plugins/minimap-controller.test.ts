import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

interface FakeMinimapWorkspace {
  blocks: Array<Record<string, unknown>>;
  disposed: boolean;
  clear: Mock<() => void>;
  dispose: Mock<() => void>;
  zoomToFit: Mock<() => void>;
}

type FakeWorkspaceListener = (event: unknown) => void;

interface PrimaryWorkspaceMock {
  id: string;
  blocks: Array<Record<string, unknown>>;
  addChangeListener: (listener: FakeWorkspaceListener) => FakeWorkspaceListener;
  removeChangeListener: (listener: FakeWorkspaceListener) => void;
  emit: (event: unknown) => void;
  listenerCount: () => number;
  getComponentManager: () => {
    addComponent: Mock<(entry: { component: { id: string } }) => void>;
    getComponent: Mock<(id: string) => unknown>;
    removeComponent: Mock<(id: string) => void>;
  };
  getInjectionDiv: () => HTMLElement;
  getTopBlocks: (ordered: boolean) => Array<Record<string, unknown>>;
  resize: Mock<() => void>;
}

interface MinimapPluginMock {
  initSpy: Mock<() => void>;
  disposeSpy: Mock<() => void>;
  getMinimapWorkspace: () => FakeMinimapWorkspace | null;
}

const minimapMocks = vi.hoisted(() => ({
  instances: [] as MinimapPluginMock[],
  minimapWorkspaces: [] as FakeMinimapWorkspace[],
  throwOnInit: false,
  windowCallbackCount: 0,
  workspaceCallbackCount: 0,
}));

const blocklyMocks = vi.hoisted(() => ({
  append: vi.fn(),
  appendObservedEventsDisabled: false,
  disable: vi.fn(),
  enable: vi.fn(),
  eventDisableDepth: 0,
  eventGroup: "outer-group",
  eventRecordUndo: true,
  finishQueuedRenders: vi.fn(),
  getGroup: vi.fn(),
  getRecordUndo: vi.fn(),
  save: vi.fn(),
  setGroup: vi.fn(),
  setRecordUndo: vi.fn(),
  throwOnAppend: false,
}));

vi.mock("blockly/core", () => ({
  Events: {
    disable: blocklyMocks.disable,
    enable: blocklyMocks.enable,
    getGroup: blocklyMocks.getGroup,
    getRecordUndo: blocklyMocks.getRecordUndo,
    setGroup: blocklyMocks.setGroup,
    setRecordUndo: blocklyMocks.setRecordUndo,
  },
  renderManagement: {
    finishQueuedRenders: blocklyMocks.finishQueuedRenders,
  },
  serialization: {
    blocks: {
      append: blocklyMocks.append,
      save: blocklyMocks.save,
    },
  },
}));

vi.mock("@blockly/workspace-minimap", () => {
  const createMinimapWorkspace = (): FakeMinimapWorkspace => {
    const workspace: FakeMinimapWorkspace = {
      blocks: [],
      disposed: false,
      clear: vi.fn(() => {
        workspace.blocks = [];
      }),
      dispose: vi.fn(() => {
        workspace.disposed = true;
      }),
      zoomToFit: vi.fn(() => {
        if (workspace.disposed) {
          throw new Error("disposed minimap callback");
        }
      }),
    };
    minimapMocks.minimapWorkspaces.push(workspace);
    return workspace;
  };

  class PositionedMinimap {
    readonly id = "minimap";
    readonly initSpy = vi.fn<() => void>();
    readonly disposeSpy = vi.fn<() => void>();
    protected readonly primaryWorkspace: PrimaryWorkspaceMock;
    protected minimapWorkspace: FakeMinimapWorkspace | null = null;
    private focusWorkspaceListener: FakeWorkspaceListener | null = null;

    constructor(workspace: unknown) {
      this.primaryWorkspace = workspace as PrimaryWorkspaceMock;
      minimapMocks.instances.push(this);
    }

    init(): void {
      this.initSpy();
      if (minimapMocks.throwOnInit) throw new Error("init failed");

      const mapElement = document.createElement("div");
      mapElement.id = `minimapWrapper${this.primaryWorkspace.id}`;
      mapElement.className = "blockly-minimap";
      this.primaryWorkspace
        .getInjectionDiv()
        .parentElement?.appendChild(mapElement);

      const minimapWorkspace = createMinimapWorkspace();
      this.minimapWorkspace = minimapWorkspace;

      const mirrorListener: FakeWorkspaceListener = () => {
        if (minimapWorkspace.disposed) {
          throw new Error("disposed mirror callback");
        }
        minimapMocks.workspaceCallbackCount += 1;
        void Promise.resolve().then(() => {
          if (this.minimapWorkspace) {
            this.minimapWorkspace.zoomToFit();
          }
        });
      };
      this.focusWorkspaceListener = () => {
        if (minimapWorkspace.disposed) {
          throw new Error("disposed focus callback");
        }
        minimapMocks.workspaceCallbackCount += 1;
      };
      this.primaryWorkspace.addChangeListener(mirrorListener);
      this.primaryWorkspace.addChangeListener(this.focusWorkspaceListener);

      const minimapResizeListener = () => {
        if (minimapWorkspace.disposed) {
          throw new Error("disposed resize callback");
        }
        minimapMocks.windowCallbackCount += 1;
      };
      const focusResizeListener = () => {
        if (minimapWorkspace.disposed) {
          throw new Error("disposed focus resize callback");
        }
        minimapMocks.windowCallbackCount += 1;
      };
      const focusLoadListener = () => {
        if (minimapWorkspace.disposed) {
          throw new Error("disposed focus load callback");
        }
        minimapMocks.windowCallbackCount += 1;
      };
      window.addEventListener("resize", minimapResizeListener);
      window.addEventListener("resize", focusResizeListener);
      window.addEventListener("load", focusLoadListener);

      this.primaryWorkspace
        .getComponentManager()
        .addComponent({ component: this });
      this.primaryWorkspace.resize();
    }

    dispose(): void {
      this.disposeSpy();
      if (this.focusWorkspaceListener) {
        this.primaryWorkspace.removeChangeListener(this.focusWorkspaceListener);
      }
      this.minimapWorkspace?.dispose();
      document
        .getElementById(`minimapWrapper${this.primaryWorkspace.id}`)
        ?.remove();
    }

    getMinimapWorkspace(): FakeMinimapWorkspace | null {
      return this.minimapWorkspace;
    }
  }

  return { PositionedMinimap };
});

import type Blockly from "blockly";
import { MinimapController } from "@/plugins/minimap-controller";

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(private readonly callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }

  emit(height: number): void {
    this.callback(
      [{ contentRect: { height } } as unknown as ResizeObserverEntry],
      this as unknown as ResizeObserver
    );
  }
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createWorkspace = (
  blocklyDiv: HTMLElement,
  blocks: Array<Record<string, unknown>> = []
) => {
  const listeners = new Set<FakeWorkspaceListener>();
  const components = new Map<string, unknown>();
  const componentManager = {
    addComponent: vi.fn(
      ({ component }: { component: { id: string } }): void => {
        if (components.has(component.id)) {
          throw new Error(`duplicate component: ${component.id}`);
        }
        components.set(component.id, component);
      }
    ),
    getComponent: vi.fn((id: string) => components.get(id)),
    removeComponent: vi.fn((id: string) => {
      components.delete(id);
    }),
  };
  const workspace: PrimaryWorkspaceMock = {
    id: "primary-workspace",
    blocks,
    addChangeListener: vi.fn((listener: FakeWorkspaceListener) => {
      listeners.add(listener);
      return listener;
    }),
    removeChangeListener: vi.fn((listener: FakeWorkspaceListener) => {
      listeners.delete(listener);
    }),
    emit: (event: unknown) => {
      for (const listener of [...listeners]) listener(event);
    },
    listenerCount: () => listeners.size,
    getComponentManager: () => componentManager,
    getInjectionDiv: () => blocklyDiv,
    getTopBlocks: vi.fn(() => blocks),
    resize: vi.fn(),
  };

  return {
    componentManager,
    harness: workspace,
    workspace: workspace as unknown as Blockly.WorkspaceSvg,
  };
};

const createBlocklyDiv = (height = 600): HTMLElement => {
  const wrapper = document.createElement("div");
  const blocklyDiv = document.createElement("div");
  Object.defineProperty(blocklyDiv, "clientHeight", {
    configurable: true,
    value: height,
  });
  wrapper.appendChild(blocklyDiv);
  document.body.appendChild(wrapper);
  return blocklyDiv;
};

describe("MinimapController lifecycle", () => {
  const controllers: MinimapController[] = [];
  const createController = (): MinimapController => {
    const controller = new MinimapController();
    controllers.push(controller);
    return controller;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    minimapMocks.instances.length = 0;
    minimapMocks.minimapWorkspaces.length = 0;
    minimapMocks.throwOnInit = false;
    minimapMocks.windowCallbackCount = 0;
    minimapMocks.workspaceCallbackCount = 0;
    blocklyMocks.appendObservedEventsDisabled = false;
    blocklyMocks.eventDisableDepth = 0;
    blocklyMocks.eventGroup = "outer-group";
    blocklyMocks.eventRecordUndo = true;
    blocklyMocks.throwOnAppend = false;
    ResizeObserverMock.instances.length = 0;

    blocklyMocks.disable.mockImplementation(() => {
      blocklyMocks.eventDisableDepth += 1;
    });
    blocklyMocks.enable.mockImplementation(() => {
      blocklyMocks.eventDisableDepth -= 1;
    });
    blocklyMocks.getGroup.mockImplementation(() => blocklyMocks.eventGroup);
    blocklyMocks.getRecordUndo.mockImplementation(
      () => blocklyMocks.eventRecordUndo
    );
    blocklyMocks.setGroup.mockImplementation((group: unknown) => {
      blocklyMocks.eventGroup = group as string;
    });
    blocklyMocks.setRecordUndo.mockImplementation((recordUndo: unknown) => {
      blocklyMocks.eventRecordUndo = recordUndo as boolean;
    });
    blocklyMocks.save.mockImplementation((block: unknown) =>
      clone(block as Record<string, unknown>)
    );
    blocklyMocks.append.mockImplementation(
      (state: unknown, workspace: unknown) => {
        blocklyMocks.appendObservedEventsDisabled =
          blocklyMocks.eventDisableDepth > 0;
        const minimapWorkspace = workspace as FakeMinimapWorkspace;
        minimapWorkspace.blocks.push(clone(state as Record<string, unknown>));
        if (blocklyMocks.throwOnAppend) {
          minimapWorkspace.blocks.push({ id: "partial-block" });
          blocklyMocks.eventGroup = "leaked-append-group";
          blocklyMocks.eventRecordUndo = false;
          throw new Error("append failed");
        }
      }
    );
    blocklyMocks.finishQueuedRenders.mockResolvedValue(undefined);
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterEach(() => {
    for (const controller of controllers.splice(0)) controller.dispose();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it("hydrates existing blocks on the first show instead of only creating DOM", async () => {
    const existingBlocks = [
      { id: "existing-block", type: "logic_boolean", x: 24, y: 36 },
    ];
    const blocklyDiv = createBlocklyDiv();
    const { workspace } = createWorkspace(blocklyDiv, existingBlocks);
    const controller = createController();

    controller.init(workspace, blocklyDiv, {});

    expect(minimapMocks.instances).toHaveLength(0);
    expect(controller.state.isVisible).toBe(false);
    expect(ResizeObserverMock.instances[0].observe).toHaveBeenCalledWith(
      blocklyDiv
    );

    controller.show();

    const minimapWorkspace = minimapMocks.minimapWorkspaces[0];
    expect(minimapMocks.instances).toHaveLength(1);
    expect(minimapWorkspace.blocks).toEqual(existingBlocks);
    expect(blocklyMocks.save).toHaveBeenCalledWith(existingBlocks[0], {
      addCoordinates: true,
      doFullSerialization: true,
      saveIds: true,
    });
    expect(blocklyMocks.append).toHaveBeenCalledWith(
      existingBlocks[0],
      minimapWorkspace,
      { recordUndo: false }
    );
    expect(blocklyMocks.appendObservedEventsDisabled).toBe(true);
    expect(blocklyMocks.disable).toHaveBeenCalledOnce();
    expect(blocklyMocks.enable).toHaveBeenCalledOnce();
    expect(blocklyMocks.eventDisableDepth).toBe(0);
    expect(blocklyMocks.eventGroup).toBe("outer-group");
    expect(blocklyMocks.eventRecordUndo).toBe(true);
    expect(minimapWorkspace.zoomToFit).toHaveBeenCalledOnce();
    expect(controller.state.isVisible).toBe(true);
    expect(
      document
        .getElementById("minimapWrapperprimary-workspace")
        ?.classList.contains("minimap-hidden")
    ).toBe(false);

    await Promise.resolve();
    expect(minimapWorkspace.zoomToFit).toHaveBeenCalledTimes(2);

    controller.show();
    expect(minimapMocks.instances).toHaveLength(1);
  });

  it("keeps the existing hover grace behavior after lazy initialization", () => {
    vi.useFakeTimers();
    const blocklyDiv = createBlocklyDiv();
    const { workspace } = createWorkspace(blocklyDiv);
    const controller = createController();
    controller.init(workspace, blocklyDiv, {});
    controller.show();

    const mapElement = document.getElementById(
      "minimapWrapperprimary-workspace"
    ) as HTMLElement;
    controller.hide(300);
    mapElement.dispatchEvent(new MouseEvent("mouseenter"));
    vi.advanceTimersByTime(300);
    expect(controller.state.isVisible).toBe(true);

    mapElement.dispatchEvent(new MouseEvent("mouseleave"));
    expect(controller.state.isVisible).toBe(false);
    expect(mapElement.classList.contains("minimap-hidden")).toBe(true);
  });

  it("does not initialize when disabled or when the workspace is too short", () => {
    const disabledDiv = createBlocklyDiv();
    const { workspace: disabledWorkspace } = createWorkspace(disabledDiv);
    const disabledController = createController();
    disabledController.init(disabledWorkspace, disabledDiv, {
      minimap: false,
    });
    disabledController.show();

    expect(minimapMocks.instances).toHaveLength(0);
    expect(disabledController.state.isEnoughSpace).toBe(false);

    const shortDiv = createBlocklyDiv(400);
    const { workspace: shortWorkspace } = createWorkspace(shortDiv);
    const shortController = createController();
    shortController.init(shortWorkspace, shortDiv, {});
    shortController.show();

    expect(minimapMocks.instances).toHaveLength(0);
    expect(shortController.state.isEnoughSpace).toBe(false);
  });

  it("disposes observers, the registered component, and the lazy plugin", () => {
    vi.useFakeTimers();
    const blocklyDiv = createBlocklyDiv();
    const { componentManager, workspace } = createWorkspace(blocklyDiv);
    const controller = createController();
    controller.init(workspace, blocklyDiv, {});
    controller.show();
    controller.hide(300);

    const plugin = minimapMocks.instances[0];
    const resizeObserver = ResizeObserverMock.instances[0];
    controller.dispose();

    expect(resizeObserver.disconnect).toHaveBeenCalledOnce();
    expect(componentManager.removeComponent).toHaveBeenCalledWith("minimap");
    expect(plugin.disposeSpy).toHaveBeenCalledOnce();
    expect(plugin.getMinimapWorkspace()).toBeNull();
    expect(controller.state.isVisible).toBe(false);
    expect(controller.state.isEnoughSpace).toBe(false);

    vi.advanceTimersByTime(300);
    expect(plugin.disposeSpy).toHaveBeenCalledOnce();
  });

  it("removes every workspace and window listener captured during init", async () => {
    const blocklyDiv = createBlocklyDiv();
    const { harness, workspace } = createWorkspace(blocklyDiv);
    const controller = createController();
    controller.init(workspace, blocklyDiv, {});
    controller.show();

    harness.emit({ type: "block_move" });
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("load"));

    expect(harness.listenerCount()).toBe(2);
    expect(minimapMocks.workspaceCallbackCount).toBe(2);
    expect(minimapMocks.windowCallbackCount).toBe(3);

    controller.dispose();
    const workspaceCallbackCount = minimapMocks.workspaceCallbackCount;
    const windowCallbackCount = minimapMocks.windowCallbackCount;
    const zoomCallCount =
      minimapMocks.minimapWorkspaces[0].zoomToFit.mock.calls.length;

    expect(harness.listenerCount()).toBe(0);
    expect(() => harness.emit({ type: "block_move" })).not.toThrow();
    expect(() => window.dispatchEvent(new Event("resize"))).not.toThrow();
    expect(() => window.dispatchEvent(new Event("load"))).not.toThrow();
    await Promise.resolve();
    expect(minimapMocks.workspaceCallbackCount).toBe(workspaceCallbackCount);
    expect(minimapMocks.windowCallbackCount).toBe(windowCallbackCount);
    expect(minimapMocks.minimapWorkspaces[0].zoomToFit).toHaveBeenCalledTimes(
      zoomCallCount
    );
  });

  it("rolls back a failed initial state load and restores the event counter", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    blocklyMocks.throwOnAppend = true;
    const blocklyDiv = createBlocklyDiv();
    const { componentManager, harness, workspace } = createWorkspace(
      blocklyDiv,
      [{ id: "existing-block", type: "logic_boolean" }]
    );
    const controller = createController();
    controller.init(workspace, blocklyDiv, {});

    controller.show();

    const plugin = minimapMocks.instances[0];
    const minimapWorkspace = minimapMocks.minimapWorkspaces[0];
    expect(minimapWorkspace.clear).toHaveBeenCalledOnce();
    expect(minimapWorkspace.blocks).toEqual([]);
    expect(blocklyMocks.disable).toHaveBeenCalledOnce();
    expect(blocklyMocks.enable).toHaveBeenCalledOnce();
    expect(blocklyMocks.eventDisableDepth).toBe(0);
    expect(blocklyMocks.eventGroup).toBe("outer-group");
    expect(blocklyMocks.eventRecordUndo).toBe(true);
    expect(harness.listenerCount()).toBe(0);
    expect(componentManager.removeComponent).toHaveBeenCalledWith("minimap");
    expect(plugin.disposeSpy).toHaveBeenCalledOnce();
    expect(controller.state.isVisible).toBe(false);
    expect(consoleError).toHaveBeenCalledWith(
      "Minimap init failed:",
      expect.any(Error)
    );
  });

  it("does not remove a pre-existing component when minimap init collides", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const blocklyDiv = createBlocklyDiv();
    const { componentManager, harness, workspace } =
      createWorkspace(blocklyDiv);
    const existingComponent = { id: "minimap" };
    componentManager.addComponent({ component: existingComponent });
    componentManager.removeComponent.mockClear();
    const controller = createController();
    controller.init(workspace, blocklyDiv, {});

    controller.show();

    expect(componentManager.getComponent("minimap")).toBe(existingComponent);
    expect(componentManager.removeComponent).not.toHaveBeenCalled();
    expect(minimapMocks.instances[0].disposeSpy).toHaveBeenCalledOnce();
    expect(harness.listenerCount()).toBe(0);
    expect(controller.state.isVisible).toBe(false);
    expect(consoleError).toHaveBeenCalledWith(
      "Minimap init failed:",
      expect.any(Error)
    );
  });

  it("keeps the minimap hidden and cleans up a failed base init", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    minimapMocks.throwOnInit = true;
    const blocklyDiv = createBlocklyDiv();
    const { harness, workspace } = createWorkspace(blocklyDiv);
    const controller = createController();
    controller.init(workspace, blocklyDiv, {});

    controller.show();

    const plugin = minimapMocks.instances[0];
    expect(plugin.disposeSpy).toHaveBeenCalledOnce();
    expect(harness.listenerCount()).toBe(0);
    expect(controller.state.isVisible).toBe(false);
    expect(consoleError).toHaveBeenCalledWith(
      "Minimap init failed:",
      expect.any(Error)
    );
  });
});
