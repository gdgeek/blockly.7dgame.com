import EventType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

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
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["PARAMETER_PARAMETERS"][window.lg],
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
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (_block: BlocklyBlock, generator: BlocklyGenerator): string {
      const array = generator.valueToCode(
        _block,
        "ParameterArray",
        generator.ORDER_ATOMIC
      );
      const code = `helper.parameters(${array})\n`;
      return code;
    };
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    return function (_block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const array = generator.valueToCode(
        _block,
        "ParameterArray",
        generator.ORDER_ATOMIC
      );
      const code = "_G.helper.parameters(" + array + ")\n";
      return [code, generator.ORDER_NONE];
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
