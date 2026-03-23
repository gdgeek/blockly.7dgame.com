import DataType from "./type";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "vector3_data",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlock(_parameters: unknown): object {
    const block = {
      init: function (this: { jsonInit: (json: object) => void }) {
        this.jsonInit({
          type: data.name,
          message0: "X %1 Y %2 Z %3",
          args0: [
            {
              type: "input_value",
              name: "X",
              check: "Number",
            },
            {
              type: "input_value",
              name: "Y",
              check: "Number",
            },
            {
              type: "input_value",
              name: "Z",
              check: "Number",
            },
          ],
          inputsInline: true,
          output: "Vector3",
          colour: DataType.colour,
          tooltip: "",
          helpUrl: "",
        });
      },
    };
    return block;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const javascript = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const value_x = generator.valueToCode(block, "X", generator.ORDER_ATOMIC);
      const value_y = generator.valueToCode(block, "Y", generator.ORDER_ATOMIC);
      const value_z = generator.valueToCode(block, "Z", generator.ORDER_ATOMIC);
      const code = `new Vector3(${value_x}, ${value_y}, ${value_z})`;
      return [code, generator.ORDER_NONE];
    };
    return javascript;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const value_x = generator.valueToCode(block, "X", generator.ORDER_ATOMIC);
      const value_y = generator.valueToCode(block, "Y", generator.ORDER_ATOMIC);
      const value_z = generator.valueToCode(block, "Z", generator.ORDER_ATOMIC);
      const code = "CS.UnityEngine.Vector3(" + [value_x, value_y, value_z] + ")";
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      X: {
        shadow: {
          type: "math_number",
          fields: {
            NUM: 0,
          },
        },
      },
      Y: {
        shadow: {
          type: "math_number",
          fields: {
            NUM: 0,
          },
        },
      },
      Z: {
        shadow: {
          type: "math_number",
          fields: {
            NUM: 0,
          },
        },
      },
    },
  },
};
export default block;
