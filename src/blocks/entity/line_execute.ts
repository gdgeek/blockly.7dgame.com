import DataType from "./type";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "line_execute",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: data.name,
      message0: "从 %1 连线到 %2",
      args0: [
        {
          type: "input_value",
          name: "from",
          check: "Entity",
        },
        {
          type: "input_value",
          name: "to",
          check: "Entity",
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
    const data = {
      init: function (this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
    return data;
  },
  getJavascript(
    parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return this.getLua(parameters) as (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ) => string;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const value_from = generator.valueToCode(
        block,
        "from",
        generator.ORDER_ATOMIC
      );
      const value_to = generator.valueToCode(
        block,
        "to",
        generator.ORDER_ATOMIC
      );
      const code =
        "CS.MLua.Helper.Lined(" + value_from + ", " + value_to + ")\n";
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
