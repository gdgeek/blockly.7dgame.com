import { Multiselect } from "@mit-app-inventor/blockly-plugin-workspace-multiselect";
import { Backpack } from "@blockly/workspace-backpack";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import * as Blockly from "blockly/core";

export const strategies = {
  multiselect: (workspace, options) => {
    try {
      const pluginOptions = {
        ...options,
        multiSelectKeys: ["Shift"],
        multiselectIcon: {
          hideIcon: false,
          weight: 3,
          enabledIcon: "/media/select.svg",
          disabledIcon: "/media/unselect.svg",
        },
      };
      const plugin = new Multiselect(workspace);
      plugin.init(pluginOptions);
      Blockly.ContextMenuRegistry.registry.unregister("workspaceSelectAll");
      console.log("Plugin: Multiselect loaded");
    } catch (e) {
      console.error("Multiselect init error", e);
    }
  },

  backpack: (workspace, options) => {
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
      console.error("Backpack init error", e);
    }
  },

  search: (workspace) => {
    try {
      const plugin = new WorkspaceSearch(workspace);
      plugin.init();
      console.log("Plugin: Search loaded");
    } catch (e) {
      console.error("Search init error", e);
    }
  },
};
