import * as Blockly from "blockly";
import { describe, expect, it } from "vitest";
import "@/localization";
import { Setup } from "@/blocks/sound";
import SoundEnded from "@/blocks/sound/sound_ended";
import type { BlocklyBlock, BlocklyGenerator, Toolbox } from "@/blocks/helper";

describe("sound completion event", () => {
  it.each([true, false])("respects tourism authoring access (%s)", tourismAuthoring => {
    const toolbox: Toolbox = { contents: [] };
    Setup(toolbox, { tourismAuthoring });
    expect(JSON.stringify(toolbox).includes('"sound_ended"')).toBe(tourismAuthoring);
  });

  it("restores the selected sound and routes both generators to its completion event", () => {
    Setup({ contents: [] }, { tourismAuthoring: true, resource: { sound: [
      { uuid: "intro", name: "开场" }, { uuid: "outro", name: "结束语" },
    ] } });
    const workspace = new Blockly.Workspace();
    try {
      const event = workspace.newBlock("sound_ended");
      event.setFieldValue("outro", "Sound");
      const saved = Blockly.serialization.workspaces.save(workspace);
      workspace.clear();
      Blockly.serialization.workspaces.load(saved, workspace);
      const restored = workspace.getTopBlocks(false)[0] as unknown as BlocklyBlock;
      const generator: BlocklyGenerator = { valueToCode: () => "", statementToCode: () => "  nextAction()\n" };
      for (const make of [SoundEnded.getJavascript, SoundEnded.getLua]) {
        const code = make(null)(restored, generator);
        expect(code).toContain('meta["@sound-ended:outro"]');
        expect(code).toContain("nextAction()");
      }
    } finally {
      workspace.dispose();
    }
  });
});
