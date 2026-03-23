import DataType from "./type";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "entity_explode",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: "实体 %1 爆炸展开 间距 %2",
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: "Entity",
        },
        {
          type: "field_number",
          name: "distance",
          value: "0.1",
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
  getJavascript(parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return this.getLua(parameters) as (block: BlocklyBlock, generator: BlocklyGenerator) => string;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const number_distance = block.getFieldValue("distance");
      const value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );

      const code =
        "CS.MLua.Point.Explode(" +
        value_entity +
        ", " +
        number_distance +
        ")\n";
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
