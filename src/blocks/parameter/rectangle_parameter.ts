import * as Blockly from "blockly";
import EventType from "./type";
import * as Helper from "../helper";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "rectangle_parameter",
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
      )["PARAMETER_RECTANGLE"][window.lg],
      args0: [
        {
          type: "input_dummy",
        },
        {
          type: "input_value",
          name: "Anchor",
          check: "Parameter",
        },
        {
          type: "field_number",
          name: "Radius",
          value: 0.2,
          precision: 0.01,
        },
      ],
      inputsInline: true,
      output: "Parameter",
      colour: 230,
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
      const value_anchor = generator.valueToCode(
        _block,
        "Anchor",
        generator.ORDER_ATOMIC
      );
      const number_radius = _block.getFieldValue("Radius");
      const code = Helper.RangeJS(value_anchor, number_radius);
      return [code, generator.ORDER_NONE];
    };
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    return function (
      _block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const value_anchor = generator.valueToCode(
        _block,
        "Anchor",
        generator.ORDER_ATOMIC
      );
      const number_radius = _block.getFieldValue("Radius");
      const code = Helper.Range(value_anchor, number_radius);
      return [code, generator.ORDER_NONE];
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
