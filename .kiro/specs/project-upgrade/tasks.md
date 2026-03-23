# 实施计划：blockly-vue3 项目升级改进

## 概述

按照设计文档中的执行顺序，依次完成 9 个需求的实施。遵循"先基础设施，后业务逻辑"的原则：先升级构建工具链和 Blockly 核心依赖，再进行代码质量改进和架构重构，最后补全测试覆盖。

## 任务

- [x] 1. Vite 构建工具链升级 (需求 1)
  - [x] 1.1 升级 package.json 中的构建依赖版本
    - 将 `vite` 从 `^2.9.18` 升级到 `^5.4.0`
    - 将 `@vitejs/plugin-vue` 从 `^2.3.4` 升级到 `^5.1.0`
    - 将 `vite-plugin-static-copy` 从 `^0.6.1` 升级到 `^2.2.0`
    - _需求: 1.1, 1.2, 1.3_
  - [x] 1.2 适配 vite.config.js 配置
    - 检查并更新 `vite-plugin-static-copy` 的 `targets` 配置 API（v1.0+ 的 `src` 字段改为 glob 模式）
    - 确保 `@vitejs/plugin-vue` 配置兼容 v5
    - 确保 resolve.alias 配置正常工作
    - _需求: 1.4, 1.5, 1.6_

- [x] 2. Blockly 核心及插件升级 (需求 9)
  - [x] 2.1 升级 package.json 中的 Blockly 相关依赖版本
    - `blockly` 从 `^11.2.2` 升级到 `^12.2.0`
    - `@blockly/field-colour` 从 `^5.0.19` 升级到 `^6.0.0`
    - `@blockly/field-multilineinput` 从 `^6.0.5` 升级到 `^7.0.0`
    - `@blockly/plugin-workspace-search` 从 `9.0.1` 升级到 `^10.0.0`
    - `@blockly/workspace-backpack` 从 `^7.0.6` 升级到 `^8.0.0`
    - `@blockly/workspace-minimap` 从 `^0.3.5` 升级到 `^0.4.0`
    - 评估 `@mit-app-inventor/blockly-plugin-workspace-multiselect` 兼容性，如不兼容则临时禁用并记录 TODO
    - _需求: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.15_
  - [x] 2.2 适配 Blockly 12.x Breaking Changes — 导入路径和模块结构
    - 检查并更新 `blockly/javascript`、`blockly/lua` 等导入路径
    - 更新 `src/blocks/helper.js`、`src/blocks/helperJS.js` 中的导入
    - 更新 `src/custom/index.js` 中的导入
    - 更新 `src/App.vue` 中的导入
    - _需求: 9.10_
  - [x] 2.3 适配 Blockly 12.x Breaking Changes — 积木块定义和代码生成器
    - 检查 `Blockly.Blocks[name]` 注册方式是否有变化
    - 检查 `generator.ORDER_*` 常量是否有调整
    - 检查 `Blockly.Names.NameType` 是否有变更，更新 `src/custom/index.js` 中的 procedure 生成器
    - 检查 `Blockly.setLocale()` API 是否有变更
    - 逐一更新 `src/blocks/` 下所有自定义积木块的 `getBlock`、`getJavascript`、`getLua` 函数
    - _需求: 9.8, 9.9, 9.16_
  - [x] 2.4 适配插件初始化代码
    - 更新 `src/plugins/index.js` 和 `src/plugins/strategies.js` 中的插件初始化逻辑
    - 确保 multiselect、backpack、search、multilineinput、minimap 插件正常初始化
    - _需求: 9.11, 9.12_

- [x] 3. 检查点 — 确保 Vite 和 Blockly 升级后构建正常
  - 执行 `pnpm install` 安装新依赖
  - 执行 `pnpm run build` 确保生产构建成功
  - 确保所有测试通过，如有问题请向用户确认

- [x] 4. Dockerfile 构建修复 (需求 6)
  - [x] 4.1 修复 Dockerfile 依赖安装流程
    - 将 `COPY package.json pnpm-lock.yaml ./` 放在 `COPY . .` 之前
    - 将 `pnpm install` 改为 `pnpm install --frozen-lockfile`
    - _需求: 6.1, 6.2, 6.3, 6.4_

- [x] 5. 移除 Dev Server CORS 配置 (需求 8)
  - [x] 5.1 清理 vite.config.js 中的 server.cors 配置
    - 删除 `server.cors` 配置块（如存在 origin: "*"、methods、allowedHeaders、credentials 等）
    - 保持 Vite 默认行为
    - _需求: 8.1, 8.2, 8.3_

- [x] 6. ESLint 规则修复 (需求 3)
  - [x] 6.1 更新 .eslintrc.cjs 规则配置
    - 将 `no-unused-vars` 从 "off" 改为 "warn"
    - 将 `no-empty-function` 从 "off" 改为 "warn"
    - 将 `no-empty-pattern` 从 "off" 改为 "warn"
    - _需求: 3.1, 3.2, 3.3_
  - [x] 6.2 处理启用规则后产生的警告
    - 对合理的警告添加行内 `// eslint-disable-next-line` 注释并注明原因
    - 确保无 error 级别的违规
    - _需求: 3.4, 3.5_

- [x] 7. 检查点 — 确保基础设施升级完成
  - 执行 `pnpm run lint` 确保 ESLint 检查通过
  - 执行 `pnpm run build` 确保构建正常
  - 确保所有测试通过，如有问题请向用户确认

- [x] 8. TypeScript 引入 (需求 4)
  - [x] 8.1 创建 tsconfig.json 配置文件
    - 配置 `allowJs: true` 支持 JS/TS 共存
    - 配置 `strict: false` 支持渐进式迁移
    - 配置 `moduleResolution: "bundler"` 适配 Vite
    - 配置路径别名 `@/*` 映射到 `./src/*`
    - _需求: 4.1, 4.2, 4.3, 4.4_
  - [x] 8.2 将 src/utils/Access.js 迁移为 Access.ts
    - 添加类型注解（Role 类型、UserInfo 接口、Access 类的方法签名）
    - 删除原 Access.js 文件
    - 更新所有引用 Access.js 的 import 路径
    - _需求: 4.5, 4.7_
  - [x] 8.3 将 src/blocks/helper.js 迁移为 helper.ts
    - 添加类型注解（BlockDefinition 接口、RegisterData 等函数签名）
    - 删除原 helper.js 文件
    - 更新所有引用 helper.js 的 import 路径
    - _需求: 4.6, 4.7_

- [x] 9. App.vue 职责拆分 (需求 5)
  - [x] 9.1 创建 src/composables/useMessageBridge.ts
    - 提取 postMessage 发送逻辑
    - 提取 handleMessage 消息接收和分发逻辑
    - 提供 `onAction` 注册回调的接口
    - _需求: 5.1_
  - [x] 9.2 创建 src/composables/useCodeGenerator.ts
    - 提取 JavaScript 代码生成逻辑 (`javascriptGenerator.workspaceToCode`)
    - 提取 Lua 代码生成逻辑 (`luaGenerator.workspaceToCode`)
    - 提供 `generateAll` 统一生成接口
    - _需求: 5.3_
  - [x] 9.3 创建 src/composables/useToolboxSetup.ts
    - 提取 toolbox 构建逻辑（调用 `Custom.setup`）
    - 提取默认 Blockly options 配置
    - _需求: 5.4_
  - [x] 9.4 创建 src/composables/useWorkspace.ts
    - 提取工作区序列化 (`Blockly.serialization.workspaces.save`)
    - 提取工作区反序列化 (`Blockly.serialization.workspaces.load`)
    - 提取 `watchWorkspaceReady` 方法，使用 Vue `watch` 替代 setTimeout 轮询
    - _需求: 5.2_
  - [x] 9.5 重构 App.vue 使用新的 composable 模块
    - 引入 useMessageBridge、useWorkspace、useCodeGenerator、useToolboxSetup
    - App.vue 仅保留组件编排和生命周期管理
    - 确保功能行为与拆分前完全一致
    - _需求: 5.5, 5.6_

- [x] 10. 工作区加载机制重构 (需求 7)
  - [x] 10.1 在 useWorkspace.ts 中实现事件驱动的工作区加载
    - 使用 Vue `watch` 监听 workspace ref 变化，当 workspace 非 null 时立即加载数据
    - 添加 5 秒超时保护，超时后记录错误并通知父窗口
    - 添加 `onBeforeUnmount` 清理逻辑
    - 移除 App.vue 中原有的 setTimeout 轮询代码（loadWorkspace 函数中的 retries 逻辑）
    - _需求: 7.1, 7.2, 7.3, 7.4_

- [x] 11. 检查点 — 确保架构重构完成
  - 执行 `pnpm run build` 确保构建正常
  - 确保所有测试通过，如有问题请向用户确认

- [x] 12. 测试覆盖补全 (需求 2)
  - [x] 12.1 删除占位测试并配置测试基础设施
    - 删除 `src/__tests__/example.test.js`
    - 安装 `fast-check` 作为属性测试库的开发依赖
    - 确保 `src/__tests__/setup.js` 配置正确
    - _需求: 2.8_
  - [x] 12.2 编写 Access 权限控制类的单元测试
    - 创建 `src/__tests__/utils/Access.test.ts`
    - 测试 `role` getter、`can` 方法、`is` 方法、`atLeast` 方法
    - 测试 root 角色的无限权限、guest 默认角色等边界情况
    - _需求: 2.6_
  - [x] 12.3 编写 dataUpgrade 数据升级逻辑的单元测试
    - 创建 `src/__tests__/utils/dataUpgrade.test.ts`
    - 测试 `upgradeTweenData` 对 JSON 数据的升级
    - 测试无需升级的数据保持不变
    - 测试 null/undefined 等边界输入
    - _需求: 2.1_
  - [x] 12.4 编写 helper 积木块注册逻辑的单元测试
    - 创建 `src/__tests__/blocks/helper.test.ts`
    - Mock `blockly` 模块，测试 `RegisterData` 正确注册积木块到 Blockly.Blocks 和生成器
    - 测试 `Handler`、`InputEvent`、`OutputEvent` 等参数生成函数的输出格式
    - _需求: 2.1_
  - [x] 12.5 编写代码生成器的单元测试
    - 创建 `src/__tests__/blocks/code-generation.test.ts`
    - Mock Blockly 工作区，测试积木块生成正确的 JavaScript 代码
    - Mock Blockly 工作区，测试积木块生成正确的 Lua 代码
    - _需求: 2.2, 2.3_
  - [x] 12.6 编写 useMessageBridge 通信逻辑的单元测试
    - 创建 `src/__tests__/composables/useMessageBridge.test.ts`
    - Mock `window.parent.postMessage`，测试消息发送
    - 测试消息接收和分发逻辑（init、user-info、save 等 action）
    - 测试无效消息的过滤
    - _需求: 2.4_
  - [x] 12.7 编写 useWorkspace 序列化/反序列化的单元测试
    - 创建 `src/__tests__/composables/useWorkspace.test.ts`
    - Mock Blockly 序列化 API，测试 save/load 往返一致性
    - 测试 watchWorkspaceReady 的超时保护逻辑
    - _需求: 2.5_
  - [x] 12.8 编写 Access 权限模型的属性测试
    - **属性 1: atLeast 传递性 — 如果 role A atLeast role B，且 role B atLeast role C，则 role A atLeast role C**
    - **验证: 需求 2.6**
  - [x] 12.9 编写 dataUpgrade 的属性测试
    - **属性 2: 幂等性 — 对任意数据执行两次 upgradeTweenData 的结果与执行一次相同**
    - **验证: 需求 2.1**

- [x] 13. 最终检查点 — 确保所有测试通过
  - 执行 `pnpm run test:run` 确保全部测试通过
  - 执行 `pnpm run build` 确保生产构建成功
  - 确保所有测试通过，如有问题请向用户确认

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号以确保可追溯性
- 检查点任务确保增量验证，避免问题累积
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
