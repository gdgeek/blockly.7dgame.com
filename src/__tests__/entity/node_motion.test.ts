import { expect, it } from "vitest";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import { RegisterData } from "../../blocks/helper";
import Motion from "../../blocks/entity/node_motion";

it("saves float settings and hides them when the same node motion block stops", () => {
  window.lg = "zh-CN";
  RegisterData(Motion, {});
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock("node_motion");
    block.setFieldValue(2, "AMPLITUDE");
    block.setFieldValue(4, "PERIOD");
    expect(luaGenerator.workspaceToCode(workspace)).toContain("set_float(nil, 2, 4)");
    block.setFieldValue("stopFloat", "MOTION");
    expect(block.getInput("FLOAT_SETTINGS")!.isVisible()).toBe(false);
    const saved = Blockly.serialization.workspaces.save(workspace);
    workspace.clear();
    Blockly.serialization.workspaces.load(saved, workspace);
    expect(javascriptGenerator.workspaceToCode(workspace)).toContain("setFloat(undefined, 0, 0)");
    const restored = workspace.getTopBlocks(false)[0];
    restored.setFieldValue("float", "MOTION");
    expect(restored.getInput("FLOAT_SETTINGS")!.isVisible()).toBe(true);
    expect(luaGenerator.workspaceToCode(workspace)).toContain("set_float(nil, 2, 4)");
  } finally {
    workspace.dispose();
  }
});
