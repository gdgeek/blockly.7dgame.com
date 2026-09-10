import { beforeAll, describe, expect, it, vi } from "vitest";
import * as Blockly from "blockly";
import "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import { createWebMcpScriptRequestHandlers } from "@/utils/webMcpScriptHandlers";
import { registerBackpackSerializer } from "@/plugins/backpack-serializer";

beforeAll(() => {
  registerBackpackSerializer();
  Blockly.Blocks.webmcp_test_event = {
    init() {
      this.appendDummyInput().appendField("test event");
    },
  };
  Blockly.Blocks.webmcp_test_next = {
    init() {
      this.appendDummyInput().appendField("next event");
    },
  };
  javascriptGenerator.forBlock.webmcp_test_event = () => "start();\n";
  luaGenerator.forBlock.webmcp_test_event = () => "start()\n";
  javascriptGenerator.forBlock.webmcp_test_next = () => "next();\n";
  luaGenerator.forBlock.webmcp_test_next = () => "next()\n";
  Blockly.Blocks.webmcp_test_container = {
    init() {
      this.appendDummyInput().appendField("container");
      this.appendStatementInput("DO");
    },
  };
  Blockly.Blocks.webmcp_test_statement = {
    init() {
      this.appendDummyInput()
        .appendField("statement")
        .appendField(new Blockly.FieldTextInput("before"), "VALUE");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };
  javascriptGenerator.forBlock.webmcp_test_container = (block, generator) =>
    `container(() => {\n${generator.statementToCode(block, "DO")}});\n`;
  luaGenerator.forBlock.webmcp_test_container = (block, generator) =>
    `container(function()\n${generator.statementToCode(block, "DO")}end)\n`;
  javascriptGenerator.forBlock.webmcp_test_statement = (block) =>
    `step(${JSON.stringify(block.getFieldValue("VALUE"))});\n`;
  luaGenerator.forBlock.webmcp_test_statement = (block) =>
    `step(${JSON.stringify(block.getFieldValue("VALUE"))})\n`;
});

const saveWorkspace = (workspace: Blockly.Workspace) =>
  Blockly.serialization.workspaces.save(workspace) as Record<string, unknown>;

const workspaceData = (type: string) => {
  const workspace = new Blockly.Workspace();
  try {
    workspace.newBlock(type);
    return saveWorkspace(workspace);
  } finally {
    workspace.dispose();
  }
};

const createHandlers = (
  workspace: Blockly.Workspace,
  toolbox: unknown = {
    kind: "categoryToolbox",
    contents: [
      {
        kind: "category",
        name: "测试",
        contents: [
          {
            kind: "block",
            type: "webmcp_test_statement",
            fields: { VALUE: "sample" },
          },
        ],
      },
    ],
  }
) => {
  const onWorkspaceChange = vi.fn();
  const handlers = createWebMcpScriptRequestHandlers({
    getWorkspace: () => workspace as Blockly.WorkspaceSvg,
    getToolbox: () => toolbox,
    saveWorkspace,
    loadWorkspace: (data, target) =>
      Blockly.serialization.workspaces.load(data, target),
    generateAll: (target) => ({
      js: javascriptGenerator.workspaceToCode(target),
      lua: luaGenerator.workspaceToCode(target),
    }),
    onWorkspaceChange,
  });
  return { handlers, onWorkspaceChange };
};

describe("Blockly WebMCP script handlers", () => {
  it("preserves backpack data through headless validation without SVG components", () => {
    const workspace = new Blockly.Workspace();
    try {
      const data = {
        ...workspaceData("webmcp_test_event"),
        backpack: [{ type: "math_number", fields: { NUM: 7 } }],
      };
      Blockly.serialization.workspaces.load(data, workspace);
      expect(saveWorkspace(workspace).backpack).toEqual(data.backpack);
      workspace.clear();
      Blockly.serialization.workspaces.load({}, workspace);
      expect(saveWorkspace(workspace).backpack).toEqual([]);
    } finally {
      workspace.dispose();
    }
  });
  it("reads and validates the real serialized workspace", () => {
    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(
      workspaceData("webmcp_test_event"),
      workspace
    );
    const { handlers } = createHandlers(workspace);

    const result = handlers["webmcp-get-meta-script"]({
      includeWorkspace: true,
      includeGeneratedCode: true,
    });
    expect(result).toMatchObject({
      ok: true,
      valid: true,
      summary: {
        blockCount: 1,
        blockTypes: { webmcp_test_event: 1 },
      },
      generatedCode: { js: "start();\n", lua: "start()\n" },
    });
    workspace.dispose();
  });

  it("exposes the same real-workspace pipeline for scene scripts", () => {
    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(
      workspaceData("webmcp_test_event"),
      workspace
    );
    const { handlers } = createHandlers(workspace);

    expect(
      handlers["webmcp-get-scene-script"]({
        includeWorkspace: false,
        includeGeneratedCode: true,
      })
    ).toMatchObject({
      ok: true,
      valid: true,
      summary: { blockCount: 1 },
      generatedCode: { js: "start();\n", lua: "start()\n" },
    });
    expect(
      handlers["webmcp-validate-scene-script"]({ focusIssue: false })
    ).toMatchObject({ ok: true, valid: true });
    workspace.dispose();
  });

  it("reads the live toolbox catalog and workspace connection structure", () => {
    const workspace = new Blockly.Workspace();
    const container = workspace.newBlock("webmcp_test_container");
    const statement = workspace.newBlock("webmcp_test_statement");
    container
      .getInput("DO")!
      .connection!.connect(statement.previousConnection!);
    const { handlers } = createHandlers(workspace);

    expect(
      handlers["webmcp-get-script-block-catalog"]({
        query: "statement",
        limit: 10,
      })
    ).toMatchObject({
      ok: true,
      matched: 1,
      blocks: [
        {
          type: "webmcp_test_statement",
          category: "测试",
          fields: { VALUE: "sample" },
          connections: { previous: true, next: true, output: false },
        },
      ],
    });

    const structure = handlers["webmcp-get-script-block-structure"]({
      includeSerializedState: true,
    }) as {
      ok: boolean;
      total: number;
      returned: number;
      blocks: Array<Record<string, unknown>>;
    };
    expect(structure).toMatchObject({ ok: true, total: 2, returned: 2 });
    expect(structure.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: statement.id,
          relation: {
            kind: "input",
            parentId: container.id,
            inputName: "DO",
          },
        }),
      ])
    );
    workspace.dispose();
  });

  it("stages and completes semantic block create, edit, connect, move and delete batches", async () => {
    const workspace = new Blockly.Workspace();
    const container = workspace.newBlock("webmcp_test_container");
    const { handlers } = createHandlers(workspace);

    const staged = handlers["webmcp-stage-script-block-batch"]({
      operations: [
        {
          op: "create",
          clientId: "new-step",
          block: {
            type: "webmcp_test_statement",
            fields: { VALUE: "created" },
          },
        },
        {
          op: "set_fields",
          blockId: "new-step",
          fields: { VALUE: "updated" },
        },
        {
          op: "connect",
          blockId: "new-step",
          parentBlockId: container.id,
          connection: "input",
          inputName: "DO",
        },
        { op: "move", blockId: container.id, x: 120, y: 80 },
      ],
    });
    expect(staged).toMatchObject({
      ok: true,
      changed: true,
      operationCount: 4,
      proposed: { blockCount: 2 },
      results: [
        { op: "create", clientId: "new-step" },
        { op: "set_fields", fields: { VALUE: "updated" } },
        { op: "connect", parentBlockId: container.id, inputName: "DO" },
        { op: "move", blockId: container.id },
      ],
    });
    const preview = staged as {
      workspaceVersion: string;
      proposedWorkspace: Record<string, unknown>;
    };
    await expect(
      handlers["webmcp-complete-script-block-batch"]({
        workspaceVersion: preview.workspaceVersion,
        workspace: preview.proposedWorkspace,
      })
    ).resolves.toMatchObject({ ok: true, noChange: false });

    const completedContainer = workspace.getBlockById(container.id)!;
    const connected = completedContainer
      .getInput("DO")!
      .connection!.targetBlock()!;
    expect(connected.getFieldValue("VALUE")).toBe("updated");
    expect(completedContainer.getRelativeToSurfaceXY()).toMatchObject({
      x: 120,
      y: 80,
    });

    const removal = handlers["webmcp-stage-script-block-batch"]({
      operations: [
        { op: "disconnect", blockId: connected.id },
        { op: "delete", blockId: connected.id },
      ],
    });
    expect(removal).toMatchObject({
      ok: true,
      changed: true,
      operationCount: 2,
      proposed: { blockCount: 1 },
    });

    workspace.undo(false);
    const restoredContainer = workspace.getBlockById(container.id)!;
    expect(
      restoredContainer.getInput("DO")!.connection!.targetBlock()
    ).toBeNull();
    workspace.dispose();
  });

  it("stages in a temporary workspace and replaces as one undo group", async () => {
    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(
      workspaceData("webmcp_test_event"),
      workspace
    );
    const { handlers, onWorkspaceChange } = createHandlers(workspace);
    const staged = handlers["webmcp-stage-meta-script-replace"]({
      workspace: workspaceData("webmcp_test_next"),
    });
    expect(staged).toMatchObject({
      ok: true,
      changed: true,
      current: { blockCount: 1 },
      proposed: { blockCount: 1 },
    });
    const stagedPreview = staged as {
      workspaceVersion: string;
      proposedWorkspace: Record<string, unknown>;
    };

    const completed = await handlers["webmcp-complete-meta-script-replace"]({
      workspaceVersion: stagedPreview.workspaceVersion,
      workspace: stagedPreview.proposedWorkspace,
    });
    expect(completed).toMatchObject({ ok: true, noChange: false });
    expect(workspace.getAllBlocks(false)[0].type).toBe("webmcp_test_next");
    expect(onWorkspaceChange).toHaveBeenCalled();

    workspace.undo(false);
    expect(workspace.getAllBlocks(false)[0].type).toBe("webmcp_test_event");
    workspace.dispose();
  });

  it("rejects invalid candidates and detects version conflicts", async () => {
    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(
      workspaceData("webmcp_test_event"),
      workspace
    );
    const { handlers } = createHandlers(workspace);
    const invalid = handlers["webmcp-stage-meta-script-replace"]({
      workspace: {
        blocks: {
          languageVersion: 0,
          blocks: [{ type: "math_number", fields: { NUM: 1 } }],
        },
      },
    });
    expect(invalid).toMatchObject({ ok: false });

    const staged = handlers["webmcp-stage-meta-script-replace"]({
      workspace: workspaceData("webmcp_test_next"),
    });
    const stagedPreview = staged as {
      workspaceVersion: string;
      proposedWorkspace: Record<string, unknown>;
    };
    workspace.newBlock("webmcp_test_event");
    const conflicted = await handlers["webmcp-complete-meta-script-replace"]({
      workspaceVersion: stagedPreview.workspaceVersion,
      workspace: stagedPreview.proposedWorkspace,
    });
    expect(conflicted).toMatchObject({
      ok: false,
      code: "SCRIPT_CONFLICT",
    });
    workspace.dispose();
  });
});
