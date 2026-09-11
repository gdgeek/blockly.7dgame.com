import * as Blockly from "blockly";
import type {
  GeneratedCode,
  SafeGeneratedCode,
} from "../composables/useCodeGenerator";
import { replaceWorkspaceTransaction } from "./webMcpWorkspaceTransaction";
import { upgradeTweenData } from "./dataUpgrade";
import {
  focusWorkspaceValidationIssue,
  serializeWorkspaceWarnings,
  validateWorkspaceForSave,
  type WorkspaceValidationIssue,
} from "./workspaceValidation";

type JsonRecord = Record<string, unknown>;
type LoadWorkspace = (data: object, workspace: Blockly.Workspace) => void;
type GenerateAll = (workspace: Blockly.Workspace) => GeneratedCode;

export type WebMcpScriptHandlerOptions = {
  getWorkspace: () => Blockly.Workspace | null;
  getGeneration?: () => unknown;
  getToolbox?: () => unknown;
  saveWorkspace: (workspace: Blockly.Workspace) => JsonRecord;
  loadWorkspace: LoadWorkspace;
  generateAll: GenerateAll;
  generateAllSafely?: (workspace: Blockly.Workspace) => SafeGeneratedCode;
  onMutationSettled: () => void;
};

const MAX_WORKSPACE_BYTES = 512 * 1024;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])])
  );
};

const serialized = (value: unknown) => JSON.stringify(stableValue(value));
const byteLength = (value: string) => new TextEncoder().encode(value).length;
const fingerprint = (value: unknown) => serialized(value);

const requireWorkspace = (options: WebMcpScriptHandlerOptions) => {
  const workspace = options.getWorkspace();
  if (!workspace) throw new Error("Blockly 工作区尚未准备完成");
  return workspace;
};

const parseCandidate = (value: unknown) => {
  if (!isRecord(value)) throw new TypeError("workspace 必须是对象");
  const json = JSON.stringify(value);
  if (byteLength(json) > MAX_WORKSPACE_BYTES) {
    throw new RangeError("workspace 不能超过 512 KB");
  }
  return clone(value);
};

const serializeIssue = (issue?: WorkspaceValidationIssue) => {
  if (!issue) return undefined;
  return {
    message: issue.message,
    blockId: issue.block?.id,
    blockType: issue.block?.type,
    blockText: issue.block?.toString(),
  };
};

const summarizeWorkspace = (
  workspace: Blockly.Workspace,
  workspaceData: JsonRecord,
  generated?: GeneratedCode
) => {
  const blockTypes: Record<string, number> = {};
  for (const block of workspace.getAllBlocks(false)) {
    blockTypes[block.type] = (blockTypes[block.type] ?? 0) + 1;
  }
  return {
    blockCount: workspace.getAllBlocks(false).length,
    topLevelBlockCount: workspace.getTopBlocks(false).length,
    variableCount: workspace.getVariableMap().getAllVariables().length,
    commentCount: workspace.getTopComments(false).length,
    blockTypes: Object.fromEntries(
      Object.entries(blockTypes).sort(([left], [right]) =>
        left.localeCompare(right)
      )
    ),
    serializedBytes: byteLength(JSON.stringify(workspaceData)),
    generatedJavaScriptBytes: generated ? byteLength(generated.js) : 0,
    generatedLuaBytes: generated ? byteLength(generated.lua) : 0,
  };
};

const inspectWorkspace = (
  workspace: Blockly.Workspace,
  options: WebMcpScriptHandlerOptions
) => {
  const workspaceData = options.saveWorkspace(workspace);
  const generation = options.generateAllSafely?.(workspace);
  const validation = validateWorkspaceForSave(
    workspace,
    generation ? () => generation.generated : options.generateAll
  );
  const generationWarnings: WorkspaceValidationIssue[] = (
    generation?.warnings ?? []
  ).map((warning) => ({ ...warning, severity: "warning" }));
  const warnings = [...generationWarnings, ...validation.warnings];
  const canSave = validation.ok && generationWarnings.length === 0;
  return {
    workspaceData,
    workspaceVersion: fingerprint(workspaceData),
    canSave,
    valid: canSave && warnings.length === 0,
    validationScope: "workspace-and-generated-syntax",
    warnings: serializeWorkspaceWarnings(warnings),
    issue: serializeIssue(validation.error ?? warnings[0]),
    generated: validation.generated,
    summary: summarizeWorkspace(workspace, workspaceData, validation.generated),
    rawIssue: validation.error ?? warnings[0],
  };
};

const inspectCandidate = (
  candidate: JsonRecord,
  options: WebMcpScriptHandlerOptions
) => {
  const workspace = new Blockly.Workspace();
  try {
    const upgraded = upgradeTweenData(clone(candidate)) as object;
    options.loadWorkspace(upgraded, workspace);
    const inspected = inspectWorkspace(workspace, options);
    if (!inspected.canSave) {
      throw new Error(inspected.issue?.message || "候选 Blockly 工作区无效");
    }
    return inspected;
  } finally {
    workspace.dispose();
  }
};

const flushBlocklyEvents = () =>
  new Promise<void>((resolve) => {
    const finish = () => window.setTimeout(resolve, 0);
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(finish);
    } else {
      finish();
    }
  });

const finiteNumber = (value: unknown, name: string) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} 必须是有限数字`);
  }
  return value;
};

const positiveInteger = (value: unknown, fallback: number, maximum: number) => {
  if (value === undefined) return fallback;
  if (
    !Number.isInteger(value) ||
    Number(value) < 1 ||
    Number(value) > maximum
  ) {
    throw new RangeError(`limit 必须是 1 到 ${maximum} 的整数`);
  }
  return Number(value);
};

const blockFields = (block: Blockly.Block) => {
  const fields: Record<string, unknown> = {};
  for (const input of block.inputList) {
    for (const field of input.fieldRow) {
      if (!field.name) continue;
      fields[field.name] = field.getValue();
    }
  }
  return fields;
};

const inputKind = (input: Blockly.Input) => {
  if (!input.connection) return "dummy";
  if (input.connection.type === Blockly.ConnectionType.INPUT_VALUE) {
    return "value";
  }
  if (input.connection.type === Blockly.ConnectionType.NEXT_STATEMENT) {
    return "statement";
  }
  return "unknown";
};

const connectionChecks = (connection?: Blockly.Connection | null) =>
  connection?.getCheck?.() ?? null;

const toolboxBlockState = (item: JsonRecord) => {
  const state = clone(item);
  delete state.kind;
  if (typeof state.type !== "string" || !state.type) {
    throw new TypeError("工具箱积木缺少 type");
  }
  return state;
};

const describeToolboxBlock = (item: JsonRecord, categoryPath: string[]) => {
  const state = toolboxBlockState(item);
  const workspace = new Blockly.Workspace();
  try {
    const block = Blockly.serialization.blocks.append(
      state as unknown as Parameters<
        typeof Blockly.serialization.blocks.append
      >[0],
      workspace
    );
    const serializedState = Blockly.serialization.blocks.save(block, {
      addCoordinates: false,
      addInputBlocks: true,
      addNextBlocks: true,
      doFullSerialization: true,
      saveIds: false,
    });
    return {
      type: block.type,
      category: categoryPath.join(" / "),
      text: block.toString(160),
      fields: blockFields(block),
      inputs: block.inputList
        .filter((input) => Boolean(input.name))
        .map((input) => ({
          name: input.name,
          kind: inputKind(input),
          checks: connectionChecks(input.connection),
        })),
      connections: {
        previous: Boolean(block.previousConnection),
        next: Boolean(block.nextConnection),
        output: Boolean(block.outputConnection),
        previousChecks: connectionChecks(block.previousConnection),
        nextChecks: connectionChecks(block.nextConnection),
        outputChecks: connectionChecks(block.outputConnection),
      },
      sampleState: serializedState ?? state,
    };
  } finally {
    workspace.dispose();
  }
};

const getScriptBlockCatalog = (
  payload: JsonRecord,
  options: WebMcpScriptHandlerOptions
) => {
  const toolbox = options.getToolbox?.();
  if (!isRecord(toolbox) || !Array.isArray(toolbox.contents)) {
    throw new Error("Blockly 工具箱尚未准备完成");
  }
  const query =
    typeof payload.query === "string" ? payload.query.trim().toLowerCase() : "";
  const categoryFilter =
    typeof payload.category === "string"
      ? payload.category.trim().toLowerCase()
      : "";
  const limit = positiveInteger(payload.limit, 100, 250);
  const blocks: Array<Record<string, unknown>> = [];
  const categories: Array<{
    name: string;
    path: string;
    dynamic: boolean;
  }> = [];
  let matched = 0;

  const visit = (items: unknown[], categoryPath: string[]) => {
    for (const rawItem of items) {
      if (!isRecord(rawItem)) continue;
      if (rawItem.kind === "category") {
        const name =
          typeof rawItem.name === "string" && rawItem.name.trim()
            ? rawItem.name.trim()
            : "未命名分类";
        const path = [...categoryPath, name];
        categories.push({
          name,
          path: path.join(" / "),
          dynamic: typeof rawItem.custom === "string",
        });
        if (Array.isArray(rawItem.contents)) visit(rawItem.contents, path);
        continue;
      }
      if (rawItem.kind !== "block" || typeof rawItem.type !== "string") {
        continue;
      }
      const category = categoryPath.join(" / ");
      if (categoryFilter && !category.toLowerCase().includes(categoryFilter)) {
        continue;
      }
      let descriptor: Record<string, unknown>;
      try {
        descriptor = describeToolboxBlock(rawItem, categoryPath);
      } catch (error) {
        descriptor = {
          type: rawItem.type,
          category,
          unavailableReason:
            error instanceof Error ? error.message : String(error),
          sampleState: toolboxBlockState(rawItem),
        };
      }
      const haystack = [descriptor.type, descriptor.category, descriptor.text]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .toLowerCase();
      if (query && !haystack.includes(query)) continue;
      matched += 1;
      if (blocks.length < limit) blocks.push(descriptor);
    }
  };

  visit(toolbox.contents, []);
  return {
    ok: true,
    matched,
    returned: blocks.length,
    truncated: matched > blocks.length,
    categories,
    catalogScope: "static-toolbox",
    dynamicCategoriesExpanded: false,
    blocks,
  };
};

const describeWorkspaceBlock = (
  block: Blockly.Block,
  includeSerializedState: boolean
) => {
  const parent = block.getParent();
  let relation: Record<string, unknown> = { kind: "top" };
  if (parent) {
    if (parent.nextConnection?.targetBlock() === block) {
      relation = { kind: "next", parentId: parent.id };
    } else {
      const parentInput = parent.inputList.find(
        (input) => input.connection?.targetBlock() === block
      );
      relation = {
        kind: "input",
        parentId: parent.id,
        inputName: parentInput?.name ?? null,
      };
    }
  }
  const coordinate = !parent ? block.getRelativeToSurfaceXY() : null;
  return {
    id: block.id,
    type: block.type,
    text: block.toString(160),
    enabled: block.isEnabled(),
    collapsed: block.isCollapsed(),
    data: block.data,
    fields: blockFields(block),
    relation,
    position: coordinate ? { x: coordinate.x, y: coordinate.y } : undefined,
    inputs: block.inputList
      .filter((input) => Boolean(input.name))
      .map((input) => ({
        name: input.name,
        kind: inputKind(input),
        connectedBlockId: input.connection?.targetBlock()?.id ?? null,
      })),
    nextBlockId: block.nextConnection?.targetBlock()?.id ?? null,
    connections: {
      previous: Boolean(block.previousConnection),
      next: Boolean(block.nextConnection),
      output: Boolean(block.outputConnection),
    },
    serializedState: includeSerializedState
      ? Blockly.serialization.blocks.save(block, {
          addCoordinates: true,
          addInputBlocks: false,
          addNextBlocks: false,
          doFullSerialization: true,
          saveIds: true,
        })
      : undefined,
  };
};

const getScriptBlockStructure = (
  payload: JsonRecord,
  options: WebMcpScriptHandlerOptions
) => {
  const workspace = requireWorkspace(options);
  const includeSerializedState = payload.includeSerializedState === true;
  const limit = positiveInteger(payload.limit, 200, 500);
  let blocks: Blockly.Block[];
  if (payload.blockId !== undefined) {
    if (typeof payload.blockId !== "string" || !payload.blockId.trim()) {
      throw new TypeError("blockId 不能为空");
    }
    const block = workspace.getBlockById(payload.blockId.trim());
    if (!block) throw new Error(`找不到积木：${payload.blockId}`);
    blocks = block.getDescendants(false);
  } else {
    blocks = workspace.getAllBlocks(false);
  }
  const inspected = inspectWorkspace(workspace, options);
  return {
    ok: true,
    workspaceVersion: inspected.workspaceVersion,
    summary: inspected.summary,
    total: blocks.length,
    returned: Math.min(blocks.length, limit),
    truncated: blocks.length > limit,
    blocks: blocks
      .slice(0, limit)
      .map((block) => describeWorkspaceBlock(block, includeSerializedState)),
  };
};

const requireOperationBlock = (
  workspace: Blockly.Workspace,
  aliases: Map<string, string>,
  reference: unknown,
  name: string
) => {
  if (typeof reference !== "string" || !reference.trim()) {
    throw new TypeError(`${name} 不能为空`);
  }
  const normalized = reference.trim();
  const blockId = aliases.get(normalized) ?? normalized;
  const block = workspace.getBlockById(blockId);
  if (!block) throw new Error(`找不到积木：${normalized}`);
  return block;
};

const parseBatchOperations = (value: unknown) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError("operations 必须是非空数组");
  }
  if (value.length > 100) {
    throw new RangeError("一次最多执行 100 个积木操作");
  }
  if (byteLength(JSON.stringify(value)) > 256 * 1024) {
    throw new RangeError("Block operations cannot exceed 256 KB");
  }
  return value.map((operation, index) => {
    if (!isRecord(operation) || typeof operation.op !== "string") {
      throw new TypeError(`operations[${index}] 缺少 op`);
    }
    return operation;
  });
};

const moveTopBlock = (block: Blockly.Block, x: unknown, y: unknown) => {
  if (block.getParent())
    throw new Error(`积木 ${block.id} 不是顶层积木，不能移动`);
  const targetX = finiteNumber(x, "x");
  const targetY = finiteNumber(y, "y");
  const current = block.getRelativeToSurfaceXY();
  block.moveBy(targetX - current.x, targetY - current.y);
};

const connectBlocks = (
  child: Blockly.Block,
  parent: Blockly.Block,
  operation: JsonRecord
) => {
  if (child.id === parent.id) throw new Error("积木不能连接到自身");
  let targetConnection: Blockly.Connection | null = null;
  if (operation.connection === "next") {
    targetConnection = parent.nextConnection;
    if (!targetConnection) throw new Error(`积木 ${parent.id} 没有 next 连接`);
  } else if (operation.connection === "input") {
    if (typeof operation.inputName !== "string" || !operation.inputName) {
      throw new TypeError("input 连接必须提供 inputName");
    }
    const input = parent.getInput(operation.inputName);
    targetConnection = input?.connection ?? null;
    if (!targetConnection) {
      throw new Error(`积木 ${parent.id} 没有输入 ${operation.inputName}`);
    }
  } else {
    throw new TypeError("connection 必须是 next 或 input");
  }

  const childConnection =
    targetConnection.type === Blockly.ConnectionType.INPUT_VALUE
      ? child.outputConnection
      : child.previousConnection;
  if (!childConnection) {
    throw new Error(`积木 ${child.id} 没有兼容的连接端`);
  }
  if (targetConnection.isConnected()) {
    if (operation.replace !== true) {
      throw new Error("目标连接已经被占用；如需替换请设置 replace=true");
    }
    targetConnection.disconnect();
  }
  child.unplug(false);
  targetConnection.connect(childConnection);
};

const applyScriptBlockBatch = (
  workspace: Blockly.Workspace,
  operations: JsonRecord[]
) => {
  const aliases = new Map<string, string>();
  return operations.map((operation, index) => {
    const op = operation.op;
    if (op === "create") {
      if (!isRecord(operation.block)) {
        throw new TypeError(`operations[${index}].block 必须是对象`);
      }
      const state = clone(operation.block);
      delete state.kind;
      if (typeof state.type !== "string" || !state.type) {
        throw new TypeError(`operations[${index}].block.type 不能为空`);
      }
      if (operation.x !== undefined) state.x = finiteNumber(operation.x, "x");
      if (operation.y !== undefined) state.y = finiteNumber(operation.y, "y");
      const block = Blockly.serialization.blocks.append(
        state as unknown as Parameters<
          typeof Blockly.serialization.blocks.append
        >[0],
        workspace
      );
      let clientId: string | undefined;
      if (operation.clientId !== undefined) {
        if (
          typeof operation.clientId !== "string" ||
          !operation.clientId.trim()
        ) {
          throw new TypeError("clientId 不能为空");
        }
        clientId = operation.clientId.trim();
        if (aliases.has(clientId) || workspace.getBlockById(clientId)) {
          throw new Error(`clientId 与已有积木或别名冲突：${clientId}`);
        }
        aliases.set(clientId, block.id);
      }
      return { index, op, clientId, blockId: block.id, blockType: block.type };
    }

    const block = requireOperationBlock(
      workspace,
      aliases,
      operation.blockId,
      `operations[${index}].blockId`
    );
    if (op === "set_fields") {
      if (
        !isRecord(operation.fields) ||
        Object.keys(operation.fields).length === 0
      ) {
        throw new TypeError("fields 必须是非空对象");
      }
      const applied: Record<string, unknown> = {};
      const previousFields: Record<string, unknown> = {};
      for (const [name, value] of Object.entries(operation.fields)) {
        if (!block.getField(name)) {
          throw new Error(`积木 ${block.id} 没有字段 ${name}`);
        }
        previousFields[name] = block.getFieldValue(name);
        block.setFieldValue(value, name);
        applied[name] = block.getFieldValue(name);
      }
      return {
        index,
        op,
        blockId: block.id,
        blockType: block.type,
        previousFields,
        fields: applied,
      };
    }
    if (op === "set_state") {
      const previousState = {
        enabled: block.isEnabled(),
        collapsed: block.isCollapsed(),
        data: block.data,
      };
      let changed = false;
      if (operation.enabled !== undefined) {
        if (typeof operation.enabled !== "boolean") {
          throw new TypeError("enabled 必须是布尔值");
        }
        block.setDisabledReason(!operation.enabled, "MANUALLY_DISABLED");
        changed = true;
      }
      if (operation.collapsed !== undefined) {
        if (typeof operation.collapsed !== "boolean") {
          throw new TypeError("collapsed 必须是布尔值");
        }
        block.setCollapsed(operation.collapsed);
        changed = true;
      }
      if (operation.data !== undefined) {
        if (operation.data !== null && typeof operation.data !== "string") {
          throw new TypeError("data 必须是字符串或 null");
        }
        block.data = operation.data as string | null;
        changed = true;
      }
      if (!changed) throw new TypeError("set_state 至少需要一个状态字段");
      return {
        index,
        op,
        blockId: block.id,
        blockType: block.type,
        previousState,
        enabled: block.isEnabled(),
        collapsed: block.isCollapsed(),
        data: block.data,
      };
    }
    if (op === "move") {
      const previousPosition = { ...block.getRelativeToSurfaceXY() };
      moveTopBlock(block, operation.x, operation.y);
      const position = block.getRelativeToSurfaceXY();
      return {
        index,
        op,
        blockId: block.id,
        blockType: block.type,
        previousPosition,
        position,
      };
    }
    if (op === "connect") {
      const parent = requireOperationBlock(
        workspace,
        aliases,
        operation.parentBlockId,
        `operations[${index}].parentBlockId`
      );
      connectBlocks(block, parent, operation);
      return {
        index,
        op,
        blockId: block.id,
        parentBlockId: parent.id,
        connection: operation.connection,
        inputName: operation.inputName,
      };
    }
    if (op === "disconnect") {
      if (!block.getParent())
        throw new Error(`积木 ${block.id} 已经是顶层积木`);
      block.unplug(operation.healStack === true);
      return { index, op, blockId: block.id };
    }
    if (op === "delete") {
      const blockId = block.id;
      const blockType = block.type;
      block.dispose(operation.healStack === true);
      return { index, op, blockId, blockType };
    }
    throw new TypeError(`不支持的积木操作：${op}`);
  });
};

const stageScriptBlockBatch = (
  payload: JsonRecord,
  options: WebMcpScriptHandlerOptions
) => {
  const liveWorkspace = requireWorkspace(options);
  const current = inspectWorkspace(liveWorkspace, options);
  const operations = parseBatchOperations(payload.operations);
  const workspace = new Blockly.Workspace();
  try {
    options.loadWorkspace(
      upgradeTweenData(clone(current.workspaceData)) as object,
      workspace
    );
    const results = applyScriptBlockBatch(workspace, operations);
    const proposed = inspectWorkspace(workspace, options);
    parseCandidate(proposed.workspaceData);
    if (!proposed.canSave) {
      throw new Error(proposed.issue?.message || "积木操作后的工作区无效");
    }
    if (proposed.summary.serializedBytes > MAX_WORKSPACE_BYTES) {
      throw new RangeError("积木操作后的 workspace 不能超过 512 KB");
    }
    return {
      ok: true,
      workspaceVersion: current.workspaceVersion,
      current: current.summary,
      proposed: proposed.summary,
      warnings: proposed.warnings,
      canSave: proposed.canSave,
      proposedWorkspace: proposed.workspaceData,
      changed: current.workspaceVersion !== proposed.workspaceVersion,
      operationCount: operations.length,
      results,
    };
  } finally {
    workspace.dispose();
  }
};

const errorResult = (error: unknown) => ({
  ok: false,
  code: error instanceof RangeError ? "INVALID_RANGE" : "INVALID_REQUEST",
  error: error instanceof Error ? error.message : String(error),
});

export const createWebMcpScriptRequestHandlers = (
  options: WebMcpScriptHandlerOptions
) => {
  const getScript = (payload: JsonRecord) => {
    try {
      const workspace = requireWorkspace(options);
      const inspected = inspectWorkspace(workspace, options);
      return {
        ok: true,
        workspaceVersion: inspected.workspaceVersion,
        summary: inspected.summary,
        valid: inspected.valid,
        canSave: inspected.canSave,
        warnings: inspected.warnings,
        validationScope: inspected.validationScope,
        issue: inspected.issue,
        workspace: payload.includeWorkspace
          ? inspected.workspaceData
          : undefined,
        generatedCode:
          payload.includeGeneratedCode && inspected.generated
            ? {
                js: inspected.generated.js,
                lua: inspected.generated.lua,
              }
            : undefined,
      };
    } catch (error) {
      return errorResult(error);
    }
  };

  const validateScript = (payload: JsonRecord) => {
    try {
      const workspace = requireWorkspace(options);
      const inspected = inspectWorkspace(workspace, options);
      if (
        payload.focusIssue &&
        inspected.rawIssue &&
        workspace instanceof Blockly.WorkspaceSvg
      ) {
        focusWorkspaceValidationIssue(workspace, inspected.rawIssue);
      }
      return {
        ok: true,
        workspaceVersion: inspected.workspaceVersion,
        summary: inspected.summary,
        valid: inspected.valid,
        canSave: inspected.canSave,
        warnings: inspected.warnings,
        validationScope: inspected.validationScope,
        issue: inspected.issue,
      };
    } catch (error) {
      return errorResult(error);
    }
  };

  const stageScriptReplace = (payload: JsonRecord) => {
    try {
      const workspace = requireWorkspace(options);
      const current = inspectWorkspace(workspace, options);
      const proposed = inspectCandidate(
        parseCandidate(payload.workspace),
        options
      );
      return {
        ok: true,
        workspaceVersion: current.workspaceVersion,
        current: current.summary,
        proposed: proposed.summary,
        warnings: proposed.warnings,
        canSave: proposed.canSave,
        proposedWorkspace: proposed.workspaceData,
        changed: current.workspaceVersion !== proposed.workspaceVersion,
      };
    } catch (error) {
      return errorResult(error);
    }
  };

  let mutationInFlight = false;
  const completeScriptReplace = async (payload: JsonRecord) => {
    if (mutationInFlight)
      return {
        ok: false,
        code: "SCRIPT_BUSY",
        error: "Another script mutation is still settling",
      };
    mutationInFlight = true;
    const generation = options.getGeneration?.();
    try {
      const workspace = requireWorkspace(options);
      if (typeof payload.workspaceVersion !== "string") {
        throw new TypeError("workspaceVersion 不能为空");
      }
      const current = inspectWorkspace(workspace, options);
      if (current.workspaceVersion !== payload.workspaceVersion) {
        return {
          ok: false,
          code: "SCRIPT_CONFLICT",
          error: "Blockly 工作区在预览后已变化，请重新预览",
        };
      }
      const proposed = inspectCandidate(
        parseCandidate(payload.workspace),
        options
      );
      if (current.workspaceVersion === proposed.workspaceVersion) {
        return {
          ok: true,
          noChange: true,
          workspaceVersion: current.workspaceVersion,
          summary: current.summary,
        };
      }

      replaceWorkspaceTransaction(
        workspace,
        proposed.workspaceData,
        options.saveWorkspace
      );
      await flushBlocklyEvents();
      if (
        options.getWorkspace() !== workspace ||
        options.getGeneration?.() !== generation
      ) {
        return {
          ok: false,
          code: "STALE_SESSION",
          error: "Script editor session changed",
        };
      }
      const completed = inspectWorkspace(workspace, options);
      let runtimeSyncWarning: string | undefined;
      try {
        options.onMutationSettled();
      } catch (error) {
        runtimeSyncWarning =
          error instanceof Error ? error.message : String(error);
      }
      return {
        ok: true,
        noChange: false,
        applied: true,
        runtimeSyncWarning,
        workspaceVersion: completed.workspaceVersion,
        summary: completed.summary,
        warnings: completed.warnings,
        canSave: completed.canSave,
      };
    } catch (error) {
      return errorResult(error);
    } finally {
      mutationInFlight = false;
    }
  };

  const getBlockCatalog = (payload: JsonRecord) => {
    try {
      return getScriptBlockCatalog(payload, options);
    } catch (error) {
      return errorResult(error);
    }
  };

  const getBlockStructure = (payload: JsonRecord) => {
    try {
      return getScriptBlockStructure(payload, options);
    } catch (error) {
      return errorResult(error);
    }
  };

  const stageBlockBatch = (payload: JsonRecord) => {
    try {
      return stageScriptBlockBatch(payload, options);
    } catch (error) {
      return errorResult(error);
    }
  };

  const handlers = {
    "webmcp-get-meta-script": getScript,
    "webmcp-validate-meta-script": validateScript,
    "webmcp-stage-meta-script-replace": stageScriptReplace,
    "webmcp-complete-meta-script-replace": completeScriptReplace,
    "webmcp-get-scene-script": getScript,
    "webmcp-validate-scene-script": validateScript,
    "webmcp-stage-scene-script-replace": stageScriptReplace,
    "webmcp-complete-scene-script-replace": completeScriptReplace,
    "webmcp-get-script-block-catalog": getBlockCatalog,
    "webmcp-get-script-block-structure": getBlockStructure,
    "webmcp-stage-script-block-batch": stageBlockBatch,
    "webmcp-complete-script-block-batch": completeScriptReplace,
  };
  return {
    ...handlers,
    "webmcp-get-capabilities": () => ({
      ok: true,
      enabled: true,
      revision: options.getGeneration?.(),
      protocolVersion: 1,
      capabilities: Object.keys(handlers),
      atomicReplacement: true,
      groupedUndo: true,
    }),
  };
};
