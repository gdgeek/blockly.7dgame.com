import EventType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "parameters",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["PARAMETER_PARAMETERS"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "ParameterArray",
          check: "Array",
        },
      ],
      inputsInline: true,
      output: "Parameter",
      colour: EventType.colour,
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
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    return function (
      _block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const array =
        generator.valueToCode(
          _block,
          "ParameterArray",
          generator.ORDER_ATOMIC
        ) || "[]";
      return [`helper.parameters(${array})`, generator.ORDER_FUNCTION_CALL];
    };
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    return function (
      _block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const array =
        generator.valueToCode(
          _block,
          "ParameterArray",
          generator.ORDER_ATOMIC
        ) || "{}";
      return ["_G.helper.parameters(" + array + ")", generator.ORDER_HIGH];
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
