import DataType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "play_video_task",
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
      )["TASK_PLAY_VIDEO_TASK"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "video",
          check: "Video",
        },
      ],
      output: "Task",
      colour: DataType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const data = {
      init: function (this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
    return data;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const javascript = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const video = generator.valueToCode(block, "video", generator.ORDER_NONE);
      const parentBlock = (
        block as unknown as {
          getParent: () => {
            type: string;
            getInputTargetBlock: (name: string) => unknown;
          } | null;
        }
      ).getParent();
      const isAssignment =
        parentBlock &&
        (parentBlock.type === "variables_set" ||
          parentBlock.type === "math_change" ||
          (parentBlock.type === "lists_setIndex" &&
            block === parentBlock.getInputTargetBlock("TO")));
      const methodName = isAssignment ? "createTask" : "playTask";
      const code = `video.${methodName}(${video})`;
      return [code, generator.ORDER_NONE];
    };
    return javascript;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const video = generator.valueToCode(block, "video", generator.ORDER_NONE);
      const code = "_G.video.play_task(" + video + ")\n";
      return [code, generator.ORDER_NONE];
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
