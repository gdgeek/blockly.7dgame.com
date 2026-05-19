# 需求文档：blockly-vue3 项目升级改进

## 简介

本文档定义了 blockly-vue3 项目的升级改进需求。blockly-vue3 是一个基于 Vue 3 和 Blockly 的可视化编程编辑器，为 7D Game 平台定制的脚本编辑器。当前项目存在构建工具版本过旧、测试覆盖不足、代码质量规则缺失、缺少类型系统、核心组件职责过重、Docker 构建不稳定、工作区初始化存在 hack 实现、以及 CORS 安全配置不当等问题。本次升级旨在系统性地解决这些问题，提升项目的可维护性、安全性和工程质量。

## 术语表

- **Build_System**: 项目的构建工具链，当前为 Vite + 相关插件
- **Test_Suite**: 项目的测试框架和测试用例集合，当前为 Vitest
- **Linter**: 项目的静态代码分析工具，当前为 ESLint
- **Type_System**: 项目的类型检查系统，计划引入 TypeScript
- **App_Component**: 项目的根 Vue 组件 (src/App.vue)，当前承载了消息处理、序列化、代码生成、初始化等多项职责
- **Docker_Build**: 项目的 Docker 容器化构建流程 (Dockerfile)
- **Workspace_Loader**: 负责将 Blockly 工作区数据加载到编辑器中的模块
- **Dev_Server**: Vite 开发服务器，提供本地开发时的 HTTP 服务
- **Code_Generator**: 将 Blockly 积木块转换为 JavaScript 和 Lua 代码的模块
- **Block_Definition**: 自定义 Blockly 积木块的定义，包括外观、输入和代码生成逻辑
- **Message_Handler**: 处理 iframe 父子窗口间 postMessage 通信的模块
- **Blockly_Core**: Blockly 可视化编程库的核心模块，当前版本为 11.x，目标升级到 12.x
- **Blockly_Plugin**: 基于 Blockly 的第三方插件，包括 field-colour、field-multilineinput、workspace-search、workspace-backpack、workspace-minimap 和 workspace-multiselect
- **Plugin_Manager**: 负责初始化和管理所有 Blockly 插件的模块 (src/plugins/)

## 需求

### 需求 1：构建工具链升级

**用户故事：** 作为开发者，我希望将 Vite 从 2.x 升级到 5.x 或更高版本，以便获得更快的构建速度、更好的依赖兼容性和最新的安全修复。

#### 验收标准

1. THE Build_System SHALL 使用 Vite 5.x 或更高版本作为构建工具
2. WHEN Vite 升级完成后，THE Build_System SHALL 同步升级 @vitejs/plugin-vue 到与 Vite 5.x 兼容的版本
3. WHEN Vite 升级完成后，THE Build_System SHALL 同步升级 vite-plugin-static-copy 到与 Vite 5.x 兼容的版本
4. WHEN 执行 `pnpm run build` 命令时，THE Build_System SHALL 成功完成生产构建且无错误
5. WHEN 执行 `pnpm start` 命令时，THE Dev_Server SHALL 成功启动且编辑器功能正常运行
6. IF Vite 升级导致现有配置不兼容，THEN THE Build_System SHALL 更新 vite.config.js 中的配置以适配新版本 API

### 需求 2：测试覆盖补全

**用户故事：** 作为开发者，我希望项目拥有实质性的单元测试，以便在修改自定义积木块和代码生成逻辑时能及时发现回归问题。

#### 验收标准

1. THE Test_Suite SHALL 包含对 Block_Definition 注册逻辑的单元测试，验证自定义积木块能正确注册到 Blockly
2. THE Test_Suite SHALL 包含对 Code_Generator 的单元测试，验证积木块能正确生成对应的 JavaScript 代码
3. THE Test_Suite SHALL 包含对 Code_Generator 的单元测试，验证积木块能正确生成对应的 Lua 代码
4. THE Test_Suite SHALL 包含对 Message_Handler 的单元测试，验证 postMessage 消息的接收和分发逻辑
5. THE Test_Suite SHALL 包含对 Workspace_Loader 序列化/反序列化的往返测试，验证 save 后再 load 产生等价的工作区状态
6. THE Test_Suite SHALL 包含对 Access 权限控制类的单元测试，验证角色判断和权限检查逻辑
7. WHEN 执行 `pnpm run test:run` 命令时，THE Test_Suite SHALL 全部通过且无失败用例
8. THE Test_Suite SHALL 移除或替换现有的占位测试 (example.test.js)，使所有测试用例均具有实际业务意义

### 需求 3：ESLint 规则修复

**用户故事：** 作为开发者，我希望 ESLint 能启用关键的代码质量规则，以便在编码阶段捕获未使用变量、空函数等潜在问题。

#### 验收标准

1. THE Linter SHALL 将 `no-unused-vars` 规则设置为 "warn" 级别
2. THE Linter SHALL 将 `no-empty-function` 规则设置为 "warn" 级别
3. THE Linter SHALL 将 `no-empty-pattern` 规则设置为 "warn" 级别
4. WHEN 执行 `pnpm run lint` 命令时，THE Linter SHALL 成功完成检查且无 error 级别的违规
5. IF 现有代码中存在因启用规则而产生的合理警告，THEN THE Linter SHALL 通过行内注释 (eslint-disable) 逐个标注豁免原因，而非全局关闭规则

### 需求 4：TypeScript 引入

**用户故事：** 作为开发者，我希望项目逐步引入 TypeScript，以便利用类型检查减少运行时错误并提升代码可维护性。

#### 验收标准

1. THE Type_System SHALL 在项目根目录包含 tsconfig.json 配置文件
2. THE Type_System SHALL 配置为允许 JavaScript 和 TypeScript 文件共存 (allowJs: true)
3. THE Type_System SHALL 将 strict 模式设置为 false，以支持渐进式迁移
4. THE Build_System SHALL 支持同时编译 .js 和 .ts 文件
5. THE Type_System SHALL 将 src/utils/Access.js 作为首批迁移文件转换为 TypeScript (Access.ts)
6. THE Type_System SHALL 将 src/blocks/helper.js 作为首批迁移文件转换为 TypeScript (helper.ts)
7. WHEN 迁移后的 TypeScript 文件被编译时，THE Type_System SHALL 无类型错误

### 需求 5：App.vue 职责拆分

**用户故事：** 作为开发者，我希望将 App.vue 中的多项职责拆分为独立模块，以便降低单文件复杂度并提升可测试性。

#### 验收标准

1. THE App_Component SHALL 将 postMessage 通信逻辑提取到独立的 composable 模块 (如 useMessageBridge)
2. THE App_Component SHALL 将工作区序列化和反序列化逻辑提取到独立的 composable 模块 (如 useWorkspace)
3. THE App_Component SHALL 将 JavaScript 和 Lua 代码生成逻辑提取到独立的 composable 模块 (如 useCodeGenerator)
4. THE App_Component SHALL 将 toolbox 初始化和配置逻辑提取到独立的 composable 模块 (如 useToolboxSetup)
5. WHEN 拆分完成后，THE App_Component SHALL 仅保留组件编排和生命周期管理职责
6. WHEN 拆分完成后，THE App_Component SHALL 保持与拆分前完全一致的功能行为

### 需求 6：Dockerfile 构建修复

**用户故事：** 作为运维人员，我希望 Docker 构建能锁定依赖版本，以便确保不同环境下构建产物的一致性。

#### 验收标准

1. THE Docker_Build SHALL 在执行 `pnpm install` 之前将 pnpm-lock.yaml 文件拷贝到容器中
2. THE Docker_Build SHALL 使用 `pnpm install --frozen-lockfile` 命令安装依赖，确保严格按照 lockfile 安装
3. WHEN pnpm-lock.yaml 与 package.json 不一致时，THE Docker_Build SHALL 构建失败并报告错误，而非静默安装不一致的版本
4. THE Docker_Build SHALL 将 COPY package.json 和 COPY pnpm-lock.yaml 放在 COPY . . 之前，以充分利用 Docker 层缓存

### 需求 7：工作区加载机制重构

**用户故事：** 作为开发者，我希望用可靠的事件驱动机制替代 setTimeout 轮询，以便消除工作区加载的不确定性和潜在的竞态条件。

#### 验收标准

1. THE Workspace_Loader SHALL 使用 Vue 的响应式机制 (如 watch 或 nextTick) 检测工作区就绪状态，而非 setTimeout 轮询
2. THE Workspace_Loader SHALL 在工作区就绪后立即加载数据，无需固定间隔等待
3. IF 工作区在合理时间内未就绪，THEN THE Workspace_Loader SHALL 记录错误日志并通知父窗口加载失败
4. THE Workspace_Loader SHALL 移除现有的 setTimeout 轮询代码 (loadWorkspace 函数中的 retries 逻辑)

### 需求 8：移除 Dev Server CORS 配置

**用户故事：** 作为开发者，我希望移除 dev server 上不必要的 CORS 配置，因为纯前端项目不需要在开发服务器上配置 CORS。

#### 验收标准

1. THE Dev_Server SHALL 移除 vite.config.js 中 server.cors 的全部自定义配置
2. WHEN 移除 CORS 配置后，THE Dev_Server SHALL 使用 Vite 的默认行为
3. WHEN 执行 `pnpm start` 命令时，THE Dev_Server SHALL 正常启动且编辑器功能不受影响

### 需求 9：Blockly 升级

**用户故事：** 作为开发者，我希望将 Blockly 从 11.x 升级到 12.x，并同步升级所有相关插件到兼容版本，以便获得最新的功能改进、性能优化和安全修复。

#### 验收标准

1. THE Blockly_Core SHALL 升级到 12.x 版本 (目标版本 12.2.0)
2. WHEN Blockly_Core 升级完成后，THE Blockly_Plugin SHALL 将 @blockly/field-colour 升级到与 Blockly 12.x 兼容的版本
3. WHEN Blockly_Core 升级完成后，THE Blockly_Plugin SHALL 将 @blockly/field-multilineinput 升级到与 Blockly 12.x 兼容的版本
4. WHEN Blockly_Core 升级完成后，THE Blockly_Plugin SHALL 将 @blockly/plugin-workspace-search 升级到与 Blockly 12.x 兼容的版本
5. WHEN Blockly_Core 升级完成后，THE Blockly_Plugin SHALL 将 @blockly/workspace-backpack 升级到与 Blockly 12.x 兼容的版本
6. WHEN Blockly_Core 升级完成后，THE Blockly_Plugin SHALL 将 @blockly/workspace-minimap 升级到与 Blockly 12.x 兼容的版本
7. WHEN Blockly_Core 升级完成后，THE Blockly_Plugin SHALL 将 @mit-app-inventor/blockly-plugin-workspace-multiselect 升级到与 Blockly 12.x 兼容的版本
8. WHEN Blockly 12.x 存在 breaking changes 导致 API 变更时，THE Block_Definition SHALL 更新所有自定义积木块定义 (jsonInit、getBlock) 以适配新版本 API
9. WHEN Blockly 12.x 存在 breaking changes 导致代码生成器 API 变更时，THE Code_Generator SHALL 更新所有 JavaScript 和 Lua 代码生成函数 (getJavascript、getLua) 以适配新版本 API
10. WHEN Blockly 12.x 变更了导入路径或模块结构时，THE Blockly_Core SHALL 更新所有 import 语句 (如 blockly/core、blockly/lua、blockly/javascript、blockly/blocks、blockly/msg/*) 以适配新的模块路径
11. WHEN 升级完成后，THE Plugin_Manager SHALL 验证所有插件 (multiselect、backpack、search、multilineinput、minimap) 能正常初始化且无运行时错误
12. WHEN 执行 `pnpm run build` 命令时，THE Build_System SHALL 成功完成构建且无与 Blockly 相关的编译错误
13. WHEN 升级完成后，THE Code_Generator SHALL 对所有自定义积木块生成与升级前语义等价的 JavaScript 代码
14. WHEN 升级完成后，THE Code_Generator SHALL 对所有自定义积木块生成与升级前语义等价的 Lua 代码
15. IF @mit-app-inventor/blockly-plugin-workspace-multiselect 尚未发布与 Blockly 12.x 兼容的版本，THEN THE Plugin_Manager SHALL 评估替代方案或临时禁用该插件并记录待办事项
16. THE Blockly_Core SHALL 审查 Blockly 12.x 的 CHANGELOG 和迁移指南 (由 Raspberry Pi Foundation 维护)，识别所有影响本项目的 breaking changes 并逐项处理
