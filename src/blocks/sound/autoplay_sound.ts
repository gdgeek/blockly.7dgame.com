import DataType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "autoplay_sound",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["SOUND_AUTOPLAY"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "sound",
          check: "Sound",
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
      init: function (this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
    return data;
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const sound = generator.valueToCode(block, "sound", generator.ORDER_NONE);
      const isInActionTrigger =
        (block as unknown as { getSurroundParent: () => { type: string } | null }).getSurroundParent() &&
        (block as unknown as { getSurroundParent: () => { type: string } | null }).getSurroundParent()?.type === "action_trigger";
      const code = `await sound.auto_play(${sound}${
        isInActionTrigger ? ", true" : ""
      });\n`;
      return code;
    };
    return script;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const sound = generator.valueToCode(block, "sound", generator.ORDER_NONE);
      return "_G.sound.auto_play(" + sound + ")\n";
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
