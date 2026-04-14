/** 工具箱积木块字段值 */
export interface ToolboxBlockFields {
  [key: string]: string | number | null;
}

/** 工具箱 shadow 或 block 引用 */
export interface ToolboxBlockRef {
  type: string;
  fields?: ToolboxBlockFields;
}

/** 工具箱积木块输入项 */
export interface ToolboxBlockInput {
  shadow?: ToolboxBlockRef;
  block?: ToolboxBlockRef;
}

/** 工具箱积木块内容项 */
export interface ToolboxBlockItem {
  kind: "block";
  type: string;
  fields?: ToolboxBlockFields;
  inputs?: Record<string, ToolboxBlockInput>;
}

/** 工具箱分类配置 */
export interface ToolboxCategory {
  kind: "category";
  name: string;
  colour: string;
  contents: ToolboxBlockItem[];
  [key: string]: unknown;
}
