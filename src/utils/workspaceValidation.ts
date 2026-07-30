import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import { parse as parseJavaScript } from "acorn";
import luaparse from "luaparse";
import type {
  GeneratedCode,
  GeneratedCodeLanguage,
} from "../composables/useCodeGenerator";

const VALIDATION_WARNING_ID = "save-validation";
const VALIDATION_WARNING_CLASS = "blockly-save-validation-warning";

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

const SIGNAL_REFERENCE_BLOCK_TYPES = new Set([
  "output_signal",
  "output_signal_item",
  "output_signal_with_parameter",
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
  getFieldValue?: (name: string) => unknown;
  getInputTargetBlock?: (name: string) => Blockly.Block | null;
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
  code: string;
  severity: "warning";
  message: string;
  language?: GeneratedCodeLanguage;
  line?: number;
  column?: number;
}

export interface SerializableWorkspaceWarning {
  blockId?: string;
  code: string;
  severity: "warning";
  message: string;
  language?: GeneratedCodeLanguage;
  line?: number;
  column?: number;
}

export interface WorkspaceValidationResult {
  ok: boolean;
  generated?: GeneratedCode;
  warnings: WorkspaceValidationIssue[];
  error?: WorkspaceValidationIssue;
}

function warning(
  code: string,
  message: string,
  details: Omit<WorkspaceValidationIssue, "code" | "message" | "severity"> = {}
): WorkspaceValidationIssue {
  return { code, severity: "warning", message, ...details };
}

function getAllWorkspaceBlocks(workspace: Blockly.Workspace): ValidatedBlock[] {
  return workspace
    .getAllBlocks(false)
    .filter(
      (block) => !(block as ValidatedBlock).isInFlyout
    ) as ValidatedBlock[];
}

function getEnabledBlocks(workspace: Blockly.Workspace): ValidatedBlock[] {
  return getAllWorkspaceBlocks(workspace).filter(
    (block) => block.isEnabled?.() !== false
  );
}

function clearBlockFeedback(block: ValidatedBlock): void {
  block.setWarningText?.(null, VALIDATION_WARNING_ID);
  block.getSvgRoot?.()?.classList.remove(VALIDATION_WARNING_CLASS);
}

export function clearWorkspaceValidationFeedback(
  workspace: Blockly.Workspace
): void {
  getAllWorkspaceBlocks(workspace).forEach(clearBlockFeedback);
}

export function focusWorkspaceValidationIssue(
  workspace: Blockly.WorkspaceSvg,
  issue: WorkspaceValidationIssue
): void {
  if (!issue.block) return;
  issue.block.select?.();
  workspace.centerOnBlock(issue.block.id);
}

export function showWorkspaceValidationWarnings(
  workspace: Blockly.WorkspaceSvg,
  issues: WorkspaceValidationIssue[]
): void {
  const warningsByBlock = new Map<ValidatedBlock, string[]>();

  for (const issue of issues) {
    if (!issue.block) continue;
    const messages = warningsByBlock.get(issue.block) ?? [];
    messages.push(issue.message);
    warningsByBlock.set(issue.block, messages);
  }

  for (const [block, messages] of warningsByBlock) {
    block.setWarningText?.(messages.join("\n"), VALIDATION_WARNING_ID);
    block.getSvgRoot?.()?.classList.add(VALIDATION_WARNING_CLASS);
  }

  const firstBlockIssue = issues.find((issue) => issue.block);
  if (firstBlockIssue)
    focusWorkspaceValidationIssue(workspace, firstBlockIssue);
}

export function serializeWorkspaceWarnings(
  issues: WorkspaceValidationIssue[]
): SerializableWorkspaceWarning[] {
  return issues.map((issue) => ({
    blockId: issue.block?.id,
    code: issue.code,
    severity: issue.severity,
    message: issue.message,
    language: issue.language,
    line: issue.line,
    column: issue.column,
  }));
}

function getInputDisplayName(input: InputLike): string {
  return input.name || "输入项";
}

function hasMissingValueInput(
  block: ValidatedBlock
): WorkspaceValidationIssue | null {
  const missingInput = block.inputList?.find((input) => {
    if (input.type !== Blockly.inputs.inputTypes.VALUE) return false;
    if (!input.connection) return false;
    return !input.connection.targetBlock?.();
  });

  if (!missingInput) return null;
  return warning(
    "missing-value-input",
    `“${block.toString()}”缺少“${getInputDisplayName(
      missingInput
    )}”输入，将使用生成器默认值。`,
    { block }
  );
}

function hasMissingResourceField(
  block: ValidatedBlock
): WorkspaceValidationIssue | null {
  for (const input of block.inputList ?? []) {
    for (const field of input.fieldRow ?? []) {
      if (!field.name || !RESOURCE_FIELD_NAMES.has(field.name)) continue;
      const value = field.getValue?.();
      if (value === "" || value === "none" || value == null) {
        return warning(
          "missing-resource-field",
          `“${block.toString()}”还没有选择有效的${field.name}，将使用空引用。`,
          { block }
        );
      }
    }
  }
  return null;
}

function hasMalformedSignalReference(
  block: ValidatedBlock
): WorkspaceValidationIssue | null {
  if (!SIGNAL_REFERENCE_BLOCK_TYPES.has(block.type)) return null;
  const rawValue = block.getFieldValue?.("Output");
  if (typeof rawValue !== "string" || !rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as { index?: unknown; uuid?: unknown };
    if (
      parsed &&
      typeof parsed.index === "string" &&
      typeof parsed.uuid === "string"
    ) {
      return null;
    }
  } catch {
    // Report a warning below and let the generator use an empty reference.
  }

  return warning(
    "malformed-signal-reference",
    `“${block.toString()}”包含无法识别的历史信号引用，将使用空引用。`,
    { block }
  );
}

function hasDetachedStatementBlock(
  block: ValidatedBlock
): WorkspaceValidationIssue | null {
  const isStatementBlock = Boolean(block.previousConnection);
  if (!isStatementBlock || block.previousConnection?.isConnected?.())
    return null;
  return warning(
    "detached-statement-block",
    `“${block.toString()}”没有连接到入口或流程，保存后可能不会执行。`,
    { block }
  );
}

function hasDetachedValueBlock(
  block: ValidatedBlock
): WorkspaceValidationIssue | null {
  const isValueBlock = Boolean(block.outputConnection);
  if (!isValueBlock || block.outputConnection?.isConnected?.()) return null;
  return warning(
    "detached-value-block",
    `“${block.toString()}”没有连接到流程或参数，将作为工作区草稿保存。`,
    { block }
  );
}

function hasMissingGenerator(
  block: ValidatedBlock
): WorkspaceValidationIssue | null {
  const missingLanguages = [
    !javascriptGenerator.forBlock[block.type] ? "JavaScript" : "",
    !luaGenerator.forBlock[block.type] ? "Lua" : "",
  ].filter(Boolean);
  if (missingLanguages.length === 0) return null;

  return warning(
    "missing-code-generator",
    `“${block.toString()}”缺少 ${missingLanguages.join(
      " / "
    )} 生成器，将保留相应语言上次成功生成的代码。`,
    { block }
  );
}

function getStaticNumberValue(block: Blockly.Block | null): number | null {
  if (!block) return null;
  if (block.type !== "math_number" && block.type !== "math_integer_number") {
    return null;
  }
  const value = Number((block as ValidatedBlock).getFieldValue?.("NUM"));
  return Number.isFinite(value) ? value : null;
}

function hasInvalidRandomRange(
  block: ValidatedBlock
): WorkspaceValidationIssue | null {
  if (
    block.type !== "math_random_int" &&
    block.type !== "math_random_float_range"
  ) {
    return null;
  }
  const from = getStaticNumberValue(
    block.getInputTargetBlock?.("FROM") ?? null
  );
  const to = getStaticNumberValue(block.getInputTargetBlock?.("TO") ?? null);
  if (from === null || to === null || from < to) return null;

  return warning(
    "invalid-random-range",
    `“${block.toString()}”的随机范围左值不小于右值，结果可能不符合预期。`,
    { block }
  );
}

function validateBlockForSave(
  block: ValidatedBlock
): WorkspaceValidationIssue[] {
  return [
    hasMissingGenerator(block),
    hasMissingValueInput(block),
    hasMissingResourceField(block),
    hasMalformedSignalReference(block),
    hasInvalidRandomRange(block),
    hasDetachedStatementBlock(block),
    hasDetachedValueBlock(block),
  ].filter((issue): issue is WorkspaceValidationIssue => issue !== null);
}

function parserLocation(error: unknown): { line?: number; column?: number } {
  if (!error || typeof error !== "object") return {};
  const candidate = error as {
    loc?: { line?: number; column?: number };
    line?: number;
    column?: number;
  };
  return {
    line: candidate.loc?.line ?? candidate.line,
    column: candidate.loc?.column ?? candidate.column,
  };
}

function parserMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : String(error || "未知语法错误");
}

function validateGeneratedJavaScript(
  code: string
): WorkspaceValidationIssue | null {
  // The host executes generated code inside an async function. Parsing the
  // exact same context avoids falsely warning about valid top-level `await`
  // and `return` statements in Blockly output.
  const wrappedCode = `async function __blockly_generated_script__() {\n${code}\n}`;
  try {
    parseJavaScript(wrappedCode, {
      ecmaVersion: "latest",
      locations: true,
      sourceType: "script",
    });
    if (/(?:\bCS\.MLua\b|(?:^|[^\w$])_G\.)/.test(code)) {
      return warning(
        "lua-runtime-in-javascript",
        "生成的 JavaScript 中包含 Lua 运行时调用，相关历史积木可能需要替换；内容仍会保存。",
        { language: "javascript" }
      );
    }
    return null;
  } catch (error) {
    const location = parserLocation(error);
    if (location.line !== undefined) {
      location.line = Math.max(1, location.line - 1);
    }
    return warning(
      "invalid-generated-javascript",
      `生成的 JavaScript 存在语法问题，内容仍会保存：${parserMessage(error)}`,
      { language: "javascript", ...location }
    );
  }
}

function validateGeneratedLua(code: string): WorkspaceValidationIssue | null {
  try {
    luaparse.parse(code, {
      comments: false,
      locations: true,
      luaVersion: "5.3",
      scope: false,
    });
    return null;
  } catch (error) {
    const location = parserLocation(error);
    return warning(
      "invalid-generated-lua",
      `生成的 Lua 存在语法问题，内容仍会保存：${parserMessage(error)}`,
      { language: "lua", ...location }
    );
  }
}

export function validateWorkspaceForSave(
  workspace: Blockly.Workspace,
  generateAll: (workspace: Blockly.Workspace) => GeneratedCode
): WorkspaceValidationResult {
  const warnings: WorkspaceValidationIssue[] = [];
  try {
    clearWorkspaceValidationFeedback(workspace);
    warnings.push(...getEnabledBlocks(workspace).flatMap(validateBlockForSave));
  } catch (error) {
    warnings.push(
      warning(
        "workspace-validation-failed",
        `部分工作区检查未能完成，内容仍会保存：${parserMessage(error)}`
      )
    );
  }

  try {
    const generated = generateAll(workspace);
    const javascriptIssue = validateGeneratedJavaScript(generated.js);
    const luaIssue = validateGeneratedLua(generated.lua);
    if (javascriptIssue) warnings.push(javascriptIssue);
    if (luaIssue) warnings.push(luaIssue);
    return { ok: true, generated, warnings };
  } catch (error) {
    const technicalIssue = warning(
      "code-generation-failed",
      `脚本生成器运行失败：${parserMessage(error)}`
    );
    return { ok: false, warnings, error: technicalIssue };
  }
}
