import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const blocklyMocks = vi.hoisted(() => {
  class BlockSvg {}

  return {
    BlockSvg,
    focusNode: vi.fn(),
    originalSetSelected: vi.fn(),
  };
});

const multiselectMocks = vi.hoisted(() => ({
  dragSelectionWeakMap: new WeakMap<object, Set<string>>(),
  inMultipleSelectionModeWeakMap: new WeakMap<object, boolean>(),
}));

vi.mock("blockly/core", () => ({
  BlockSvg: blocklyMocks.BlockSvg,
  common: {
    setSelected: blocklyMocks.originalSetSelected,
  },
  ContextMenuRegistry: {
    registry: {
      getItem: vi.fn(() => null),
    },
  },
  Events: {
    BLOCK_CREATE: "create",
    SELECTED: "selected",
  },
  getFocusManager: () => ({
    focusNode: blocklyMocks.focusNode,
  }),
  getSelected: vi.fn(() => null),
  Msg: {},
  ShortcutRegistry: {
    registry: {
      getRegistry: vi.fn(() => ({})),
    },
  },
}));

vi.mock("@mit-app-inventor/blockly-plugin-workspace-multiselect", () => {
  class Multiselect {
    controls_ = undefined;

    init(): void {}
    dispose(): void {}
  }

  return {
    Multiselect,
    ...multiselectMocks,
  };
});

import * as Blockly from "blockly/core";
import { createMultiselectController } from "@/plugins/multiselect-controller";

describe("multiselect controller Blockly 12 compatibility", () => {
  let controller: ReturnType<typeof createMultiselectController> = null;

  beforeEach(() => {
    blocklyMocks.focusNode.mockReset();
    blocklyMocks.originalSetSelected.mockReset();
  });

  afterEach(() => {
    controller?.dispose();
    controller = null;
  });

  it("clears a legacy null selection by focusing the workspace", () => {
    const injectionDiv = document.createElement("div");
    const workspace = {
      id: "workspace-1",
      addChangeListener: vi.fn(),
      getInjectionDiv: () => injectionDiv,
      removeChangeListener: vi.fn(),
    } as unknown as Blockly.WorkspaceSvg;

    controller = createMultiselectController(workspace);

    expect(controller).not.toBeNull();

    const selectionApi = Blockly.common as unknown as {
      setSelected: (selection: unknown | null) => void;
    };
    expect(() => selectionApi.setSelected(null)).not.toThrow();

    expect(blocklyMocks.focusNode).toHaveBeenCalledOnce();
    expect(blocklyMocks.focusNode).toHaveBeenCalledWith(workspace);
    expect(blocklyMocks.originalSetSelected).not.toHaveBeenCalled();

    const selectable = {};
    selectionApi.setSelected(selectable);
    expect(blocklyMocks.originalSetSelected).toHaveBeenCalledWith(selectable);

    controller?.dispose();
    controller = null;
    expect(selectionApi.setSelected).toBe(blocklyMocks.originalSetSelected);
  });
});
