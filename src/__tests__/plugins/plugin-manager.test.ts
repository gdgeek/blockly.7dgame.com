import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";

const pluginMocks = vi.hoisted(() => ({
  backpack: vi.fn(),
  createWorkspaceControlHints: vi.fn(),
  minimapInstances: [] as unknown[],
  multilineinputfield: vi.fn(),
  multiselect: vi.fn(),
  search: vi.fn(),
}));

vi.mock("@/plugins/strategies", () => ({
  strategies: {
    backpack: pluginMocks.backpack,
    multilineinputfield: pluginMocks.multilineinputfield,
    multiselect: pluginMocks.multiselect,
    search: pluginMocks.search,
  },
}));

vi.mock("@/plugins/workspace-control-hints", () => ({
  createWorkspaceControlHints: pluginMocks.createWorkspaceControlHints,
}));

vi.mock("@/plugins/minimap-controller", () => ({
  MinimapController: class MinimapControllerMock {
    readonly state = {
      isEnoughSpace: true,
      isHoveringBtn: false,
      isVisible: false,
    };

    readonly dispose = vi.fn();
    readonly hide = vi.fn();
    readonly init = vi.fn();
    readonly show = vi.fn();

    constructor() {
      pluginMocks.minimapInstances.push(this);
    }
  },
}));

import type Blockly from "blockly";
import { usePluginManager } from "@/plugins";

interface DisposableMock {
  dispose: ReturnType<typeof vi.fn>;
}

interface MinimapControllerMock {
  dispose: ReturnType<typeof vi.fn>;
  init: ReturnType<typeof vi.fn>;
}

const disposable = (): DisposableMock => ({ dispose: vi.fn() });

describe("plugin manager lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pluginMocks.minimapInstances.length = 0;
  });

  it("initializes once per workspace and disposes every managed plugin", () => {
    const backpack = disposable();
    const multiselect = disposable();
    const search = disposable();
    const hints = disposable();
    pluginMocks.backpack.mockReturnValue(backpack);
    pluginMocks.multiselect.mockReturnValue(multiselect);
    pluginMocks.search.mockReturnValue(search);
    pluginMocks.createWorkspaceControlHints.mockReturnValue(hints);

    let manager: ReturnType<typeof usePluginManager> | null = null;
    const wrapper = mount(
      defineComponent({
        setup() {
          manager = usePluginManager();
          return () => null;
        },
      })
    );
    const workspace = { id: "workspace-1" } as Blockly.WorkspaceSvg;
    const blocklyDiv = document.createElement("div");
    manager!.initPlugins(workspace, blocklyDiv, {});
    manager!.initPlugins(workspace, blocklyDiv, {});

    const minimap = pluginMocks.minimapInstances[0] as MinimapControllerMock;
    expect(pluginMocks.backpack).toHaveBeenCalledOnce();
    expect(pluginMocks.multiselect).toHaveBeenCalledOnce();
    expect(pluginMocks.search).toHaveBeenCalledOnce();
    expect(pluginMocks.multilineinputfield).toHaveBeenCalledOnce();
    expect(pluginMocks.createWorkspaceControlHints).toHaveBeenCalledOnce();
    expect(minimap.init).toHaveBeenCalledOnce();

    wrapper.unmount();

    expect(hints.dispose).toHaveBeenCalledOnce();
    expect(minimap.dispose).toHaveBeenCalledOnce();
    expect(search.dispose).toHaveBeenCalledOnce();
    expect(multiselect.dispose).toHaveBeenCalledOnce();
    expect(backpack.dispose).toHaveBeenCalledOnce();
  });

  it("keeps multiselect opt-out behavior unchanged", () => {
    pluginMocks.backpack.mockReturnValue(disposable());
    pluginMocks.search.mockReturnValue(disposable());
    pluginMocks.createWorkspaceControlHints.mockReturnValue(disposable());

    let manager: ReturnType<typeof usePluginManager> | null = null;
    const wrapper = mount(
      defineComponent({
        setup() {
          manager = usePluginManager();
          return () => null;
        },
      })
    );
    manager!.initPlugins(
      { id: "workspace-2" } as Blockly.WorkspaceSvg,
      document.createElement("div"),
      { multiselect: false }
    );

    expect(pluginMocks.multiselect).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
