import { describe, expect, it } from "vitest";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import particle from "../../blocks/entity/play_particle";
import { Setup } from "../../blocks/entity";
import { Access } from "../../utils/Access";
import "../../localization";

describe("particle playback block", () => {
  it("is available in the node toolbox and survives serialization in both languages", () => {
    window.lg = "zh-CN";
    const toolbox = { contents: [] };
    Setup(
      toolbox,
      {
        resource: {
          entity: [{ name: "法器", uuid: "prop" }],
        },
      },
      new Access({ role: "admin" }),
    );
    expect(JSON.stringify(toolbox)).toContain('"type":"play_particle"');
    const workspace = new Blockly.Workspace();
    try {
      const block = workspace.newBlock("play_particle");
      const preset = block.getField("PRESET") as Blockly.FieldDropdown;
      expect(preset.getOptions().map(([, value]) => value)).toEqual([
        "orbit", "gather", "scatter", "rise", "stopOrbit", "flowOn", "flowOff",
      ]);
      expect(preset.getValue()).toBe("orbit");
      block.setFieldValue("gather", "PRESET");
      const node = workspace.newBlock("entity");
      node.setFieldValue("prop", "Entity");
      block.getInput("entity")!.connection!.connect(node.outputConnection!);
      const saved = Blockly.serialization.workspaces.save(workspace);
      workspace.clear();
      Blockly.serialization.workspaces.load(saved, workspace);
      expect(javascriptGenerator.workspaceToCode(workspace)).toContain(
        "point.playParticle(",
      );
      expect(luaGenerator.workspaceToCode(workspace)).toContain(
        "_G.point.play_particle(",
      );
      expect(luaGenerator.workspaceToCode(workspace)).toContain('"prop"');
      expect(luaGenerator.workspaceToCode(workspace)).toContain(', "gather")');
      expect(javascriptGenerator.workspaceToCode(workspace)).toContain(', "gather");');
      expect(workspace.getTopBlocks(false)).toHaveLength(1);
    } finally {
      workspace.dispose();
    }
  });
  it("handles an empty input and explains nonblocking, restartable playback", () => {
    window.lg = "zh-CN";
    Blockly.Blocks.play_particle = particle.getBlock({});
    const workspace = new Blockly.Workspace();
    try {
      const block = workspace.newBlock("play_particle");
      const generator = { ORDER_NONE: 0, valueToCode: () => "" };
      expect(particle.getLua({})(block as never, generator as never)).toBe(
        '_G.point.play_particle(nil, "orbit")\n',
      );
      expect(
        particle.getJavascript({})(block as never, generator as never),
      ).toBe('point.playParticle(undefined, "orbit");\n');
      expect(block.getTooltip()).toContain("不等待");
      block.setFieldValue("flowOn", "PRESET");
      expect(particle.getLua({})(block as never, generator as never)).toBe(
        "_G.point.set_flow_glow(nil, true)\n",
      );
      block.setFieldValue("flowOff", "PRESET");
      expect(particle.getJavascript({})(block as never, generator as never)).toBe(
        "point.setFlowGlow(undefined, false);\n",
      );
    } finally {
      workspace.dispose();
    }
  });
});
