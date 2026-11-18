import { describe, it, expect } from "vitest";
import * as Blockly from "blockly";
import visual from "../../blocks/entity/visual_execute";
import type { BlocklyBlock, BlocklyGenerator } from "../../blocks/helper";
import { upgradeTweenData } from "../../utils/dataUpgrade";
import "../../localization";

function setup() {
  window.lg = "zh-CN";
  Blockly.Blocks.visual_execute = visual.getBlock!({});
  return new Blockly.Workspace();
}
const generator = {
  ORDER_NONE: 0,
  ORDER_ATOMIC: 0,
  valueToCode: (_block: unknown, name: string) =>
    name === "entity" ? "node" : "true",
} as unknown as BlocklyGenerator;

describe("existing visibility block", () => {
  it("loads old XML with no new fields and preserves both original calls", () => {
    const workspace = setup();
    Blockly.Xml.domToWorkspace(
      Blockly.utils.xml.textToDom('<xml><block type="visual_execute" /></xml>'),
      workspace,
    );
    const block = workspace.getTopBlocks(false)[0] as unknown as BlocklyBlock;
    expect(visual.getJavascript!({})(block, generator)).toBe(
      "point.setVisual(node, true);\n",
    );
    expect(visual.getLua!({})(block, generator)).toBe(
      "_G.point.set_visual(node, true)\n",
    );
    workspace.dispose();
  });
  it("reveals duration for fades and survives JSON serialization", () => {
    const workspace = setup();
    const block = workspace.newBlock("visual_execute");
    expect(block.getInputsInline()).toBe(true);
    expect(block.inputList.map((input) => input.name)).toEqual([
      "entity",
      "VISIBILITY_LABEL",
      "bool",
      "EFFECT_SETTINGS",
      "DISSOLVE_SETTINGS",
      "FADE_SETTINGS",
    ]);
    expect(block.getInput("FADE_SETTINGS")!.isVisible()).toBe(false);
    block.setFieldValue("fade", "EFFECT");
    block.setFieldValue(0.8, "DURATION");
    const saved = Blockly.serialization.workspaces.save(workspace);
    workspace.clear();
    Blockly.serialization.workspaces.load(saved, workspace);
    const loaded = workspace.getTopBlocks(false)[0];
    const typed = loaded as unknown as BlocklyBlock;
    expect(visual.getJavascript!({})(typed, generator)).toBe(
      "point.setVisual(node, true, 0.8);\n",
    );
    expect(visual.getLua!({})(typed, generator)).toBe(
      "_G.point.set_visual(node, true, 0.8)\n",
    );
    workspace.dispose();
  });
  it.each([
    ["0", "4"], ["4", "0"],
    ["1", "3"], ["3", "1"],
    ["2", "5"], ["5", "2"],
  ])("generates adjustable dissolve with mask %s for showing and %s for hiding", (direction, reverse) => {
    const workspace = setup();
    const block = workspace.newBlock("visual_execute");
    expect(block.getField("EFFECT")!.getText()).toBe("无");
    expect(block.getInput("DISSOLVE_SETTINGS")!.isVisible()).toBe(false);
    block.setFieldValue("dissolve", "EFFECT");
    block.setFieldValue(direction, "DISSOLVE_DIRECTION");
    expect(block.getFieldValue("DISSOLVE_DURATION")).toBe(1.5);
    block.setFieldValue(2.4, "DISSOLVE_DURATION");
    expect(block.getInput("DISSOLVE_SETTINGS")!.fieldRow.filter((field) => field.name)
      .map((field) => field.name)).toEqual(["DISSOLVE_DIRECTION", "DISSOLVE_DURATION"]);
    const typed = block as unknown as BlocklyBlock;
    expect(visual.getJavascript!({})(typed, generator)).toBe(
      `point.setVisual(node, true, 2.4, "dissolve", ${direction}, ${reverse});\n`,
    );
    expect(visual.getLua!({})(typed, generator)).toBe(
      `_G.point.set_visual(node, true, 2.4, "dissolve", ${direction}, ${reverse})\n`,
    );
    const saved = Blockly.serialization.workspaces.save(workspace);
    workspace.clear();
    Blockly.serialization.workspaces.load(saved, workspace);
    expect(workspace.getTopBlocks(false)[0].getFieldValue("DISSOLVE_DURATION")).toBe(2.4);
    workspace.dispose();
  });
  it("uses the authored hide direction when loading an existing hide block", () => {
    const workspace = setup();
    Blockly.serialization.workspaces.load(upgradeTweenData({
      blocks: { blocks: [{
        type: "visual_execute",
        fields: { EFFECT: "dissolve", SHOW_DIRECTION: "0", HIDE_DIRECTION: "2", DURATION: 2.4 },
        inputs: { bool: { shadow: { type: "logic_boolean", fields: { BOOL: "FALSE" } } } },
      }] },
    }), workspace);
    expect(workspace.getTopBlocks(false)[0].getFieldValue("DISSOLVE_DIRECTION")).toBe("5");
    expect(workspace.getTopBlocks(false)[0].getFieldValue("DISSOLVE_DURATION")).toBe(2.4);
    workspace.dispose();
  });
});
