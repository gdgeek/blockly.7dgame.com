import DataType from "./type";
import * as Blockly from "blockly";
import { setupPlaybackSubtitles, subtitleOverride } from "../sound/subtitle";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "play_video",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["VIDEO_PLAY"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "video",
          check: "Video",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const data = {
      init: function (this: Blockly.Block) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
        setupPlaybackSubtitles(this, parameters, "video");
      },
    };
    return data;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const video =
        generator.valueToCode(block, "video", generator.ORDER_NONE) ||
        "undefined";
      const isInActionTrigger =
        (
          block as unknown as {
            getSurroundParent: () => { type: string } | null;
          }
        ).getSurroundParent() &&
        (
          block as unknown as {
            getSurroundParent: () => { type: string } | null;
          }
        ).getSurroundParent()?.type === "action_trigger";
      const subtitle = subtitleOverride(block);
      const code = `await video.play(${video}${
        subtitle ? `, ${Boolean(isInActionTrigger)}, "${subtitle}"` : isInActionTrigger ? ", true" : ""
      });\n`;
      return code;
    };
    return script;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const video =
        generator.valueToCode(block, "video", generator.ORDER_NONE) || "nil";
      const subtitle = subtitleOverride(block);
      return `_G.video.play(${video}${subtitle ? `, "${subtitle}"` : ""})\n`;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      video: {
        block: {
          type: "video_entity",
        },
      },
    },
  },
};

export default block;
