import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/plugins/backpack-serializer", () => ({
  registerBackpackSerializer: vi.fn(),
}));

interface FlyoutMock {
  dispose: ReturnType<typeof vi.fn>;
}

interface BackpackPluginMock {
  disposeSpy: ReturnType<typeof vi.fn>;
  flyout: FlyoutMock | null;
  getFlyoutSpy: ReturnType<typeof vi.fn>;
  initSpy: ReturnType<typeof vi.fn>;
}

interface SearchPluginMock {
  disposeSpy: ReturnType<typeof vi.fn>;
  initSpy: ReturnType<typeof vi.fn>;
}

const strategyMocks = vi.hoisted(() => ({
  backpackInstances: [] as BackpackPluginMock[],
  createMultiselectController: vi.fn(),
  registerFieldMultilineInput: vi.fn(),
  searchInstances: [] as SearchPluginMock[],
  throwOnBackpackDispose: false,
  throwOnBackpackFlyoutDispose: false,
  throwOnBackpackInit: false,
  throwOnSearchDispose: false,
  throwOnSearchInit: false,
}));

vi.mock("blockly/core", () => ({}));
vi.mock("@blockly/workspace-backpack", () => ({
  Backpack: class BackpackMock {
    readonly id = "backpack";
    readonly disposeSpy = vi.fn();
    readonly initSpy = vi.fn();
    flyout: FlyoutMock | null = null;
    readonly getFlyoutSpy = vi.fn(() => this.flyout);
    private readonly workspace: {
      configureContextMenu: ((options: unknown[], event: Event) => void) | null;
      getComponentManager: () => {
        addComponent: (entry: { component: { id: string } }) => void;
      };
    };

    constructor(workspace: unknown) {
      this.workspace = workspace as typeof this.workspace;
      strategyMocks.backpackInstances.push(this);
    }

    init(): void {
      this.initSpy();
      this.workspace.getComponentManager().addComponent({ component: this });
      this.flyout = {
        dispose: vi.fn(() => {
          if (strategyMocks.throwOnBackpackFlyoutDispose) {
            throw new Error("flyout dispose failed");
          }
        }),
      };
      this.workspace.configureContextMenu = vi.fn();
      if (strategyMocks.throwOnBackpackInit) {
        throw new Error("backpack init failed");
      }
    }

    getFlyout(): FlyoutMock | null {
      return this.getFlyoutSpy();
    }

    dispose(): void {
      this.disposeSpy();
      if (strategyMocks.throwOnBackpackDispose) {
        throw new Error("backpack dispose failed");
      }
    }
  },
}));
vi.mock("@blockly/plugin-workspace-search", () => ({
  WorkspaceSearch: class WorkspaceSearchMock {
    readonly id = "workspaceSearch";
    readonly disposeSpy = vi.fn();
    readonly initSpy = vi.fn();
    private readonly workspace: {
      getComponentManager: () => {
        addComponent: (entry: { component: { id: string } }) => void;
      };
    };

    constructor(workspace: unknown) {
      this.workspace = workspace as typeof this.workspace;
      strategyMocks.searchInstances.push(this);
    }

    init(): void {
      this.initSpy();
      this.workspace.getComponentManager().addComponent({ component: this });
      if (strategyMocks.throwOnSearchInit) {
        throw new Error("search init failed");
      }
    }

    dispose(): void {
      this.disposeSpy();
      if (strategyMocks.throwOnSearchDispose) {
        throw new Error("search dispose failed");
      }
    }
  },
}));
vi.mock("@blockly/field-multilineinput", () => ({
  registerFieldMultilineInput: strategyMocks.registerFieldMultilineInput,
}));
vi.mock("@/plugins/multiselect-controller", () => ({
  createMultiselectController: strategyMocks.createMultiselectController,
}));

import type Blockly from "blockly";
import { strategies } from "@/plugins/strategies";

const createWorkspace = () => {
  const previousConfigureContextMenu = vi.fn();
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
  const harness = {
    configureContextMenu: previousConfigureContextMenu,
    getComponentManager: () => componentManager,
  };

  return {
    componentManager,
    harness,
    previousConfigureContextMenu,
    workspace: harness as unknown as Blockly.WorkspaceSvg,
  };
};

describe("plugin strategies lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    strategyMocks.backpackInstances.length = 0;
    strategyMocks.searchInstances.length = 0;
    strategyMocks.throwOnBackpackDispose = false;
    strategyMocks.throwOnBackpackFlyoutDispose = false;
    strategyMocks.throwOnBackpackInit = false;
    strategyMocks.throwOnSearchDispose = false;
    strategyMocks.throwOnSearchInit = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns idempotent cleanup and restores backpack-owned resources", () => {
    const {
      componentManager,
      harness,
      previousConfigureContextMenu,
      workspace,
    } = createWorkspace();

    const backpackController = strategies.backpack(workspace);
    const searchController = strategies.search(workspace);
    const backpack = strategyMocks.backpackInstances[0];
    const search = strategyMocks.searchInstances[0];

    expect(backpack.initSpy).toHaveBeenCalledOnce();
    expect(search.initSpy).toHaveBeenCalledOnce();
    expect(harness.configureContextMenu).not.toBe(previousConfigureContextMenu);

    backpackController?.dispose();
    backpackController?.dispose();
    searchController?.dispose();
    searchController?.dispose();

    expect(harness.configureContextMenu).toBe(previousConfigureContextMenu);
    expect(backpack.getFlyoutSpy).toHaveBeenCalledOnce();
    expect(backpack.flyout?.dispose).toHaveBeenCalledOnce();
    expect(backpack.disposeSpy).toHaveBeenCalledOnce();
    expect(search.disposeSpy).toHaveBeenCalledOnce();
    expect(componentManager.removeComponent.mock.calls).toEqual([
      ["backpack"],
      ["workspaceSearch"],
    ]);
  });

  it("isolates every backpack cleanup failure and still attempts later steps", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const {
      componentManager,
      harness,
      previousConfigureContextMenu,
      workspace,
    } = createWorkspace();
    const controller = strategies.backpack(workspace);
    const backpack = strategyMocks.backpackInstances[0];
    strategyMocks.throwOnBackpackFlyoutDispose = true;
    strategyMocks.throwOnBackpackDispose = true;
    componentManager.removeComponent.mockImplementation(() => {
      throw new Error("component cleanup failed");
    });

    expect(() => controller?.dispose()).not.toThrow();
    expect(harness.configureContextMenu).toBe(previousConfigureContextMenu);
    expect(backpack.flyout?.dispose).toHaveBeenCalledOnce();
    expect(backpack.disposeSpy).toHaveBeenCalledOnce();
    expect(componentManager.removeComponent).toHaveBeenCalledWith("backpack");
    expect(consoleError).toHaveBeenCalledTimes(3);

    expect(() => controller?.dispose()).not.toThrow();
    expect(backpack.flyout?.dispose).toHaveBeenCalledOnce();
    expect(backpack.disposeSpy).toHaveBeenCalledOnce();
  });

  it("fully cleans a partially initialized backpack", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const {
      componentManager,
      harness,
      previousConfigureContextMenu,
      workspace,
    } = createWorkspace();
    strategyMocks.throwOnBackpackInit = true;

    const controller = strategies.backpack(workspace);

    const backpack = strategyMocks.backpackInstances[0];
    expect(controller).toBeNull();
    expect(harness.configureContextMenu).toBe(previousConfigureContextMenu);
    expect(backpack.flyout?.dispose).toHaveBeenCalledOnce();
    expect(backpack.disposeSpy).toHaveBeenCalledOnce();
    expect(componentManager.removeComponent).toHaveBeenCalledWith("backpack");
    expect(consoleError).toHaveBeenCalledWith(
      "Backpack init error:",
      expect.any(Error)
    );
  });

  it("does not throw when search component removal and disposal both fail", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { componentManager, workspace } = createWorkspace();
    const controller = strategies.search(workspace);
    const search = strategyMocks.searchInstances[0];
    strategyMocks.throwOnSearchDispose = true;
    componentManager.removeComponent.mockImplementation(() => {
      throw new Error("component cleanup failed");
    });

    expect(() => controller?.dispose()).not.toThrow();
    expect(componentManager.removeComponent).toHaveBeenCalledWith(
      "workspaceSearch"
    );
    expect(search.disposeSpy).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledTimes(2);
  });

  it("isolates cleanup failures after a failed search init", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { componentManager, workspace } = createWorkspace();
    strategyMocks.throwOnSearchInit = true;
    strategyMocks.throwOnSearchDispose = true;
    componentManager.removeComponent.mockImplementation(() => {
      throw new Error("component cleanup failed");
    });

    expect(() => strategies.search(workspace)).not.toThrow();
    expect(strategyMocks.searchInstances[0].disposeSpy).toHaveBeenCalledOnce();
    expect(componentManager.removeComponent).toHaveBeenCalledWith(
      "workspaceSearch"
    );
    expect(consoleError).toHaveBeenCalledWith(
      "Search init error:",
      expect.any(Error)
    );
  });

  it("preserves a component already registered under the plugin id", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { componentManager, workspace } = createWorkspace();
    const existingComponent = { id: "workspaceSearch" };
    componentManager.addComponent({ component: existingComponent });
    componentManager.removeComponent.mockClear();

    const controller = strategies.search(workspace);

    expect(controller).toBeNull();
    expect(componentManager.getComponent("workspaceSearch")).toBe(
      existingComponent
    );
    expect(componentManager.removeComponent).not.toHaveBeenCalled();
    expect(strategyMocks.searchInstances[0].disposeSpy).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(
      "Search init error:",
      expect.any(Error)
    );
  });

  it("registers the multiline field only once", () => {
    strategies.multilineinputfield();
    strategies.multilineinputfield();

    expect(strategyMocks.registerFieldMultilineInput).toHaveBeenCalledOnce();
  });
});
