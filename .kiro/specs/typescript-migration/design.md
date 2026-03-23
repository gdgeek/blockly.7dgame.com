# 技术设计文档：TypeScript 迁移

## 概述

本设计文档描述将 Vue 3 + Blockly 可视化脚本编辑器项目从 JavaScript 完全迁移到 TypeScript 的技术方案。

项目当前状态：
- **已使用 TypeScript 的部分**：5 个 composables（`.ts`）、`src/blocks/helper.ts`、`src/utils/Access.ts`、所有测试文件（`.test.ts`）
- **待迁移的 JS 文件**：约 80+ 个 `.js` 文件，分布在 `src/blocks/`（19 个子目录 + 2 个根文件）、`src/plugins/`（3 个文件）、`src/localization/`（3 个文件）、`src/toolbox/system/`（6 个文件）、`src/custom/`（1 个文件）、`src/utils/`（1 个文件）、`src/helper/`（1 个文件）、`src/renderers/`（1 个文件）、`src/__tests__/setup.js`、`src/main.js`
- **配置文件**：`vite.config.js` 需迁移为 `.ts`；`tsconfig.json` 需升级为 strict 模式
- **构建工具**：Vite 5 + Vue 3.5 + Blockly 12
- **测试框架**：Vitest + fast-check（已有属性测试）

迁移核心策略是**渐进式、模块化迁移**：按模块依赖顺序逐步转换，确保每一步都能通过构建和测试。

## 架构

### 迁移顺序策略

迁移遵循**自底向上**的依赖顺序，确保被依赖的模块先完成迁移：

```mermaid
graph TD
    A[Phase 1: 基础设施] --> B[Phase 2: 底层工具模块]
    B --> C[Phase 3: 积木块系统]
    C --> D[Phase 4: 上层集成模块]
    D --> E[Phase 5: 入口与组件]
    E --> F[Phase 6: 清理与验证]

    A1[tsconfig.json strict] --> A
    A2[vite.config.ts] --> A
    A3[env.d.ts 全局声明] --> A
    A4[ESLint TS 配置] --> A

    B1[helper.ts 合并 helperJS.js] --> B
    B2[utils/dataUpgrade.ts] --> B
    B3[helper/index.ts] --> B

    C1[blocks/*/type.ts] --> C
    C2[blocks/*/各积木块.ts] --> C
    C3[blocks/*/index.ts] --> C
    C4[blocks/stocks.ts] --> C

    D1[localization/*.ts] --> D
    D2[toolbox/system/*.ts] --> D
    D3[plugins/*.ts] --> D
    D4[custom/index.ts] --> D
    D5[renderers/sharp-renderer.ts] --> D

    E1[main.ts] --> E
    E2[BlocklyComponent.vue lang=ts] --> E
    E3[App.vue lang=ts] --> E
    E4[__tests__/setup.ts] --> E

    F1[移除 allowJs] --> F
    F2[删除 helperJS.js] --> F
    F3[全量验证] --> F
```

### 依赖关系分析

```mermaid
graph LR
    helper.ts --> blocks/*
    helperJS.js --> blocks/*
    localization/index.js --> toolbox/*
    localization/index.js --> custom/index.js
    localization/index.js --> blocks/*/index.js
    blocks/* --> custom/index.js
    utils/Access.ts --> custom/index.js
    plugins/* --> BlocklyComponent.vue
    custom/index.js --> App.vue
    composables/*.ts --> App.vue
    composables/*.ts --> BlocklyComponent.vue
```

## 组件与接口

### 1. 全局类型声明（`src/env.d.ts`）

新建全局类型声明文件，解决 `window.lg`、`__BUILD_TIME__`、Vue SFC 模块声明和缺少类型的第三方库：

```typescript
/// <reference types="vite/client" />

// Vue 单文件组件模块声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

// Vite define 注入的全局常量
declare const __BUILD_TIME__: string

// 扩展 Window 接口
interface Window {
  lg: string
  URL: typeof URL
  BlobBuilder: unknown
  webkitURL?: typeof URL
  WebKitBlobBuilder?: unknown
  MozBlobBuilder?: unknown
}

// 缺少类型声明的第三方模块
declare module '@mit-app-inventor/blockly-plugin-workspace-multiselect' {
  import type Blockly from 'blockly'
  export class Multiselect {
    constructor(workspace: Blockly.WorkspaceSvg)
    init(options?: Record<string, unknown>): void
  }
}
