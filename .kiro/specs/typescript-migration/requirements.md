# 需求文档

## 简介

将 Vue 3 + Blockly 可视化脚本编辑器项目从 JavaScript 完全迁移到 TypeScript。项目当前大部分源码为 `.js` 文件，少量文件（composables、helper.ts、测试文件等）已使用 TypeScript。本次迁移需要将所有剩余的 `.js` 文件转换为 `.ts`（或在 `.vue` 文件中使用 `<script setup lang="ts">`），同时配置严格的 TypeScript 编译选项，确保类型安全和代码质量。

## 术语表

- **迁移系统（Migration_System）**：负责将项目从 JavaScript 转换为 TypeScript 的整体工程流程
- **构建系统（Build_System）**：基于 Vite 的项目构建和开发服务器配置
- **类型检查器（Type_Checker）**：TypeScript 编译器（tsc）的类型检查功能
- **积木块模块（Block_Module）**：`src/blocks/` 下的 Blockly 积木块定义文件，包含 block 定义、代码生成器和工具箱配置
- **插件模块（Plugin_Module）**：`src/plugins/` 下的 Blockly 插件管理文件
- **本地化模块（Localization_Module）**：`src/localization/` 下的多语言支持文件
- **工具箱模块（Toolbox_Module）**：`src/toolbox/` 下的 Blockly 工具箱分类配置文件
- **工具模块（Utils_Module）**：`src/utils/` 和 `src/helper/` 下的通用工具函数
- **自定义模块（Custom_Module）**：`src/custom/` 下的工具箱组装和代码生成器覆写逻辑
- **渲染器模块（Renderer_Module）**：`src/renderers/` 下的自定义 Blockly 渲染器
- **Vue 组件（Vue_Component）**：`.vue` 单文件组件，包括 `App.vue` 和 `BlocklyComponent.vue`
- **入口文件（Entry_File）**：`src/main.js` 应用启动入口
- **配置文件（Config_File）**：`vite.config.js`、`.eslintrc.cjs`、`tsconfig.json` 等项目配置文件

## 需求

### 需求 1：TypeScript 编译配置升级

**用户故事：** 作为开发者，我希望项目具备严格的 TypeScript 编译配置，以便在编译阶段捕获类型错误。

#### 验收标准

1. THE Build_System SHALL 在 `tsconfig.json` 中启用 `strict: true` 选项
2. THE Build_System SHALL 在 `tsconfig.json` 的 `include` 中覆盖所有 `.ts`、`.d.ts`、`.tsx` 和 `.vue` 文件
3. THE Build_System SHALL 在 `tsconfig.json` 中移除对 `.js` 文件的 include 配置（迁移完成后不再需要 `allowJs`）
4. WHEN 执行 `tsc --noEmit` 时，THE Type_Checker SHALL 对所有源码文件完成类型检查且无错误
5. THE Build_System SHALL 在 `package.json` 中添加 `type-check` 脚本命令用于运行 `tsc --noEmit`

### 需求 2：Vite 构建配置迁移

**用户故事：** 作为开发者，我希望 Vite 构建配置文件使用 TypeScript，以便配置文件本身也享有类型提示。

#### 验收标准

1. THE Build_System SHALL 将 `vite.config.js` 重命名为 `vite.config.ts`
2. WHEN 执行 `vite build` 时，THE Build_System SHALL 成功完成构建且无错误
3. WHEN 执行 `vite` 开发服务器时，THE Build_System SHALL 正常启动且无错误

### 需求 3：应用入口文件迁移

**用户故事：** 作为开发者，我希望应用入口文件使用 TypeScript，以便从应用启动开始就具备类型安全。

#### 验收标准

1. THE Migration_System SHALL 将 `src/main.js` 重命名为 `src/main.ts`
2. THE Migration_System SHALL 更新 `index.html` 中的脚本引用，从 `src/main.js` 改为 `src/main.ts`
3. WHEN 应用启动时，THE Entry_File SHALL 正确挂载 Vue 应用实例

### 需求 4：Vue 单文件组件 TypeScript 迁移

**用户故事：** 作为开发者，我希望所有 Vue 组件使用 TypeScript，以便组件的 props、事件和内部逻辑都具备类型安全。

#### 验收标准

1. THE Migration_System SHALL 将 `BlocklyComponent.vue` 的 `<script setup>` 改为 `<script setup lang="ts">`
2. THE Migration_System SHALL 将 `App.vue` 的 `<script setup>` 改为 `<script setup lang="ts">`
3. THE Migration_System SHALL 为 `BlocklyComponent.vue` 的 `props` 添加 TypeScript 类型定义
4. THE Migration_System SHALL 为 `App.vue` 中所有 `ref`、`computed` 和函数参数添加类型注解
5. WHEN 编译 Vue 组件时，THE Type_Checker SHALL 对组件内的 TypeScript 代码完成类型检查且无错误

### 需求 5：积木块模块 TypeScript 迁移

**用户故事：** 作为开发者，我希望所有积木块定义文件使用 TypeScript，以便积木块的结构、代码生成器和参数都具备类型约束。

#### 验收标准

1. THE Migration_System SHALL 将 `src/blocks/` 下所有 `.js` 文件转换为 `.ts` 文件
2. THE Migration_System SHALL 为每个积木块模块的 `type.js` 文件定义导出类型接口
3. THE Migration_System SHALL 为积木块的 `getBlockJson`、`getBlock`、`getJavascript`、`getLua` 方法添加类型注解
4. THE Migration_System SHALL 利用 `src/blocks/helper.ts` 中已定义的 `BlockDefinition` 接口约束所有积木块定义
5. THE Migration_System SHALL 将 `src/blocks/helperJS.js` 合并到 `src/blocks/helper.ts` 中，消除重复的辅助函数文件
6. THE Migration_System SHALL 将 `src/blocks/stocks.js` 转换为 `src/blocks/stocks.ts`
7. WHEN 编译积木块模块时，THE Type_Checker SHALL 对所有积木块文件完成类型检查且无错误

### 需求 6：插件模块 TypeScript 迁移

**用户故事：** 作为开发者，我希望插件管理模块使用 TypeScript，以便插件初始化和生命周期管理具备类型安全。

#### 验收标准

1. THE Migration_System SHALL 将 `src/plugins/index.js` 转换为 `src/plugins/index.ts`
2. THE Migration_System SHALL 将 `src/plugins/strategies.js` 转换为 `src/plugins/strategies.ts`
3. THE Migration_System SHALL 将 `src/plugins/minimap-controller.js` 转换为 `src/plugins/minimap-controller.ts`
4. THE Migration_System SHALL 为 `MinimapController` 类的所有属性和方法添加类型注解
5. THE Migration_System SHALL 为 `strategies` 对象中每个插件初始化函数的参数添加类型注解
6. WHEN 编译插件模块时，THE Type_Checker SHALL 对所有插件文件完成类型检查且无错误

### 需求 7：本地化模块 TypeScript 迁移

**用户故事：** 作为开发者，我希望本地化模块使用 TypeScript，以便多语言键值和语言代码具备类型约束。

#### 验收标准

1. THE Migration_System SHALL 将 `src/localization/index.js` 转换为 `src/localization/index.ts`
2. THE Migration_System SHALL 将 `src/localization/context_menu.js` 转换为 `src/localization/context_menu.ts`
3. THE Migration_System SHALL 将 `src/localization/procedure_override.js` 转换为 `src/localization/procedure_override.ts`
4. THE Migration_System SHALL 为支持的语言代码定义联合类型（如 `'zh-CN' | 'en-US' | 'ja-JP' | 'zh-TW' | 'th-TH'`）
5. THE Migration_System SHALL 为多语言消息映射对象定义类型接口，确保每个语言键都包含所有支持的语言
6. WHEN 编译本地化模块时，THE Type_Checker SHALL 对所有本地化文件完成类型检查且无错误

### 需求 8：工具箱模块 TypeScript 迁移

**用户故事：** 作为开发者，我希望工具箱配置文件使用 TypeScript，以便工具箱分类结构具备类型约束。

#### 验收标准

1. THE Migration_System SHALL 将 `src/toolbox/system/` 下所有 `.js` 文件（logic.js、loop.js、math.js、texts.js、list.js、colour.js）转换为 `.ts` 文件
2. THE Migration_System SHALL 为工具箱分类配置对象定义类型接口
3. WHEN 编译工具箱模块时，THE Type_Checker SHALL 对所有工具箱文件完成类型检查且无错误

### 需求 9：自定义模块 TypeScript 迁移

**用户故事：** 作为开发者，我希望自定义模块使用 TypeScript，以便工具箱组装逻辑和代码生成器覆写具备类型安全。

#### 验收标准

1. THE Migration_System SHALL 将 `src/custom/index.js` 转换为 `src/custom/index.ts`
2. THE Migration_System SHALL 为 `setup` 函数的参数（style、parameters、access）添加类型注解
3. THE Migration_System SHALL 为 Blockly 代码生成器覆写函数添加类型注解
4. WHEN 编译自定义模块时，THE Type_Checker SHALL 对所有自定义模块文件完成类型检查且无错误

### 需求 10：工具函数模块 TypeScript 迁移

**用户故事：** 作为开发者，我希望工具函数模块使用 TypeScript，以便工具函数的输入输出具备类型约束。

#### 验收标准

1. THE Migration_System SHALL 将 `src/utils/dataUpgrade.js` 转换为 `src/utils/dataUpgrade.ts`
2. THE Migration_System SHALL 将 `src/helper/index.js` 转换为 `src/helper/index.ts`
3. THE Migration_System SHALL 为 `upgradeTweenData`、`upgradeTweenXml`、`upgradeTweenJson` 函数的参数和返回值添加类型注解
4. THE Migration_System SHALL 为 `printVector3`、`printVector2`、`cutString` 等工具函数的参数和返回值添加类型注解
5. WHEN 编译工具函数模块时，THE Type_Checker SHALL 对所有工具函数文件完成类型检查且无错误

### 需求 11：渲染器模块 TypeScript 迁移

**用户故事：** 作为开发者，我希望自定义渲染器使用 TypeScript，以便渲染器的类继承和方法覆写具备类型安全。

#### 验收标准

1. THE Migration_System SHALL 将 `src/renderers/sharp-renderer.js` 转换为 `src/renderers/sharp-renderer.ts`
2. THE Migration_System SHALL 为 `SharpConstantProvider` 和 `SharpRenderer` 类添加类型注解
3. WHEN 编译渲染器模块时，THE Type_Checker SHALL 对所有渲染器文件完成类型检查且无错误

### 需求 12：测试基础设施 TypeScript 迁移

**用户故事：** 作为开发者，我希望测试设置文件使用 TypeScript，以便测试基础设施与源码保持一致的语言标准。

#### 验收标准

1. THE Migration_System SHALL 将 `src/__tests__/setup.js` 转换为 `src/__tests__/setup.ts`
2. THE Migration_System SHALL 更新 Vitest 配置中的 `setupFiles` 引用路径
3. WHEN 执行 `vitest run` 时，THE Migration_System SHALL 确保所有现有测试通过且无错误

### 需求 13：ESLint 配置适配

**用户故事：** 作为开发者，我希望 ESLint 配置支持 TypeScript 文件的检查，以便代码风格和质量规则覆盖所有 TypeScript 文件。

#### 验收标准

1. THE Build_System SHALL 安装 `@typescript-eslint/parser` 和 `@typescript-eslint/eslint-plugin` 依赖
2. THE Build_System SHALL 更新 `.eslintrc.cjs` 配置，添加对 `.ts` 文件的支持
3. THE Build_System SHALL 更新 ESLint 的 `extends` 配置，包含 TypeScript 推荐规则
4. WHEN 执行 `eslint` 检查时，THE Build_System SHALL 对 `.ts` 和 `.vue` 文件执行 TypeScript 特定的 lint 规则

### 需求 14：全局类型声明

**用户故事：** 作为开发者，我希望项目具备完整的全局类型声明，以便 `window.lg`、`__BUILD_TIME__` 等全局变量和第三方模块具备类型定义。

#### 验收标准

1. THE Migration_System SHALL 创建 `src/env.d.ts` 文件，声明 Vue 单文件组件的模块类型
2. THE Migration_System SHALL 在全局类型声明中定义 `window.lg` 属性的类型
3. THE Migration_System SHALL 在全局类型声明中定义 `__BUILD_TIME__` 全局常量的类型
4. THE Migration_System SHALL 在全局类型声明中为 Blockly 扩展的 `Blockly.Msg` 属性提供类型支持
5. IF 第三方库缺少类型定义，THEN THE Migration_System SHALL 创建对应的 `.d.ts` 声明文件

### 需求 15：迁移后清理

**用户故事：** 作为开发者，我希望迁移完成后项目中不再存在任何 `.js` 源码文件（配置文件除外），以确保迁移的完整性。

#### 验收标准

1. WHEN 迁移完成后，THE Migration_System SHALL 确保 `src/` 目录下不存在任何 `.js` 源码文件
2. THE Migration_System SHALL 移除 `tsconfig.json` 中的 `allowJs: true` 配置
3. THE Migration_System SHALL 移除 `src/blocks/helperJS.js` 文件（其功能已合并到 `helper.ts`）
4. THE Migration_System SHALL 更新所有文件中的导入路径，确保引用已迁移的 `.ts` 文件
5. WHEN 执行完整构建流程（类型检查 + Vite 构建 + 测试）时，THE Migration_System SHALL 确保所有步骤通过且无错误
