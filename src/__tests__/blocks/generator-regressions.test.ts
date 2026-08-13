import { describe, expect, it, vi } from "vitest";
import { parse as parseJavaScript } from "acorn";
import luaparse from "luaparse";
import type { BlocklyBlock, BlocklyGenerator } from "@/blocks/helper";
import { quoteJavaScriptString, quoteLuaString } from "@/blocks/helper";
import ModuleToTransformData from "@/blocks/data/module_to_transform_data";
import EntityExplode from "@/blocks/entity/entity_explode";
import EntityUnexploded from "@/blocks/entity/entity_unexploded";
import LineExecute from "@/blocks/entity/line_execute";
import EntityText from "@/blocks/entity/text_entity";
import TweenExecute from "@/blocks/entity/tween_execute";
import VisualTooltips from "@/blocks/entity/visual_tooltips";
import Entity from "@/blocks/entity/entity";
import Parameters from "@/blocks/parameter/parameters";
import OutputSignal from "@/blocks/signal/output_signal";
import OutputSignalWithParameter from "@/blocks/signal/output_signal_with_parameter";
import OutputSignalItem from "@/blocks/signal/outputs_item";
import GameAddScore from "@/blocks/manager/game_add_score";
import GameCountdown from "@/blocks/manager/game_countdown";
import GameReset from "@/blocks/manager/game_reset";
import PictureEntity from "@/blocks/picture/picture_entity";
import AutoPlaySound from "@/blocks/sound/autoplay_sound";
import PauseSound from "@/blocks/sound/pause_sound";
import PlaySoundCallback from "@/blocks/sound/play_sound_callback";
import StopSound from "@/blocks/sound/stop_sound";
import PlayAnimationTask from "@/blocks/task/play_animation_task";
import PlaySoundTask from "@/blocks/task/play_sound_task";
import PlayVideoTask from "@/blocks/task/play_video_task";
import PlayVideo from "@/blocks/video/play_video";
import PlayVideoCallback from "@/blocks/video/play_video_callback";

function createBlock(
  fields: Record<string, string> = {},
  extras: Record<string, unknown> = {}
): BlocklyBlock {
  return {
    getFieldValue: vi.fn((name: string) => fields[name] ?? ""),
    ...extras,
  };
}

function createGenerator(
  values: Record<string, string> = {}
): BlocklyGenerator {
  return {
    ORDER_ATOMIC: 0,
    ORDER_HIGH: 1,
    ORDER_FUNCTION_CALL: 1,
    ORDER_NONE: 99,
    statementToCode: vi.fn().mockReturnValue(""),
    valueToCode: vi.fn((_block: object, name: string) => values[name] ?? ""),
  };
}

function expectString(result: unknown): string {
  expect(typeof result).toBe("string");
  return result as string;
}

function expectTuple(result: unknown): [string, unknown] {
  expect(Array.isArray(result)).toBe(true);
  expect(result).toHaveLength(2);
  return result as [string, unknown];
}

function expectValidJavaScript(code: string): void {
  expect(() =>
    parseJavaScript(code, {
      ecmaVersion: "latest",
      sourceType: "script",
    })
  ).not.toThrow();
}

function expectValidAsyncJavaScript(code: string): void {
  expectValidJavaScript(`async function generatedScript() {\n${code}\n}`);
}

function expectValidLua(code: string): void {
  expect(() =>
    luaparse.parse(code, {
      comments: false,
      luaVersion: "5.3",
    })
  ).not.toThrow();
}

describe("custom block generator regressions", () => {
  it("uses JavaScript runtime calls for historical entity generators", () => {
    const textUuid = "text-'\"\\\n-id";
    const generator = createGenerator({
      entity: 'handleEntity("entity-id")',
      from: 'handleEntity("from-id")',
      to: 'handleEntity("to-id")',
      transform: "transformData",
    });

    const explode = expectString(
      EntityExplode.getJavascript({})(
        createBlock({ distance: "0.25" }),
        generator
      )
    );
    const unexplode = expectString(
      EntityUnexploded.getJavascript({})(createBlock(), generator)
    );
    const line = expectString(
      LineExecute.getJavascript({})(createBlock(), generator)
    );
    const [text] = expectTuple(
      EntityText.getJavascript({})(createBlock({ Text: textUuid }), generator)
    );
    const [entityTransform] = expectTuple(
      ModuleToTransformData.getJavascript({})(createBlock(), generator)
    );
    const tween = expectString(
      TweenExecute.getJavascript({})(
        createBlock({ time: "0.3", sync: "TRUE", occupy: "TRUE" }),
        generator
      )
    );
    const backgroundTween = expectString(
      TweenExecute.getJavascript({})(
        createBlock({ time: "1", sync: "FALSE", occupy: "FALSE" }),
        generator
      )
    );
    const statements = [explode, unexplode, line, tween, backgroundTween].join(
      ""
    );

    expect(explode).toBe('point.explode(handleEntity("entity-id"), 0.25);\n');
    expect(unexplode).toBe('point.unexplode(handleEntity("entity-id"));\n');
    expect(line).toBe(
      'point.line(handleEntity("from-id"), handleEntity("to-id"));\n'
    );
    expect(text).toBe(`handleText(${quoteJavaScriptString(textUuid)})`);
    expect(entityTransform).toBe(
      'point.toTransformData(handleEntity("entity-id"))'
    );
    expect(tween).toBe(
      'await point.tween(handleEntity("entity-id"), transformData, 0.3, true);\n'
    );
    expect(backgroundTween).toBe(
      'void point.tween(handleEntity("entity-id"), transformData, 1, false);\n'
    );
    const expressions = `const textEntity = ${text};\nconst entityTransform = ${entityTransform};`;
    expect(`${statements}\n${expressions}`).not.toMatch(/CS\.MLua|_G\./);
    expectValidAsyncJavaScript(`${statements}\n${expressions}`);
  });

  it("keeps repeated sound callback blocks parseable without duplicate declarations", () => {
    const generator = createGenerator({ sound: 'handleSound("sound-id")' });
    const block = createBlock();

    const first = expectString(
      PlaySoundCallback.getJavascript({})(block, generator)
    );
    const second = expectString(
      PlaySoundCallback.getJavascript({})(block, generator)
    );
    const combined = first + second;

    expect(combined).toBe(
      'await sound.play(handleSound("sound-id"));\n' +
        'await sound.play(handleSound("sound-id"));\n'
    );
    expect(combined).not.toContain("const audio");
    expect(combined).not.toContain("new Audio");
    expectValidAsyncJavaScript(combined);
  });

  it("uses the shared sound runtime for autoplay and stop", () => {
    const generator = createGenerator({ sound: 'handleSound("sound-id")' });
    const block = createBlock(
      {},
      {
        getSurroundParent: vi.fn().mockReturnValue(null),
      }
    );

    const autoplay = expectString(
      AutoPlaySound.getJavascript({})(block, generator)
    );
    const pause = expectString(PauseSound.getJavascript({})(block, generator));
    const stop = expectString(StopSound.getJavascript({})(block, generator));

    expect(autoplay).toBe('await sound.auto_play(handleSound("sound-id"));\n');
    expect(pause).toBe('await sound.pause(handleSound("sound-id"));\n');
    expect(stop).toBe('await sound.stop(handleSound("sound-id"));\n');
    expect(pause).not.toMatch(/handleSound\([^\n]+\)\.pause/);
    expect(stop).not.toMatch(/handleSound\([^\n]+\)\.stop/);
    expectValidAsyncJavaScript(autoplay + pause + stop);
  });

  it("keeps picture handles escaped and manager calls parseable", () => {
    const pictureUuid = "picture-'\"\\\n-id";
    const generator = createGenerator();
    const [picture] = expectTuple(
      PictureEntity.getJavascript({})(
        createBlock({ Picture: pictureUuid }),
        generator
      )
    );
    const addScore = expectString(
      GameAddScore.getJavascript({})(createBlock({ Score: "5" }), generator)
    );
    const countdown = expectString(
      GameCountdown.getJavascript({})(
        createBlock({ Seconds: "120" }),
        generator
      )
    );
    const reset = expectString(
      GameReset.getJavascript({})(createBlock(), generator)
    );
    const statements = addScore + countdown + reset;

    expect(picture).toBe(
      `handlePicture(${quoteJavaScriptString(pictureUuid)})`
    );
    expect(addScore).toBe("managers.game_add_score(5, parameter);\n");
    expect(countdown).toBe("managers.game_countdown(120, parameter);\n");
    expect(reset).toBe("managers.game_reset(parameter);\n");
    expect(`${picture}\n${statements}`).not.toMatch(/CS\.MLua|_G\./);
    expectValidJavaScript(`const picture = ${picture};`);
    expectValidAsyncJavaScript(statements);
  });

  it("keeps media task values lazy until the task runtime executes them", () => {
    const generator = createGenerator({
      sound: 'handleSound("sound-id")',
      video: 'handleVideo("video-id")',
      polygen: 'handlePolygen("model-id")',
    });
    const block = createBlock({ animation: "idle" });

    const [soundTask] = expectTuple(
      PlaySoundTask.getJavascript({})(block, generator)
    );
    const [videoTask] = expectTuple(
      PlayVideoTask.getJavascript({})(block, generator)
    );
    const [animationTask] = expectTuple(
      PlayAnimationTask.getJavascript({})(block, generator)
    );

    expect(soundTask).toBe('sound.createTask(handleSound("sound-id"))');
    expect(videoTask).toBe('video.createTask(handleVideo("video-id"))');
    expect(animationTask).toBe(
      'animation.createTask(handlePolygen("model-id"), "idle")'
    );
    expect(`${soundTask}${videoTask}${animationTask}`).not.toContain(
      ".playTask("
    );
    expectValidJavaScript(
      `const tasks = [${soundTask}, ${videoTask}, ${animationTask}];`
    );
    expectValidAsyncJavaScript(
      `await task.execute(${soundTask});\nawait task.circle(2, [${videoTask}, ${animationTask}]);`
    );
  });

  it("generates video runtime calls with sequential callbacks", () => {
    const generator = createGenerator({ video: "currentVideo" });
    vi.mocked(generator.statementToCode).mockReturnValue(
      "  afterVideoFinished();\n"
    );

    const foreground = expectString(
      PlayVideo.getJavascript({})(
        createBlock({ sync: "TRUE", occupy: "TRUE" }),
        generator
      )
    );
    const background = expectString(
      PlayVideo.getJavascript({})(
        createBlock({ sync: "FALSE", occupy: "FALSE" }),
        generator
      )
    );
    const callback = expectString(
      PlayVideoCallback.getJavascript({})(
        createBlock({ occupy: "TRUE" }),
        generator
      )
    );
    const combined = foreground + background + callback;

    expect(foreground).toBe("await video.play(currentVideo, true);\n");
    expect(background).toBe("void video.play(currentVideo, false);\n");
    expect(callback).toBe(
      "await video.play(currentVideo, true);\n  afterVideoFinished();\n"
    );
    expect(combined).not.toMatch(/handleVideo\(["'`]currentVideo,/);
    expectValidAsyncJavaScript(combined);
  });

  it("generates a JavaScript array for all tooltip entities and escapes IDs", () => {
    const firstUuid = "deep-'\"\\\n\u0001-child";
    const secondUuid = "second-child";
    const block = createBlock(
      {},
      {
        tooltipsEntities: [firstUuid, secondUuid],
      }
    );
    const generator = createGenerator({ bool: "true" });

    const javascript = expectString(
      VisualTooltips.getJavascript({})(block, generator)
    );
    const lua = expectString(VisualTooltips.getLua({})(block, generator));

    expect(javascript).toMatch(/setTooltipsVisual\(\[\s*handleEntity/);
    expect(javascript).not.toMatch(/setTooltipsVisual\(\{/);
    expect(javascript).toContain(
      `handleEntity(${quoteJavaScriptString(firstUuid)})`
    );
    expect(lua).toContain(
      `_G.helper.handler(index, ${quoteLuaString(firstUuid)})`
    );
    expectValidJavaScript(javascript);
    expectValidLua(lua);
  });

  it("returns newline-free parameter value tuples with empty-list defaults", () => {
    const block = createBlock();
    const generator = createGenerator();

    const [javascript, javascriptOrder] = expectTuple(
      Parameters.getJavascript({})(block, generator)
    );
    const [lua, luaOrder] = expectTuple(
      Parameters.getLua({})(block, generator)
    );

    expect(javascript).toBe("helper.parameters([])");
    expect(lua).toBe("_G.helper.parameters({})");
    expect(javascript).not.toContain("\n");
    expect(lua).not.toContain("\n");
    expect(javascriptOrder).toBeDefined();
    expect(luaOrder).toBeDefined();
    expectValidJavaScript(`const value = ${javascript};`);
    expectValidLua(`local value = ${lua}`);
  });

  it("uses parseable defaults for a disconnected signal parameter", () => {
    const reference = {
      index: "index-'\"\\\n\u0002",
      uuid: "uuid-'\"\\\n\u0003",
    };
    const block = createBlock({ Output: JSON.stringify(reference) });
    const generator = createGenerator({ Parameter: "" });

    const javascript = expectString(
      OutputSignalWithParameter.getJavascript({})(block, generator)
    );
    const lua = expectString(
      OutputSignalWithParameter.getLua({})(block, generator)
    );

    expect(javascript).toContain(quoteJavaScriptString(reference.index));
    expect(javascript).toContain(quoteJavaScriptString(reference.uuid));
    expect(javascript).toContain(", undefined);");
    expect(lua).toContain(quoteLuaString(reference.index));
    expect(lua).toContain(quoteLuaString(reference.uuid));
    expect(lua).toContain(", nil)");
    expectValidJavaScript(javascript);
    expectValidLua(lua);
  });

  it.each(["{legacy-json", "null", '{"index": 1, "uuid": false}'])(
    "falls back to an empty signal reference for malformed data %s",
    (rawReference) => {
      const block = createBlock({ Output: rawReference });
      const generator = createGenerator();

      const javascript = expectString(
        OutputSignal.getJavascript({})(block, generator)
      );
      const lua = expectString(OutputSignal.getLua({})(block, generator));
      const [javascriptItem] = expectTuple(
        OutputSignalItem.getJavascript({})(block, generator)
      );
      const [luaItem] = expectTuple(
        OutputSignalItem.getLua({})(block, generator)
      );

      expect(javascript).toBe('event.signal("", "");\n');
      expect(lua).toBe('_G.event.signal("", "")\n');
      expect(javascriptItem).toBe('{"index":"","uuid":""}');
      expect(luaItem).toBe('{"", ""}');
      expectValidJavaScript(javascript);
      expectValidLua(lua);
      expectValidJavaScript(`const signal = ${javascriptItem};`);
      expectValidLua(`local signal = ${luaItem}`);
    }
  );

  it("keeps resource identifiers parseable in standalone value blocks", () => {
    const uuid = "entity-'\"\\\n\u0004";
    const block = createBlock({ Entity: uuid });
    const generator = createGenerator();

    const [javascript] = expectTuple(
      Entity.getJavascript({})(block, generator)
    );
    const [lua] = expectTuple(Entity.getLua({})(block, generator));

    expect(javascript).toContain(quoteJavaScriptString(uuid));
    expect(lua).toContain(quoteLuaString(uuid));
    expectValidJavaScript(`const entity = ${javascript};`);
    expectValidLua(`local entity = ${lua}`);
  });
});
