import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import "blockly/blocks";
import "@/blocks/stocks";

describe("legacy stock block generators", () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    workspace = new Blockly.Workspace();
  });

  afterEach(() => {
    workspace.dispose();
  });

  it("keeps the legacy amount input and adds a unique price input", () => {
    const block = workspace.newBlock("stock_buy_prog");

    expect(block.getInput("NAME")).not.toBeNull();
    expect(block.getInput("Price")).not.toBeNull();
    expect(javascriptGenerator.workspaceToCode(workspace)).toBe(
      "buy(0,0,0);\n"
    );
    expect(luaGenerator.workspaceToCode(workspace)).toBe("buy(0,0,0)\n");
  });

  it("loads historical JSON state with inputs.NAME and preserves its output", () => {
    const historicalState = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: "stock_buy_prog",
            inputs: {
              NAME: {
                shadow: {
                  type: "math_number",
                  fields: { NUM: 7 },
                },
              },
            },
          },
        ],
      },
    };

    expect(() =>
      Blockly.serialization.workspaces.load(historicalState, workspace)
    ).not.toThrow();
    expect(javascriptGenerator.workspaceToCode(workspace)).toBe(
      "buy(0,7,7);\n"
    );
    expect(luaGenerator.workspaceToCode(workspace)).toBe("buy(0,7,7)\n");
  });

  it.each(["stock_buy_simple", "stock_fetch_price"])(
    "registers both language generators for %s",
    (type) => {
      expect(javascriptGenerator.forBlock[type]).toBeTypeOf("function");
      expect(luaGenerator.forBlock[type]).toBeTypeOf("function");
    }
  );
});
