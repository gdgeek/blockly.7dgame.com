import { Backpack } from "@blockly/workspace-backpack";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import { registerFieldMultilineInput } from "@blockly/field-multilineinput";
import { Multiselect } from "@mit-app-inventor/blockly-plugin-workspace-multiselect";
import * as Blockly from "blockly/core";

interface DisposablePlugin {
  dispose: () => void;
}

interface PluginStrategies {
  backpack: (workspace: Blockly.WorkspaceSvg) => void;
  multiselect: (workspace: Blockly.WorkspaceSvg) => DisposablePlugin | null;
  search: (workspace: Blockly.WorkspaceSvg) => void;
  multilineinputfield: () => void;
}

export const strategies: PluginStrategies = {
  backpack: (workspace: Blockly.WorkspaceSvg): void => {
    try {
      const backpackOptions = {
        allowEmptyBackpackOpen: true,
        useFilledBackpackImage: true,
        contextMenu: {
          emptyBackpack: true,
          removeFromBackpack: true,
          copyToBackpack: true,
          copyAllToBackpack: true,
          pasteAllToBackpack: true,
        },
      };
      const plugin = new Backpack(workspace, backpackOptions);
      plugin.init();
      console.log("Plugin: Backpack loaded");
    } catch (e) {
      console.error("Backpack init error:", e);
    }
  },

  multiselect: (workspace: Blockly.WorkspaceSvg): DisposablePlugin | null => {
    try {
      const plugin = new Multiselect(workspace);
      plugin.init({
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
          weight: 3,
        },
      });
      const selectAllItem = Blockly.ContextMenuRegistry.registry.getItem(
        "workspaceSelectAll"
      ) as { displayText?: () => string } | null;
      if (selectAllItem) {
        selectAllItem.displayText = () =>
          Blockly.Msg["WORKSPACE_SELECT_ALL_BLOCKS"] || "Select All Blocks";
      }

      console.log("Plugin: Multiselect loaded");
      return {
        dispose: () => plugin.dispose(),
      };
    } catch (e) {
      console.error("Multiselect init error:", e);
      return null;
    }
  },

  search: (workspace: Blockly.WorkspaceSvg): void => {
    try {
      const plugin = new WorkspaceSearch(workspace);
      plugin.init();
      console.log("Plugin: Search loaded");
    } catch (e) {
      console.error("Search init error:", e);
    }
  },

  multilineinputfield: (): void => {
    try {
      registerFieldMultilineInput();
      console.log("MultilineInputField registered");
    } catch (e) {
      console.error("MultilineInputField register error:", e);
    }
  },
};
