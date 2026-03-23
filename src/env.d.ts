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
