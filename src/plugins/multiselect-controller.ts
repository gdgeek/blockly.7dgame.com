import { Multiselect } from "@gdgeek/blockly-plugin-workspace-multiselect";
import type * as Blockly from "blockly/core";

interface DisposablePlugin {
  dispose: () => void;
}

const MULTI_SELECT_KEYS = ["Shift"];

export function createMultiselectController(
  workspace: Blockly.WorkspaceSvg
): DisposablePlugin | null {
  try {
    const plugin = new Multiselect(workspace);
    plugin.init({
      useDoubleClick: false,
      bumpNeighbours: true,
      multiFieldUpdate: false,
      workspaceAutoFocus: false,
      multiSelectKeys: MULTI_SELECT_KEYS,
      multiselectCopyPaste: {
        crossTab: false,
        menu: true,
      },
      multiselectIcon: {
        hideIcon: true,
      },
    });

    let disposed = false;
    console.log("Plugin: Multiselect loaded");
    return {
      dispose: () => {
        if (disposed) return;
        disposed = true;
        plugin.dispose();
      },
    };
  } catch (e) {
    console.error("Multiselect init error:", e);
    return null;
  }
}
