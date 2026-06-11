import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import type { GeneratedCode } from "../composables/useCodeGenerator";

const VALIDATION_WARNING_ID = "save-validation";
const VALIDATION_ERROR_CLASS = "blockly-save-validation-error";

const RESOURCE_FIELD_NAMES = new Set([
  "Action",
  "Book",
  "Entity",
  "Event",
  "Output",
  "Picture",
  "Polygen",
  "Sound",
  "Text",
  "Video",
  "Voxel",
]);

interface FieldLike {
  name?: string;
  getValue?: () => unknown;
}

interface InputLike {
  name?: string;
  type?: number;
  connection?: {
    targetBlock?: () => Blockly.Block | null;
  } | null;
  fieldRow?: FieldLike[];
}

type ValidatedBlock = Blockly.Block & {
  id: string;
  getSvgRoot?: () => SVGElement | null;
  isEnabled?: () => boolean;
  isInFlyout?: boolean;
  inputList?: InputLike[];
  previousConnection?: {
    isConnected?: () => boolean;
  } | null;
  outputConnection?: {
    isConnected?: () => boolean;
  } | null;
  select?: () => void;
  setWarningText?: (text: string | null, id?: string) => void;
};

export interface WorkspaceValidationIssue {
  block?: ValidatedBlock;
  message: string;
}

export interface WorkspaceValidationResult {
  ok: boolean;
  generated?: GeneratedCode;
  issue?: WorkspaceValidationIssue;
}

function getEnabledBlocks(workspace: Blockly.Workspace): ValidatedBlock[] {
  return workspace
    .getAllBlocks(false)
    .filter((block) => {
      const typedBlock = block as ValidatedBlock;
      return !typedBlock.isInFlyout && typedBlock.isEnabled?.() !== false;
    }) as ValidatedBlock[];
}

function clearBlockFeedback(block: ValidatedBlock): void {
  block.setWarningText?.(null, VALIDATION_WARNING_ID);
  block.getSvgRoot?.()?.classList.remove(VALIDATION_ERROR_CLASS);
}

export function clearWorkspaceValidationIssueFeedback(
  issue: WorkspaceValidationIssue
): void {
  if (issue.block) {
    clearBlockFeedback(issue.block);
  }
}

export function clearWorkspaceValidationFeedback(
  workspace: Blockly.Workspace
): void {
  getEnabledBlocks(workspace).forEach(clearBlockFeedback);
}

function setBlockFeedback(issue: WorkspaceValidationIssue): void {
  if (!issue.block) return;

  issue.block.setWarningText?.(issue.message, VALIDATION_WARNING_ID);
  issue.block.getSvgRoot?.()?.classList.add(VALIDATION_ERROR_CLASS);
  issue.block.select?.();
}

export function focusWorkspaceValidationIssue(
  workspace: Blockly.WorkspaceSvg,
  issue: WorkspaceValidationIssue
): void {
  setBlockFeedback(issue);

  if (!issue.block) return;
  workspace.centerOnBlock(issue.block.id);
}

function getInputDisplayName(input: InputLike): string {
  return input.name || "输入项";
}

function hasMissingValueInput(block: ValidatedBlock): WorkspaceValidationIssue | null {
  const missingInput = block.inputList?.find((input) => {
    if (input.type !== Blockly.inputs.inputTypes.VALUE) return false;
    if (!input.connection) return false;
    return !input.connection.targetBlock?.();
  });

  if (!missingInput) return null;

  return {
    block,
    message: `“${block.toString()}”缺少“${getInputDisplayName(
      missingInput
    )}”输入，请补全后再保存。`,
  };
}

function hasMissingResourceField(
  block: ValidatedBlock
): WorkspaceValidationIssue | null {
  for (const input of block.inputList ?? []) {
    for (const field of input.fieldRow ?? []) {
      if (!field.name || !RESOURCE_FIELD_NAMES.has(field.name)) continue;

      const value = field.getValue?.();
      if (value === "" || value === "none" || value == null) {
        return {
          block,
          message: `“${block.toString()}”还没有选择有效的${field.name}，请选择后再保存。`,
        };
      }
    }
  }

  return null;
}

function hasDetachedStatementBlock(
  block: ValidatedBlock
): WorkspaceValidationIssue | null {
  const isStatementBlock = Boolean(block.previousConnection);
  if (!isStatementBlock || block.previousConnection?.isConnected?.()) {
    return null;
  }

  return {
    block,
    message: `“${block.toString()}”没有连接到任何入口或流程中，保存后不会执行，请连接到对应位置后再保存。`,
  };
}

function hasDetachedValueBlock(
  block: ValidatedBlock
): WorkspaceValidationIssue | null {
  const isValueBlock = Boolean(block.outputConnection);
  if (!isValueBlock || block.outputConnection?.isConnected?.()) {
    return null;
  }

  return {
    block,
    message: `“${block.toString()}”没有连接到任何流程或参数中，保存后不会按预期执行，请连接到对应位置后再保存。`,
  };
}

function hasMissingGenerator(block: ValidatedBlock): WorkspaceValidationIssue | null {
  const hasJavascriptGenerator = Boolean(javascriptGenerator.forBlock[block.type]);
  const hasLuaGenerator = Boolean(luaGenerator.forBlock[block.type]);

  if (hasJavascriptGenerator && hasLuaGenerator) return null;

  return {
    block,
    message: `“${block.toString()}”暂不支持生成脚本代码，请删除或替换这个块后再保存。`,
  };
}

function validateBlockForSave(block: ValidatedBlock): WorkspaceValidationIssue | null {
  return (
    hasMissingGenerator(block) ||
    hasMissingValueInput(block) ||
    hasMissingResourceField(block) ||
    hasDetachedStatementBlock(block) ||
    hasDetachedValueBlock(block)
  );
}

export function isWorkspaceValidationIssueResolved(
  issue: WorkspaceValidationIssue
): boolean {
  if (!issue.block) return true;

  return validateBlockForSave(issue.block) === null;
}

function validateGeneratedJavaScript(code: string): WorkspaceValidationIssue | null {
  try {
    new Function(code);
    return null;
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "生成脚本存在语法错误";
    return {
      message: `生成的脚本存在语法错误，无法保存：${message}`,
    };
  }
}

export function validateWorkspaceForSave(
  workspace: Blockly.Workspace,
  generateAll: (workspace: Blockly.Workspace) => GeneratedCode
): WorkspaceValidationResult {
  clearWorkspaceValidationFeedback(workspace);

  for (const block of getEnabledBlocks(workspace)) {
    const issue = validateBlockForSave(block);

    if (issue) {
      return { ok: false, issue };
    }
  }

  try {
    const generated = generateAll(workspace);
    const syntaxIssue = validateGeneratedJavaScript(generated.js);
    if (syntaxIssue) {
      return { ok: false, issue: syntaxIssue };
    }

    return { ok: true, generated };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "生成脚本时出现未知错误";
    return {
      ok: false,
      issue: {
        message: `生成脚本失败，无法保存：${message}`,
      },
    };
  }
}
