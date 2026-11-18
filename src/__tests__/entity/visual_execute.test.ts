import { describe, it, expect } from "vitest";
import * as Blockly from "blockly";
import visual from "../../blocks/entity/visual_execute";
import type { BlocklyBlock, BlocklyGenerator } from "../../blocks/helper";
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
  it("generates independent show/hide dissolve directions and keeps None as the legacy default", () => {
    const workspace = setup();
    const block = workspace.newBlock("visual_execute");
    expect(block.getField("EFFECT")!.getText()).toBe("无");
    expect(block.getInput("DISSOLVE_SETTINGS")!.isVisible()).toBe(false);
    block.setFieldValue("dissolve", "EFFECT");
    block.setFieldValue("2", "SHOW_DIRECTION");
    block.setFieldValue("1", "HIDE_DIRECTION");
    expect(
      visual.getLua!({})(block as unknown as BlocklyBlock, generator),
    ).toBe('_G.point.set_visual(node, true, 0.5, "dissolve", 2, 1)\n');
    workspace.dispose();
  });
});
