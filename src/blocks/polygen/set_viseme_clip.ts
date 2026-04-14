import DataType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "set_viseme_clip",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const Msg = Blockly.Msg as unknown as Record<
      string,
      Record<string, string>
    >;
    const json = {
      type: data.name,
      message0: Msg["POLYGEN_SET_VISEME_CLIP"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "polygen",
          check: "Polygen",
        },
        {
          type: "input_value",
          name: "sound",
          check: "Sound",
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
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const javascript = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const value_sound = generator.valueToCode(
        block,
        "sound",
        generator.ORDER_NONE
      );
      const value_polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const code = `polygen.setVisemeClip(${value_polygen}, ${value_sound});\n`;
      return code;
    };
    return javascript;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const value_sound = generator.valueToCode(
        block,
        "sound",
        generator.ORDER_NONE
      );
      const value_polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const code = `_G.polygen.set_viseme_clip(${value_polygen}, ${value_sound})\n`;
      return code;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      polygen: {
        block: {
          type: "polygen_entity",
        },
      },
      sound: {
        block: {
          type: "sound_entity",
        },
      },
    },
  },
};

export default block;
