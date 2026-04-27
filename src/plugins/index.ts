import { onBeforeUnmount } from "vue";
import { strategies } from "./strategies";
import { MinimapController } from "./minimap-controller";
import { createWorkspaceControlHints } from "./workspace-control-hints";
import type Blockly from "blockly";

interface PluginOptions {
  minimap?: boolean;
  multiselect?: boolean;
  [key: string]: unknown;
}

interface DisposablePlugin {
  dispose: () => void;
}

interface MinimapActions {
  show: () => void;
  hide: () => void;
}

interface PluginManager {
  initPlugins: (
    workspace: Blockly.WorkspaceSvg,
    blocklyDiv: HTMLElement,
    options?: PluginOptions
  ) => void;
  minimapState: MinimapController["state"];
  minimapActions: MinimapActions;
}

export function usePluginManager(): PluginManager {
  const minimapCtrl = new MinimapController();
  let multiselectPlugin: DisposablePlugin | null = null;
  let workspaceControlHints: DisposablePlugin | null = null;

  // 对外暴露的 API
  const initPlugins = (
    workspace: Blockly.WorkspaceSvg,
    blocklyDiv: HTMLElement,
    options: PluginOptions = {}
  ): void => {
    if (!workspace) return;

    // 1. 初始化普通插件
    strategies.backpack(workspace);
    if (options.multiselect !== false) {
      multiselectPlugin = strategies.multiselect(workspace);
    }
    strategies.search(workspace);
    strategies.multilineinputfield();

    // 2. 初始化 Minimap (需要 DOM 引用)
    minimapCtrl.init(workspace, blocklyDiv, options);

    workspaceControlHints = createWorkspaceControlHints(workspace, blocklyDiv);
  };

  // 自动清理逻辑
  onBeforeUnmount(() => {
    multiselectPlugin?.dispose();
    multiselectPlugin = null;
    workspaceControlHints?.dispose();
    workspaceControlHints = null;
    minimapCtrl.dispose();
  });

  return {
    initPlugins,
    // 仅暴露 Minimap 的 UI 状态和控制方法给 Vue 模板
    minimapState: minimapCtrl.state,
    minimapActions: {
      show: () => minimapCtrl.show(),
      hide: () => minimapCtrl.hide(300),
    },
  };
}
