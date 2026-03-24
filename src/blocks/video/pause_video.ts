import DataType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "pause_video",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["VIDEO_PAUSE"][window.lg],
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
    return {
      init(this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const video = generator.valueToCode(block, "video", generator.ORDER_NONE);
      return `await video.pause(${video});\n`;
    };
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const video = generator.valueToCode(block, "video", generator.ORDER_NONE);
      return `_G.video.pause(${video})\n`;
    };
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
