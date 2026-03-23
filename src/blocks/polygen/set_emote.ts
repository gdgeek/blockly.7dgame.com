import DataType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "set_emote",
} as const;

function getEmoteOptions(): [string, string][] {
  const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
  return [
    [Msg["POLYGEN_EMOTE_IDLE"]?.[window.lg], "idle"], //默认
    [Msg["POLYGEN_EMOTE_ANGER"]?.[window.lg], "anger"], //愤怒
    [Msg["POLYGEN_EMOTE_SMIRK"]?.[window.lg], "smirk"], //嘲笑
    [Msg["POLYGEN_EMOTE_SMILE"]?.[window.lg], "smile"], //微笑
    [Msg["POLYGEN_EMOTE_SAD"]?.[window.lg], "sad"], //悲伤
  ];
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
    const json = {
      type: data.name,
      message0: Msg["POLYGEN_SET_EMOTE"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "polygen",
          check: "Polygen",
        },
        {
          type: "field_dropdown",
          name: "emote",
          options: getEmoteOptions(),
        },
      ],
      inputsInline: true,
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
      init: function (this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const javascript = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const text_emote = block.getFieldValue("emote");
      const value_polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const code = `polygen.setEmote(${value_polygen}, ${JSON.stringify(
        text_emote
      )});\n`;
      return code;
    };
    return javascript;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const text_emote = block.getFieldValue("emote");
      const value_polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const code = `_G.polygen.set_emote(${value_polygen}, ${JSON.stringify(
        text_emote
      )})\n`;
      return code;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
