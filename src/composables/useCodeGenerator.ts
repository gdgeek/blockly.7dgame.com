import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import type Blockly from "blockly";

/** Shape returned by `generateAll`. */
export interface GeneratedCode {
  js: string;
  lua: string;
}

export type GeneratedCodeLanguage = "javascript" | "lua";

export interface CodeGenerationWarning {
  code: "code-generation-failed";
  language: GeneratedCodeLanguage;
  message: string;
}

export interface SafeGeneratedCode {
  generated: GeneratedCode;
  warnings: CodeGenerationWarning[];
}

/**
 * Composable that wraps Blockly code generation for JavaScript and Lua.
 *
 * Keeps the generator imports and invocation in one place so App.vue
 * (and future consumers) don't need to know about individual generators.
 */
export function useCodeGenerator() {
  /**
   * Generate JavaScript code from the given Blockly workspace.
   */
  const generateJavaScript = (workspace: Blockly.Workspace): string => {
    return javascriptGenerator.workspaceToCode(workspace);
  };

  /**
   * Generate Lua code from the given Blockly workspace.
   */
  const generateLua = (workspace: Blockly.Workspace): string => {
    return luaGenerator.workspaceToCode(workspace);
  };

  /**
   * Generate both JavaScript and Lua code in one call.
   */
  const generateAll = (workspace: Blockly.Workspace): GeneratedCode => {
    return {
      js: generateJavaScript(workspace),
      lua: generateLua(workspace),
    };
  };

  /**
   * Generate JavaScript and Lua independently.
   *
   * A broken generator in one language must not prevent users from saving the
   * Blockly workspace. The last successfully generated code for that language
   * is retained and the failure is returned as a warning.
   */
  const generateAllSafely = (
    workspace: Blockly.Workspace,
    fallback: GeneratedCode = { js: "", lua: "" }
  ): SafeGeneratedCode => {
    const generated: GeneratedCode = { ...fallback };
    const warnings: CodeGenerationWarning[] = [];

    try {
      generated.js = generateJavaScript(workspace);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      warnings.push({
        code: "code-generation-failed",
        language: "javascript",
        message: `JavaScript 代码生成失败，已保留上次成功生成的代码：${detail}`,
      });
    }

    try {
      generated.lua = generateLua(workspace);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      warnings.push({
        code: "code-generation-failed",
        language: "lua",
        message: `Lua 代码生成失败，已保留上次成功生成的代码：${detail}`,
      });
    }

    return { generated, warnings };
  };

  return {
    generateJavaScript,
    generateLua,
    generateAll,
    generateAllSafely,
  };
}
