import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import { parse as parseJavaScript } from "acorn";
import luaparse from "luaparse";
import "@/localization";
import { RegisterData } from "@/blocks/helper";
import VoiceTrigger from "@/blocks/command/voice_trigger";

const uuid = "5d9472de-79a9-4e61-bf9e-27867cf4bd50";
const voiceAction = { name: "scaleUp", uuid, type: "Voice" };
const previousDefinition = Blockly.Blocks[VoiceTrigger.title];
const previousJavaScript = javascriptGenerator.forBlock[VoiceTrigger.title];
const previousLua = luaGenerator.forBlock[VoiceTrigger.title];

describe("voice trigger resource labels and event keys", () => {
  let workspace: Blockly.Workspace;
  let previousLanguage: string;

  beforeEach(() => {
    previousLanguage = window.lg;
    window.lg = "en-US";
    workspace = new Blockly.Workspace();
  });

  afterEach(() => {
    workspace.dispose();
    window.lg = previousLanguage;
    if (previousDefinition) {
      Blockly.Blocks[VoiceTrigger.title] = previousDefinition;
    } else {
      delete Blockly.Blocks[VoiceTrigger.title];
    }
    if (previousJavaScript) {
      javascriptGenerator.forBlock[VoiceTrigger.title] = previousJavaScript;
    } else {
      delete javascriptGenerator.forBlock[VoiceTrigger.title];
    }
    if (previousLua) {
      luaGenerator.forBlock[VoiceTrigger.title] = previousLua;
    } else {
      delete luaGenerator.forBlock[VoiceTrigger.title];
    }
  });

  function createVoiceBlock(actions: unknown[]): Blockly.Block {
    RegisterData(VoiceTrigger, { resource: { action: actions } });
    return workspace.newBlock(VoiceTrigger.title);
  }

  function voiceField(block: Blockly.Block): Blockly.FieldDropdown {
    const field = block.getField("Voice");
    expect(field).toBeInstanceOf(Blockly.FieldDropdown);
    return field as Blockly.FieldDropdown;
  }

  function generateCode(): { js: string; lua: string } {
    return {
      js: javascriptGenerator.workspaceToCode(workspace),
      lua: luaGenerator.workspaceToCode(workspace),
    };
  }

  it.each(["scaleUp", null])(
    "shows the trimmed phrase and generates UUID events with name %s",
    (name) => {
      const block = createVoiceBlock([
        { ...voiceAction, name, phrase: "  打开灯光  " },
        {
          name: "ok",
          phrase: "忽略的手势",
          uuid: "gesture-1",
          type: "Gesture",
        },
      ]);
      const field = voiceField(block);

      expect(field.getOptions(false)).toEqual([
        ["none", ""],
        ["打开灯光", uuid],
      ]);
      field.setValue(uuid);
      expect(field.getText()).toBe("打开灯光");
      expect(block.getFieldValue("Voice")).toBe(uuid);

      const code = generateCode();
      for (const output of [code.js, code.lua]) {
        expect(output).toContain(`meta["@${uuid}"]`);
        expect(output).not.toContain("打开灯光");
        expect(output).not.toContain("@scaleUp");
      }
      expect(() =>
        parseJavaScript(code.js, {
          ecmaVersion: "latest",
          sourceType: "script",
        }),
      ).not.toThrow();
      expect(() =>
        luaparse.parse(code.lua, { comments: false, luaVersion: "5.3" }),
      ).not.toThrow();
    },
  );

  it("preserves the selected UUID and both generated scripts when only the phrase changes", () => {
    const block = createVoiceBlock([{ ...voiceAction, phrase: "打开灯光" }]);
    const blockId = block.id;
    voiceField(block).setValue(uuid);
    const before = generateCode();
    const saved = Blockly.serialization.workspaces.save(workspace);

    workspace.clear();
    RegisterData(VoiceTrigger, {
      resource: { action: [{ ...voiceAction, phrase: "开启照明" }] },
    });
    Blockly.serialization.workspaces.load(saved, workspace);

    const restored = workspace.getBlockById(blockId);
    expect(restored).not.toBeNull();
    expect(voiceField(restored!).getText()).toBe("开启照明");
    expect(restored!.getFieldValue("Voice")).toBe(uuid);
    expect(generateCode()).toEqual(before);
  });

  it.each([
    { language: "zh-CN", name: "scaleUp", label: "放大" },
    { language: "en-US", name: "scaleUp", label: "Scale Up" },
    { language: "en-US", name: "nextStep", label: "下一步" },
    { language: "en-US", name: "custom-command", label: "custom-command" },
    { language: "en-US", name: "", label: uuid },
    { language: "en-US", name: null, label: uuid },
  ])(
    "keeps the name label $label in $language without a phrase",
    ({ language, name, label }) => {
      window.lg = language;
      const field = voiceField(createVoiceBlock([{ ...voiceAction, name }]));

      expect(field.getOptions(false)).toEqual([
        ["none", ""],
        [label, uuid],
      ]);
      field.setValue(uuid);
      expect(field.getText()).toBe(label);
      expect(field.getValue()).toBe(uuid);
    },
  );

  it.each([
    { description: "undefined", phrase: undefined },
    { description: "empty", phrase: "" },
    { description: "whitespace", phrase: " \t\n " },
    { description: "null", phrase: null },
    { description: "numeric", phrase: 42 },
    { description: "boolean", phrase: true },
    { description: "object", phrase: { text: "打开灯光" } },
    { description: "array", phrase: ["打开灯光"] },
  ])(
    "keeps an invalid $description custom phrase from falling back to the old action",
    ({ phrase }) => {
      const field = voiceField(createVoiceBlock([{ ...voiceAction, phrase }]));

      expect(field.getOptions(false)).toEqual([
        ["none", ""],
        [uuid, uuid],
      ]);
      field.setValue(uuid);
      expect(field.getText()).toBe(uuid);
      expect(field.getValue()).toBe(uuid);
    },
  );

  it("accepts canonical action names with pinyin without legacy localization", () => {
    const block = createVoiceBlock([
      { ...voiceAction, name: "打开灯光", pinyin: "da kai deng guang" },
    ]);
    const field = voiceField(block);
    field.setValue(uuid);
    expect(field.getText()).toBe("打开灯光");
    for (const code of Object.values(generateCode())) {
      expect(code).toContain(`meta["@${uuid}"]`);
      expect(code).not.toContain("打开灯光");
    }
  });

  it.each([undefined, null, "", 42])(
    "does not localize an action key when custom pinyin is present as %s",
    (pinyin) => {
      const field = voiceField(createVoiceBlock([{ ...voiceAction, pinyin }]));
      expect(field.getOptions(false)).toEqual([
        ["none", ""],
        ["scaleUp", uuid],
      ]);
    },
  );

  it("keeps the UUID and generated scripts while reopened resources move between all three formats", () => {
    const block = createVoiceBlock([voiceAction]);
    voiceField(block).setValue(uuid);
    const saved = Blockly.serialization.workspaces.save(workspace);
    const before = generateCode();
    for (const entry of [
      { ...voiceAction, phrase: "打开灯光", pinyin: "da kai deng guang" },
      { ...voiceAction, name: "打开灯光", pinyin: "da kai deng guang" },
    ]) {
      workspace.clear();
      RegisterData(VoiceTrigger, { resource: { action: [entry] } });
      Blockly.serialization.workspaces.load(saved, workspace);
      const restored = workspace.getBlockById(block.id)!;
      expect(voiceField(restored).getText()).toBe("打开灯光");
      expect(restored.getFieldValue("Voice")).toBe(uuid);
      expect(generateCode()).toEqual(before);
    }
  });
});
