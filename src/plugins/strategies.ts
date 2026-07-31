import { Backpack } from "@blockly/workspace-backpack";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import { registerFieldMultilineInput } from "@blockly/field-multilineinput";
import * as Blockly from "blockly/core";
import { createMultiselectController } from "./multiselect-controller";

interface DisposablePlugin {
  dispose: () => void;
}

interface PluginStrategies {
  backpack: (workspace: Blockly.WorkspaceSvg) => DisposablePlugin | null;
  multiselect: (workspace: Blockly.WorkspaceSvg) => DisposablePlugin | null;
  search: (workspace: Blockly.WorkspaceSvg) => DisposablePlugin | null;
  multilineinputfield: () => void;
}

interface PositionableDisposablePlugin extends DisposablePlugin {
  id: string;
}

let multilineInputFieldRegistered = false;

const runCleanupStep = (label: string, cleanup: () => void): void => {
  try {
    cleanup();
  } catch (error) {
    console.error(label, error);
  }
};

const managePositionablePlugin = (
  workspace: Blockly.WorkspaceSvg,
  plugin: PositionableDisposablePlugin
): DisposablePlugin => {
  let disposed = false;
  return {
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      runCleanupStep(`${plugin.id} component cleanup failed:`, () => {
        const componentManager = workspace.getComponentManager();
        if (componentManager.getComponent(plugin.id) === plugin) {
          componentManager.removeComponent(plugin.id);
        }
      });
      runCleanupStep(`${plugin.id} dispose failed:`, () => plugin.dispose());
    },
  };
};

const manageBackpackPlugin = (
  workspace: Blockly.WorkspaceSvg,
  plugin: Backpack,
  previousConfigureContextMenu: Blockly.WorkspaceSvg["configureContextMenu"]
): DisposablePlugin => {
  let disposed = false;
  return {
    dispose: (): void => {
      if (disposed) return;
      disposed = true;

      runCleanupStep("Backpack context menu cleanup failed:", () => {
        workspace.configureContextMenu = previousConfigureContextMenu;
      });
      runCleanupStep("Backpack flyout cleanup failed:", () => {
        plugin.getFlyout()?.dispose();
      });
      runCleanupStep("Backpack dispose failed:", () => plugin.dispose());
      runCleanupStep("Backpack component cleanup failed:", () => {
        const componentManager = workspace.getComponentManager();
        if (componentManager.getComponent(plugin.id) === plugin) {
          componentManager.removeComponent(plugin.id);
        }
      });
    },
  };
};

export const strategies: PluginStrategies = {
  backpack: (workspace: Blockly.WorkspaceSvg): DisposablePlugin | null => {
    let plugin: Backpack | null = null;
    let controller: DisposablePlugin | null = null;
    const previousConfigureContextMenu = workspace.configureContextMenu;
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
      plugin = new Backpack(workspace, backpackOptions);
      controller = manageBackpackPlugin(
        workspace,
        plugin,
        previousConfigureContextMenu
      );
      plugin.init();
      console.log("Plugin: Backpack loaded");
      return controller;
    } catch (e) {
      controller?.dispose();
      console.error("Backpack init error:", e);
      return null;
    }
  },

  multiselect: (workspace: Blockly.WorkspaceSvg): DisposablePlugin | null => {
    return createMultiselectController(workspace);
  },

  search: (workspace: Blockly.WorkspaceSvg): DisposablePlugin | null => {
    let plugin: WorkspaceSearch | null = null;
    let controller: DisposablePlugin | null = null;
    try {
      plugin = new WorkspaceSearch(workspace);
      controller = managePositionablePlugin(workspace, plugin);
      plugin.init();
      console.log("Plugin: Search loaded");
      return controller;
    } catch (e) {
      controller?.dispose();
      console.error("Search init error:", e);
      return null;
    }
  },

  multilineinputfield: (): void => {
    if (multilineInputFieldRegistered) return;
    try {
      registerFieldMultilineInput();
      multilineInputFieldRegistered = true;
      console.log("MultilineInputField registered");
    } catch (e) {
      console.error("MultilineInputField register error:", e);
    }
  },
};
