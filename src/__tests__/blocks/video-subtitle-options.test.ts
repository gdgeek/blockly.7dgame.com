import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as Blockly from "blockly";
import "@/localization";
import { RegisterData } from "@/blocks/helper";
import type { BlocklyBlock, BlocklyGenerator } from "@/blocks/helper";
import PlayVideo from "@/blocks/video/play_video2";
import PlayVideoTask from "@/blocks/task/play_video_task";
import VideoEntity from "@/blocks/video/video_entity";

describe("video playback subtitle options", () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    const parameters = {
      resource: { video: [
        { uuid: "narration", name: "讲解", hasSubtitles: true },
        { uuid: "effect", name: "音效", hasSubtitles: false },
        { uuid: "legacy", name: "旧音频" },
      ] },
    };
    RegisterData(VideoEntity, parameters);
    RegisterData(PlayVideo, parameters);
    RegisterData(PlayVideoTask, parameters);
    workspace = new Blockly.Workspace();
  });

  afterEach(() => workspace.dispose());

  it.each(["play_video", "play_video_task"])(
    "%s hides subtitle fields for video without subtitles and keeps saved choices",
    (type) => {
      const playback = workspace.newBlock(type);
      const sound = workspace.newBlock("video_entity");
      const input = playback.getInput("SUBTITLE_SETTINGS")!;
      expect(input.isVisible()).toBe(false);
      playback.getInput("video")!.connection!.connect(sound.outputConnection!);
      sound.setFieldValue("narration", "Video");
      const definition = type === "play_video" ? PlayVideo : PlayVideoTask;
      const generator = {
        ORDER_NONE: 99,
        valueToCode: () => "videoHandle",
        statementToCode: () => "",
      } as BlocklyGenerator;
      const code = () => definition.getLua(null)(
        playback as unknown as BlocklyBlock, generator
      );

      playback.setFieldValue("show", "SUBTITLE");
      expect(JSON.stringify(code())).toContain("show");
      expect(input.isVisible()).toBe(true);

      sound.setFieldValue("effect", "Video");
      expect(JSON.stringify(code())).not.toContain("show");
      expect(input.isVisible()).toBe(false);
      expect(playback.getFieldValue("SUBTITLE")).toBe("show");

      const saved = Blockly.serialization.workspaces.save(workspace);
      Blockly.serialization.workspaces.load(saved, workspace);
      const restored = workspace.getAllBlocks(false).find(block => block.type === type)!;
      expect(restored.getFieldValue("SUBTITLE")).toBe("show");
      expect(restored.getInput("SUBTITLE_SETTINGS")!.isVisible()).toBe(false);
      const restoredSound = restored.getInputTargetBlock("video")!;
      restoredSound.setFieldValue("narration", "Video");
      definition.getLua(null)(restored as unknown as BlocklyBlock, generator);
      expect(restored.getInput("SUBTITLE_SETTINGS")!.isVisible()).toBe(true);

      restoredSound.outputConnection!.disconnect();
      definition.getLua(null)(restored as unknown as BlocklyBlock, generator);
      expect(restored.getInput("SUBTITLE_SETTINGS")!.isVisible()).toBe(false);
    }
  );

  it.each(["play_video", "play_video_task"])("%s migrates inherit to show and exposes only show/hide", (type) => {
    Blockly.serialization.workspaces.load({
      blocks: { languageVersion: 0, blocks: [{
        type, fields: { SUBTITLE: "inherit" },
        inputs: { video: { block: { type: "video_entity", fields: { Video: "narration" } } } },
      }] },
    }, workspace);
    const playback = workspace.getTopBlocks(false)[0];
    const dropdown = playback.getField("SUBTITLE") as Blockly.FieldDropdown;
    expect(dropdown.getOptions(false).map(option => option[1])).toEqual(["show", "hide"]);
    expect(playback.getFieldValue("SUBTITLE")).toBe("show");
    const definition = type === "play_video" ? PlayVideo : PlayVideoTask;
    const generator = { ORDER_NONE: 99, valueToCode: () => "mediaHandle", statementToCode: () => "" } as BlocklyGenerator;
    expect(JSON.stringify(definition.getLua(null)(playback as unknown as BlocklyBlock, generator))).toContain("show");
    playback.setFieldValue("hide", "SUBTITLE");
    expect(JSON.stringify(definition.getLua(null)(playback as unknown as BlocklyBlock, generator))).toContain("hide");
    expect(JSON.stringify(definition.getJavascript(null)(playback as unknown as BlocklyBlock, generator))).toContain("hide");
  });

  it("loads legacy blocks without a subtitle field and omits an override", () => {
    Blockly.serialization.workspaces.load({
      blocks: { languageVersion: 0, blocks: [{
        type: "play_video",
        inputs: { video: { block: { type: "video_entity", fields: { Sound: "legacy" } } } },
      }] },
    }, workspace);
    const playback = workspace.getTopBlocks(false)[0];
    const result = PlayVideo.getLua(null)(playback as unknown as BlocklyBlock, {
      ORDER_NONE: 99,
      statementToCode: () => "",
      valueToCode: () => "videoHandle",
    });
    expect(result).toBe("_G.video.play(videoHandle)\n");
    expect(playback.getInput("SUBTITLE_SETTINGS")!.isVisible()).toBe(false);
  });
});
