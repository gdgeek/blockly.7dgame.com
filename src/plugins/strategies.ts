import { Backpack } from "@blockly/workspace-backpack";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import { registerFieldMultilineInput } from "@blockly/field-multilineinput";
import * as Blockly from "blockly/core";
import { createMultiselectController } from "./multiselect-controller";

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
    return createMultiselectController(workspace);
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
