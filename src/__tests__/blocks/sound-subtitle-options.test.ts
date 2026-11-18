import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as Blockly from "blockly";
import "@/localization";
import { RegisterData } from "@/blocks/helper";
import type { BlocklyBlock, BlocklyGenerator } from "@/blocks/helper";
import PlaySound from "@/blocks/sound/play_sound";
import PlaySoundTask from "@/blocks/task/play_sound_task";
import SoundEntity from "@/blocks/sound/sound_entity";

describe("sound playback subtitle options", () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    const parameters = {
      resource: { sound: [
        { uuid: "narration", name: "讲解", hasSubtitles: true },
        { uuid: "effect", name: "音效", hasSubtitles: false },
        { uuid: "legacy", name: "旧音频" },
      ] },
    };
    RegisterData(SoundEntity, parameters);
    RegisterData(PlaySound, parameters);
    RegisterData(PlaySoundTask, parameters);
    workspace = new Blockly.Workspace();
  });

  afterEach(() => workspace.dispose());

  it.each(["play_sound", "play_sound_task"])(
    "%s hides subtitle fields for audio without subtitles and keeps saved choices",
    (type) => {
      const playback = workspace.newBlock(type);
      const sound = workspace.newBlock("sound_entity");
      const input = playback.getInput("SUBTITLE_SETTINGS")!;
      expect(input.isVisible()).toBe(false);
      playback.getInput("sound")!.connection!.connect(sound.outputConnection!);
      sound.setFieldValue("narration", "Sound");
      const definition = type === "play_sound" ? PlaySound : PlaySoundTask;
      const generator = {
        ORDER_NONE: 99,
        valueToCode: () => "soundHandle",
        statementToCode: () => "",
      } as BlocklyGenerator;
      const code = () => definition.getLua(null)(
        playback as unknown as BlocklyBlock, generator
      );

      playback.setFieldValue("show", "SUBTITLE");
      expect(JSON.stringify(code())).toContain("show");
      expect(input.isVisible()).toBe(true);

      sound.setFieldValue("effect", "Sound");
      expect(JSON.stringify(code())).not.toContain("show");
      expect(input.isVisible()).toBe(false);
      expect(playback.getFieldValue("SUBTITLE")).toBe("show");

      const saved = Blockly.serialization.workspaces.save(workspace);
      Blockly.serialization.workspaces.load(saved, workspace);
      const restored = workspace.getAllBlocks(false).find(block => block.type === type)!;
      expect(restored.getFieldValue("SUBTITLE")).toBe("show");
      expect(restored.getInput("SUBTITLE_SETTINGS")!.isVisible()).toBe(false);
      const restoredSound = restored.getInputTargetBlock("sound")!;
      restoredSound.setFieldValue("narration", "Sound");
      definition.getLua(null)(restored as unknown as BlocklyBlock, generator);
      expect(restored.getInput("SUBTITLE_SETTINGS")!.isVisible()).toBe(true);

      restoredSound.outputConnection!.disconnect();
      definition.getLua(null)(restored as unknown as BlocklyBlock, generator);
      expect(restored.getInput("SUBTITLE_SETTINGS")!.isVisible()).toBe(false);
    }
  );

  it.each(["play_sound", "play_sound_task"])("%s migrates inherit to show and exposes only show/hide", (type) => {
    Blockly.serialization.workspaces.load({
      blocks: { languageVersion: 0, blocks: [{
        type, fields: { SUBTITLE: "inherit" },
        inputs: { sound: { block: { type: "sound_entity", fields: { Sound: "narration" } } } },
      }] },
    }, workspace);
    const playback = workspace.getTopBlocks(false)[0];
    const dropdown = playback.getField("SUBTITLE") as Blockly.FieldDropdown;
    expect(dropdown.getOptions(false).map(option => option[1])).toEqual(["show", "hide"]);
    expect(playback.getFieldValue("SUBTITLE")).toBe("show");
    const definition = type === "play_sound" ? PlaySound : PlaySoundTask;
    const generator = { ORDER_NONE: 99, valueToCode: () => "mediaHandle", statementToCode: () => "" } as BlocklyGenerator;
    expect(JSON.stringify(definition.getLua(null)(playback as unknown as BlocklyBlock, generator))).toContain("show");
    playback.setFieldValue("hide", "SUBTITLE");
    expect(JSON.stringify(definition.getLua(null)(playback as unknown as BlocklyBlock, generator))).toContain("hide");
    expect(JSON.stringify(definition.getJavascript(null)(playback as unknown as BlocklyBlock, generator))).toContain("hide");
  });

  it("loads legacy blocks without a subtitle field and omits an override", () => {
    Blockly.serialization.workspaces.load({
      blocks: { languageVersion: 0, blocks: [{
        type: "play_sound",
        inputs: { sound: { block: { type: "sound_entity", fields: { Sound: "legacy" } } } },
      }] },
    }, workspace);
    const playback = workspace.getTopBlocks(false)[0];
    const result = PlaySound.getLua(null)(playback as unknown as BlocklyBlock, {
      ORDER_NONE: 99,
      statementToCode: () => "",
      valueToCode: () => "soundHandle",
    });
    expect(result).toBe("_G.sound.play(soundHandle)\n");
    expect(playback.getInput("SUBTITLE_SETTINGS")!.isVisible()).toBe(false);
  });
});
