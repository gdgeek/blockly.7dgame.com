# 实现计划：TypeScript 迁移

## 概述

按照自底向上的依赖顺序，将项目从 JavaScript 完全迁移到 TypeScript。分为 6 个阶段：基础设施 → 底层工具 → 积木块系统 → 上层集成 → 入口与组件 → 清理验证。每个阶段确保构建和测试通过后再进入下一阶段。

## 任务

- [x] 1. Phase 1：基础设施配置
  - [x] 1.1 升级 tsconfig.json 为 strict 模式
    - 将 `strict` 设为 `true`
    - 保留 `allowJs: true`（迁移期间需要）
    - 确保 `include` 覆盖 `.ts`、`.d.ts`、`.tsx`、`.vue` 文件
    - 在 `package.json` 中添加 `"type-check": "tsc --noEmit"` 脚本
    - _需求: 1.1, 1.2, 1.5_

  - [x] 1.2 创建全局类型声明文件 `src/env.d.ts`
    - 添加 `/// <reference types="vite/client" />`
    - 声明 Vue SFC 模块类型（`*.vue`）
    - 声明 `__BUILD_TIME__` 全局常量类型
    - 扩展 `Window` 接口，添加 `lg`、`URL`、`BlobBuilder` 等属性
    - 为 `@mit-app-inventor/blockly-plugin-workspace-multiselect` 添加模块声明
    - _需求: 14.1, 14.2, 14.3, 14.5_

  - [x] 1.3 将 `vite.config.js` 迁移为 `vite.config.ts`
    - 重命名文件并添加必要的类型注解
    - 确保 `defineConfig`、`vue` 插件、`viteStaticCopy` 配置保持不变
    - _需求: 2.1_

  - [x] 1.4 更新 ESLint 配置以支持 TypeScript
    - 安装 `@typescript-eslint/parser` 和 `@typescript-eslint/eslint-plugin`
    - 更新 `.eslintrc.cjs`，添加 TypeScript overrides 配置
    - 为 `.ts` 文件添加 `@typescript-eslint/recommended` 规则
    - 更新 `lint` 脚本，添加 `.ts` 扩展名
    - _需求: 13.1, 13.2, 13.3, 13.4_

- [x] 2. Phase 1 检查点
  - 确保 `tsc --noEmit` 通过（允许 JS 文件的错误），Vite 构建成功，所有测试通过。如有问题请询问用户。

- [x] 3. Phase 2：底层工具模块迁移
  - [x] 3.1 合并 `helperJS.js` 到 `helper.ts`
    - 将 `helperJS.js` 中的 `RegisterData`（JS 版）、`HandlerJS`、`InputEventJS`、`OutputEventJS`、`NumberJS`、`BooleanJS`、`StringJS`、`PointJS`、`PlayerJS`、`AnchorJS`、`RangeJS` 函数添加到 `helper.ts` 并加上类型注解
    - 在 `helper.ts` 中导出这些新增函数
    - 更新所有从 `helperJS.js` 导入的文件，改为从 `helper.ts` 导入
    - _需求: 5.5_


  - [x] 3.2 将 `src/utils/dataUpgrade.js` 迁移为 `src/utils/dataUpgrade.ts`
    - 为 `upgradeTweenData`、`upgradeTweenXml`、`upgradeTweenJson` 函数添加参数和返回值类型注解
    - 定义 Tween 数据相关的类型接口
    - _需求: 10.1, 10.3_

  - [ ]* 3.3 验证 `dataUpgrade` 现有测试通过
    - 运行 `src/__tests__/utils/dataUpgrade.test.ts` 和 `src/__tests__/utils/dataUpgrade.property.test.ts`
    - 确保迁移后所有测试通过
    - _需求: 10.5_

  - [x] 3.4 将 `src/helper/index.js` 迁移为 `src/helper/index.ts`
    - 为 `printVector3`、`printVector2`、`cutString` 等工具函数添加参数和返回值类型注解
    - 更新所有导入该模块的文件引用
    - _需求: 10.2, 10.4_

- [x] 4. Phase 2 检查点
  - 确保所有测试通过，`tsc --noEmit` 对已迁移文件无错误。如有问题请询问用户。

- [x] 5. Phase 3：积木块系统迁移
  - [x] 5.1 迁移所有 `blocks/*/type.js` 为 `type.ts`
    - 将以下目录中的 `type.js` 转换为 `type.ts`：command、data、entity、event、log、manager、meta、other、parameter、picture、polygen、prototype、signal、sound、task、text、trigger、video、voxel
    - 为每个 type 文件中的积木块类型常量添加 `as const` 断言或定义导出类型接口
    - _需求: 5.2_

  - [x] 5.2 迁移 `blocks/command/` 目录下所有积木块文件
    - 将 `gesture_trigger.js`、`voice_trigger.js`、`index.js` 转换为 `.ts`
    - 为 `getBlockJson`、`getBlock`、`getJavascript`、`getLua` 方法添加类型注解
    - 使用 `BlockDefinition` 接口约束积木块定义对象
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.3 迁移 `blocks/data/` 目录下所有积木块文件
    - 将 `transform_data.js`、`module_to_transform_data.js`、`vector3_data.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.4 迁移 `blocks/entity/` 目录下所有积木块文件
    - 将 `entity.js`、`entity_allmovable.js`、`entity_explode.js`、`entity_highlight.js`、`entity_movable.js`、`entity_rotatable.js`、`entity_unexploded.js`、`line_execute.js`、`text_entity.js`、`tween_execute.js`、`visual_execute.js`、`visual_tooltip.js`、`visual_tooltips.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.5 迁移 `blocks/event/` 目录下所有积木块文件
    - 将 `input_event.js`、`output_event.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.6 迁移 `blocks/log/` 目录下所有积木块文件
    - 将 `log_key_value.js`、`log_resetUuid.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.7 迁移 `blocks/manager/` 目录下所有积木块文件
    - 将 `game_add_score.js`、`game_countdown.js`、`game_reset.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.8 迁移 `blocks/meta/` 目录下所有积木块文件
    - 将 `meta_action.js`、`run_task.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.9 迁移 `blocks/other/` 目录下所有积木块文件
    - 将 `sleep.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.10 迁移 `blocks/parameter/` 目录下所有积木块文件
    - 将 `boolean_parameter.js`、`number_parameter.js`、`parameters.js`、`player_parameter.js`、`point_parameter.js`、`rectangle_parameter.js`、`string_parameter.js`、`system_parameter.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.11 迁移 `blocks/picture/` 目录下所有积木块文件
    - 将 `picture_entity.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.12 迁移 `blocks/polygen/` 目录下所有积木块文件
    - 将 `play_animation.js`、`polygen_allmovable.js`、`polygen_entity.js`、`polygen_highlight.js`、`polygen_movable.js`、`polygen_rotatable.js`、`set_emote.js`、`set_viseme_clip.js`、`state.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.13 迁移 `blocks/prototype/` 目录下所有积木块文件
    - 将 `prototype_book.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.14 迁移 `blocks/signal/` 目录下所有积木块文件
    - 将 `init_signal.js`、`input_signal.js`、`input_signal_system.js`、`multi_output_signal.js`、`output_signal.js`、`output_signal_with_parameter.js`、`outputs_item.js`、`index.js` 转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_


  - [x] 5.15 迁移 `blocks/sound/` 目录下所有积木块文件
    - 将该目录下所有 `.js` 文件转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.16 迁移 `blocks/task/` 目录下所有积木块文件
    - 将 `system_task.js`、`index.js` 及其他 `.js` 文件转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.17 迁移 `blocks/text/` 目录下所有积木块文件
    - 将该目录下所有 `.js` 文件转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.18 迁移 `blocks/trigger/` 目录下所有积木块文件
    - 将 `action_execute.js`、`destroy_trigger.js`、`index.js` 及其他 `.js` 文件转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.19 迁移 `blocks/video/` 目录下所有积木块文件
    - 将该目录下所有 `.js` 文件转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.20 迁移 `blocks/voxel/` 目录下所有积木块文件
    - 将该目录下所有 `.js` 文件转换为 `.ts`
    - 添加类型注解并使用 `BlockDefinition` 接口
    - _需求: 5.1, 5.3, 5.4_

  - [x] 5.21 将 `src/blocks/stocks.js` 迁移为 `src/blocks/stocks.ts`
    - 添加类型注解，确保所有积木块模块的导入路径正确
    - _需求: 5.6_

  - [ ]* 5.22 验证积木块模块现有测试通过
    - 运行 `src/__tests__/blocks/helper.test.ts` 和 `src/__tests__/blocks/code-generation.test.ts`
    - 确保迁移后所有积木块相关测试通过
    - _需求: 5.7_

- [x] 6. Phase 3 检查点
  - 确保所有测试通过，`tsc --noEmit` 对已迁移的积木块文件无错误。如有问题请询问用户。

- [x] 7. Phase 4：上层集成模块迁移
  - [x] 7.1 迁移本地化模块
    - 将 `src/localization/index.js` 转换为 `src/localization/index.ts`
    - 将 `src/localization/context_menu.js` 转换为 `src/localization/context_menu.ts`
    - 将 `src/localization/procedure_override.js` 转换为 `src/localization/procedure_override.ts`
    - 定义语言代码联合类型（`'zh-CN' | 'en-US' | 'ja-JP' | 'zh-TW' | 'th-TH'`）
    - 为多语言消息映射对象定义类型接口
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 7.2 迁移工具箱模块
    - 将 `src/toolbox/system/` 下的 `logic.js`、`loop.js`、`math.js`、`texts.js`、`list.js`、`colour.js` 全部转换为 `.ts`
    - 为工具箱分类配置对象定义类型接口
    - _需求: 8.1, 8.2_

  - [x] 7.3 迁移插件模块
    - 将 `src/plugins/index.js` 转换为 `src/plugins/index.ts`
    - 将 `src/plugins/strategies.js` 转换为 `src/plugins/strategies.ts`
    - 将 `src/plugins/minimap-controller.js` 转换为 `src/plugins/minimap-controller.ts`
    - 为 `MinimapController` 类的属性和方法添加类型注解
    - 为 `strategies` 对象中每个插件初始化函数添加类型注解
    - _需求: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.4 迁移自定义模块
    - 将 `src/custom/index.js` 转换为 `src/custom/index.ts`
    - 为 `setup` 函数的参数（style、parameters、access）添加类型注解
    - 为 Blockly 代码生成器覆写函数添加类型注解
    - _需求: 9.1, 9.2, 9.3_

  - [x] 7.5 迁移渲染器模块
    - 将 `src/renderers/sharp-renderer.js` 转换为 `src/renderers/sharp-renderer.ts`
    - 为 `SharpConstantProvider` 和 `SharpRenderer` 类添加类型注解
    - _需求: 11.1, 11.2_

- [x] 8. Phase 4 检查点
  - 确保所有测试通过，`tsc --noEmit` 对已迁移的上层模块无错误。如有问题请询问用户。

- [x] 9. Phase 5：入口文件与 Vue 组件迁移
  - [x] 9.1 将 `src/main.js` 迁移为 `src/main.ts`
    - 重命名文件并添加类型注解
    - 更新 `index.html` 中的脚本引用从 `src/main.js` 改为 `src/main.ts`
    - _需求: 3.1, 3.2_

  - [x] 9.2 迁移 `BlocklyComponent.vue` 为 TypeScript
    - 将 `<script setup>` 改为 `<script setup lang="ts">`
    - 为 `props` 添加 TypeScript 类型定义
    - 为组件内所有 `ref`、函数参数添加类型注解
    - _需求: 4.1, 4.3_

  - [x] 9.3 迁移 `App.vue` 为 TypeScript
    - 将 `<script setup>` 改为 `<script setup lang="ts">`
    - 为所有 `ref`、`computed` 和函数参数添加类型注解
    - _需求: 4.2, 4.4_

  - [x] 9.4 将 `src/__tests__/setup.js` 迁移为 `src/__tests__/setup.ts`
    - 重命名文件并添加必要的类型注解
    - 更新 Vitest 配置中的 `setupFiles` 引用路径
    - _需求: 12.1, 12.2_

  - [ ]* 9.5 运行全量测试验证
    - 执行 `vitest run` 确保所有现有测试通过
    - _需求: 4.5, 12.3_

- [x] 10. Phase 5 检查点
  - 确保所有测试通过，`tsc --noEmit` 对所有已迁移文件无错误。如有问题请询问用户。

- [x] 11. Phase 6：清理与最终验证
  - [x] 11.1 移除 `tsconfig.json` 中的 `allowJs: true` 配置
    - 从 `include` 中移除 `src/**/*.js`
    - _需求: 1.3, 15.2_

  - [x] 11.2 删除 `src/blocks/helperJS.js` 文件
    - 确认所有导入已更新为 `helper.ts`
    - _需求: 15.3_

  - [x] 11.3 验证 `src/` 目录下不存在任何 `.js` 源码文件
    - 检查并确认所有 `.js` 文件已迁移为 `.ts`
    - 更新所有文件中的导入路径，确保引用正确
    - _需求: 15.1, 15.4_

  - [x] 11.4 执行完整构建流程验证
    - 运行 `tsc --noEmit` 确保类型检查通过
    - 运行 `vite build` 确保构建成功
    - 运行 `vitest run` 确保所有测试通过
    - _需求: 1.4, 2.2, 15.5_

- [x] 12. 最终检查点
  - 确保完整构建流程（类型检查 + Vite 构建 + 测试）全部通过。如有问题请询问用户。

## 备注

- 标记 `*` 的子任务为可选任务，可跳过以加速 MVP
- 每个任务引用了具体的需求编号以确保可追溯性
- 检查点任务确保每个阶段的增量验证
- 迁移期间保留 `allowJs: true`，仅在最终清理阶段移除
- 积木块模块数量较多，每个子目录作为独立子任务，便于增量推进
