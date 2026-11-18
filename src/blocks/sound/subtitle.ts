import DataType from "./type";
import * as Blockly from "blockly";
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator, Toolbox } from "../helper";

function label(zh: string, tw: string, en: string): string {
  return window.lg === "zh-CN" ? zh : window.lg === "zh-TW" ? tw : en;
}

function subtitleOptions(): {
  type: string;
  name: string;
  options: Array<[string, string]>;
} {
  return {
    type: "field_dropdown",
    name: "SUBTITLE",
    options: [
      [label("显示", "顯示", "Show"), "show"],
      [label("隐藏", "隱藏", "Hide"), "hide"],
    ],
  };
}

export function subtitleOverride(block: BlocklyBlock): string {
  if (typeof block.updateSubtitleOptions === "function") {
    block.updateSubtitleOptions();
  }
  if (block.hasSubtitleOptions === false) return "";
  const value = block.getFieldValue?.("SUBTITLE");
  return value === "hide" ? "hide" : "show";
}

class SubtitleVisibilityField extends Blockly.FieldDropdown {
  override setValue(newValue: unknown, fireChangeEvent?: boolean): void {
    super.setValue(newValue === "inherit" ? "show" : newValue, fireChangeEvent);
  }
}

interface SubtitlePlaybackBlock extends Blockly.Block {
  hasSubtitleOptions?: boolean;
  updateSubtitleOptions?: () => void;
}

interface SubtitlePlaybackParameters {
  tourismAuthoring?: boolean;
  resource?: {
    sound?: Array<{ uuid: string; hasSubtitles?: boolean }>;
    video?: Array<{ uuid: string; hasSubtitles?: boolean }>;
  };
}

export function setupPlaybackSubtitles(
  block: SubtitlePlaybackBlock,
  parameters: unknown,
  media: "sound" | "video" = "sound"
): void {
  const { resource, tourismAuthoring } = (parameters ?? {}) as SubtitlePlaybackParameters;
  const options = subtitleOptions();
  const input = block.appendDummyInput("SUBTITLE_SETTINGS")
    .appendField(label("· 字幕", "· 字幕", "· Subtitles"))
    .appendField(new SubtitleVisibilityField(options.options), options.name);
  block.setInputsInline(true);

  block.updateSubtitleOptions = () => {
    const node = block.getInputTargetBlock(media);
    const uuid = node?.type === `${media}_entity` ? node.getFieldValue(media === "sound" ? "Sound" : "Video") : "";
    block.hasSubtitleOptions = resource?.[media]?.some(
      (item) => item.uuid === uuid && item.hasSubtitles === true
    ) ?? false;

    const visible = tourismAuthoring !== false && block.hasSubtitleOptions && !block.isCollapsed();
    if (input.isVisible() !== visible) {
      input.setVisible(visible);
      if ("rendered" in block && block.rendered) {
        void (block as Blockly.BlockSvg).queueRender();
      }
    }
  };

  block.setOnChange(() => block.updateSubtitleOptions?.());
  block.updateSubtitleOptions();
}

type Argument = Record<string, unknown>;

function makeBlock(
  title: string,
  message: () => string,
  args: () => Argument[],
  call: (block: BlocklyBlock, generator: BlocklyGenerator, lua: boolean) => string,
  inputs?: object
): BlockDefinition {
  const getBlockJson = () => ({
    message0: message(),
    args0: args(),
    previousStatement: null,
    nextStatement: null,
    colour: DataType.colour,
  });
  return {
    title,
    getBlockJson,
    getBlock: () => ({
      init(this: { jsonInit: (json: object) => void }) {
        this.jsonInit(getBlockJson());
      },
    }),
    getJavascript: () => (block, generator) => `sound.${call(block, generator, false)};\n`,
    getLua: () => (block, generator) => `_G.sound.${call(block, generator, true)}\n`,
    toolbox: { kind: "block", type: title, ...(inputs ? { inputs } : {}) },
  };
}

export const subtitleBlocks = [
  makeBlock(
    "show_subtitle",
    () => label("显示字幕 %1 持续 %2 秒（0 = 手动隐藏）", "顯示字幕 %1 持續 %2 秒（0 = 手動隱藏）", "Show subtitle %1 for %2 seconds (0 = until hidden)"),
    () => [
      { type: "input_value", name: "TEXT", check: "String" },
      { type: "input_value", name: "SECONDS", check: "Number" },
    ],
    (block, generator, lua) => {
      const text = generator.valueToCode(block, "TEXT", generator.ORDER_NONE) || '""';
      const seconds = generator.valueToCode(block, "SECONDS", generator.ORDER_NONE) || "0";
      return `${lua ? "show_subtitle" : "showSubtitle"}(${text}, ${seconds})`;
    },
    { TEXT: { shadow: { type: "text", fields: { TEXT: "请输入字幕" } } },
      SECONDS: { shadow: { type: "math_number", fields: { NUM: 3 } } } }
  ),
  makeBlock(
    "hide_subtitle",
    () => label("隐藏独立字幕", "隱藏獨立字幕", "Hide standalone subtitle"),
    () => [],
    (_block, _generator, lua) => lua ? "hide_subtitle()" : "hideSubtitle()"
  ),
  makeBlock(
    "subtitle_display_mode",
    () => label("场景字幕显示方式 %1", "場景字幕顯示方式 %1", "Scene subtitle layout %1"),
    () => [{ type: "field_dropdown", name: "MODE", options: [
      [label("上下分区", "上下分區", "Top and bottom"), "stack"],
      [label("单条", "單條", "Single"), "single"],
    ] }],
    (block, _generator, lua) =>
      `${lua ? "subtitle_mode" : "subtitleMode"}(${block.getFieldValue("MODE") === "stack"})`
  ),
];


export function SetupSubtitles(toolbox: Toolbox, parameters: unknown, canAuthor: boolean): void {
  if (!canAuthor) {
    for (const block of subtitleBlocks) RegisterData(block, parameters);
    return;
  }
  SetupIt({
    kind: "category",
    name: label("字幕", "字幕", "Subtitles"),
    colour: DataType.colour,
    contents: subtitleBlocks.map((block) => block.toolbox),
  }, (params) => {
    for (const block of subtitleBlocks) RegisterData(block, params);
  })(toolbox, parameters);
}
