import EventType from "./type";
import * as Helper from "../helper";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "boolean_parameter",
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
      )["PARAMETER_BOOLEAN"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "Input",
          inputsInline: true,
          check: "Boolean",
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
      const input = generator.valueToCode(
        _block,
        "Input",
        generator.ORDER_NONE
      );
      return [Helper.BooleanJS(input), generator.ORDER_NONE];
    };
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    return function (
      _block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const input = generator.valueToCode(
        _block,
        "Input",
        generator.ORDER_NONE
      );
      return [Helper.Boolean(input), generator.ORDER_NONE];
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
