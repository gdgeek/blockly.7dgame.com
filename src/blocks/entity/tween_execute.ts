import DataType from "./type";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "tween_execute",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: data.name,
      message0: "实体 %1 经过 %2 秒移动到 %3 %4 同步 %5 独占 %6",
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: "Entity",
        },
        {
          type: "field_number",
          name: "time",
          value: 0.3,
          min: 0,
          max: 1000,
        },
        {
          type: "input_dummy",
        },
        {
          type: "input_value",
          name: "transform",
          check: "Transform",
        },
        {
          type: "field_checkbox",
          name: "sync",
          checked: true,
        },
        {
          type: "field_checkbox",
          name: "occupy",
          checked: true,
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
      const entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_ATOMIC
      );
      const time = block.getFieldValue("time");
      const transform = generator.valueToCode(
        block,
        "transform",
        generator.ORDER_ATOMIC
      );

      const sync = block.getFieldValue("sync") === "TRUE";
      const occupy = block.getFieldValue("sync") === "TRUE";

      const parameter =
        entity + ", " + time + ", " + transform + ", " + JSON.stringify(occupy);
      if (sync) {
        return "_G.point.sync_tween(" + parameter + ")\n";
      } else {
        return "_G.point.tween(" + parameter + ")\n";
      }
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
