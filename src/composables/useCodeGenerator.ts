import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import type Blockly from "blockly";

/** Shape returned by `generateAll`. */
export interface GeneratedCode {
  js: string;
  lua: string;
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

  return {
    generateJavaScript,
    generateLua,
    generateAll,
  };
}
