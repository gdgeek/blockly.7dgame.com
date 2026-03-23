import * as Blockly from "blockly";
import EventType from "./type";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "system_parameter",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["PARAMETER_SYSTEM"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "Input",
          inputsInline: true,
          check: "String",
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
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    return function (_block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const input = generator.valueToCode(_block, "Input", generator.ORDER_NONE);
      return [`system.parameter(${input})`, generator.ORDER_NONE];
    };
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    return function (_block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const input = generator.valueToCode(_block, "Input", generator.ORDER_NONE);
      const code = "_G.system.parameter(" + input + ")";
      return [code, generator.ORDER_NONE];
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
