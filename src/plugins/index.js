import { onBeforeUnmount } from "vue";
import { strategies } from "./strategies";
import { MinimapController } from "./minimap-controller";

export function usePluginManager() {
  const minimapCtrl = new MinimapController();

  // 对外暴露的 API
  const initPlugins = (workspace, blocklyDiv, options = {}) => {
    if (!workspace) return;

    // 1. 初始化普通插件
    strategies.multiselect(workspace, options);
    strategies.backpack(workspace, options);
    strategies.search(workspace);
    strategies.multilineinputfield();

    // 2. 初始化 Minimap (需要 DOM 引用)
    minimapCtrl.init(workspace, blocklyDiv, options);
  };

  // 自动清理逻辑
  onBeforeUnmount(() => {
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
