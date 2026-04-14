import { Backpack } from "@blockly/workspace-backpack";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import { registerFieldMultilineInput } from "@blockly/field-multilineinput";
import * as Blockly from "blockly/core";

// NOTE: Multiselect plugin removed — no Blockly 12 compatible option available yet.
// Monitor https://github.com/mit-cml/workspace-multiselect for future updates.

interface PluginStrategies {
  backpack: (workspace: Blockly.WorkspaceSvg) => void;
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
