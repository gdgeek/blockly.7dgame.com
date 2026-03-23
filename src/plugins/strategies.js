// TODO: @mit-app-inventor/blockly-plugin-workspace-multiselect@1.0.2 requires blockly >=11 <12
// and is NOT compatible with Blockly 12.x. The import is kept but initialization is wrapped in
// try-catch to gracefully degrade. Monitor https://github.com/mit-cml/workspace-multiselect
// for a Blockly 12 compatible release.
import { Multiselect } from "@mit-app-inventor/blockly-plugin-workspace-multiselect";
import { Backpack } from "@blockly/workspace-backpack";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import { registerFieldMultilineInput } from "@blockly/field-multilineinput";
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
      // Expected to fail with Blockly 12 until multiselect releases a compatible version
      console.warn(
        "Plugin: Multiselect failed to initialize (likely Blockly 12 incompatibility):",
        e.message
      );
    }
  },

  backpack: (workspace) => {
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

  search: (workspace) => {
    try {
      const plugin = new WorkspaceSearch(workspace);
      plugin.init();
      console.log("Plugin: Search loaded");
    } catch (e) {
      console.error("Search init error:", e);
    }
  },

  multilineinputfield: () => {
    try {
      registerFieldMultilineInput();
      console.log("MultilineInputField registered");
    } catch (e) {
      console.error("MultilineInputField register error:", e);
    }
  },
};
