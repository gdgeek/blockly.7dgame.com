import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface MultiselectPluginMock {
  disposeSpy: ReturnType<typeof vi.fn>;
  initSpy: ReturnType<typeof vi.fn>;
  workspace: unknown;
}

const blocklyMocks = vi.hoisted(() => ({
  originalSetSelected: vi.fn(),
}));

const multiselectMocks = vi.hoisted(() => ({
  instances: [] as MultiselectPluginMock[],
  throwOnInit: false,
}));

vi.mock("blockly/core", () => ({
  common: {
    setSelected: blocklyMocks.originalSetSelected,
  },
}));

vi.mock("@gdgeek/blockly-plugin-workspace-multiselect", () => ({
  Multiselect: class MultiselectMock {
    readonly disposeSpy = vi.fn();
    readonly initSpy = vi.fn((_options: unknown) => {
      if (multiselectMocks.throwOnInit) throw new Error("init failed");
    });
    readonly workspace: unknown;

    constructor(workspace: unknown) {
      this.workspace = workspace;
      multiselectMocks.instances.push(this);
    }

    init(options: unknown): void {
      this.initSpy(options);
    }

    dispose(): void {
      this.disposeSpy();
    }
  },
}));

import * as Blockly from "blockly/core";
import { createMultiselectController } from "@/plugins/multiselect-controller";

const createWorkspace = () => {
  const injectionDiv = document.createElement("div");
  const getInjectionDiv = vi.fn(() => injectionDiv);
  const addChangeListener = vi.fn();

  return {
    addChangeListener,
    getInjectionDiv,
    injectionDiv,
    workspace: {
      addChangeListener,
      getInjectionDiv,
      id: "workspace-1",
    } as unknown as Blockly.WorkspaceSvg,
  };
};

describe("multiselect controller", () => {
  let controller: ReturnType<typeof createMultiselectController> = null;

  beforeEach(() => {
    vi.clearAllMocks();
    multiselectMocks.instances.length = 0;
    multiselectMocks.throwOnInit = false;
  });

  afterEach(() => {
    controller?.dispose();
    controller = null;
    vi.restoreAllMocks();
  });

  it("initializes the plugin once with the application options", () => {
    const { workspace } = createWorkspace();

    controller = createMultiselectController(workspace);

    expect(controller).not.toBeNull();
    expect(multiselectMocks.instances).toHaveLength(1);
    expect(multiselectMocks.instances[0].workspace).toBe(workspace);
    expect(multiselectMocks.instances[0].initSpy).toHaveBeenCalledOnce();
    expect(multiselectMocks.instances[0].initSpy).toHaveBeenCalledWith({
      useDoubleClick: false,
      bumpNeighbours: true,
      multiFieldUpdate: false,
      workspaceAutoFocus: false,
      multiSelectKeys: ["Shift"],
      multiselectCopyPaste: {
        crossTab: false,
        menu: true,
      },
      multiselectIcon: {
        hideIcon: true,
      },
    });
  });

  it("forwards disposal to the plugin exactly once", () => {
    const { workspace } = createWorkspace();

    controller = createMultiselectController(workspace);
    const plugin = multiselectMocks.instances[0];

    controller?.dispose();
    controller?.dispose();

    expect(plugin.disposeSpy).toHaveBeenCalledOnce();
    controller = null;
  });

  it("returns null when plugin initialization fails", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { workspace } = createWorkspace();
    multiselectMocks.throwOnInit = true;

    controller = createMultiselectController(workspace);

    expect(controller).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      "Multiselect init error:",
      expect.any(Error)
    );
  });

  it("does not install application-side selection or gesture patches", () => {
    const { addChangeListener, getInjectionDiv, injectionDiv, workspace } =
      createWorkspace();
    const originalSetSelected = Blockly.common.setSelected;
    const injectionAddEventListener = vi.spyOn(
      injectionDiv,
      "addEventListener"
    );
    const windowListenerCount = vi.spyOn(window, "addEventListener").mock.calls
      .length;

    controller = createMultiselectController(workspace);

    expect(Blockly.common.setSelected).toBe(originalSetSelected);
    expect(getInjectionDiv).not.toHaveBeenCalled();
    expect(addChangeListener).not.toHaveBeenCalled();
    expect(injectionAddEventListener).not.toHaveBeenCalled();
    expect(window.addEventListener).toHaveBeenCalledTimes(windowListenerCount);
    expect(
      injectionDiv.querySelectorAll(".blocklyMultiselectFocusProxy")
    ).toHaveLength(0);
  });
});
