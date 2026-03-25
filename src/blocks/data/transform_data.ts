import * as Blockly from "blockly";
import DataType from "./type";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "transform_data",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  getBlock(_parameters: unknown): object {
    const block = {
      init: function () {
        const current = this as { jsonInit: (_json: object) => void };
        current.jsonInit({
          type: data.name,
          message0: (
            Blockly.Msg as unknown as Record<string, Record<string, string>>
          )["DATA_TRANSFORM_DATA"][window.lg],
          args0: [
            {
              type: "input_value",
              name: "position",
              check: "Vector3",
            },
            {
              type: "input_value",
              name: "rotate",
              check: "Vector3",
            },
            {
              type: "input_value",
              name: "scale",
              check: "Vector3",
            },
          ],
          inputsInline: false,
          output: "Transform",
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
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const value_position = generator.valueToCode(
        block,
        "position",
        generator.ORDER_ATOMIC
      );
      const value_scale = generator.valueToCode(
        block,
        "scale",
        generator.ORDER_ATOMIC
      );
      const value_rotate = generator.valueToCode(
        block,
        "rotate",
        generator.ORDER_ATOMIC
      );
      const code = `transform(${value_position}, ${value_rotate}, ${value_scale})`;
      return [code, generator.ORDER_NONE];
    };
    return script;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const value_position = generator.valueToCode(
        block,
        "position",
        generator.ORDER_ATOMIC
      );
      const value_scale = generator.valueToCode(
        block,
        "scale",
        generator.ORDER_ATOMIC
      );
      const value_rotate = generator.valueToCode(
        block,
        "rotate",
        generator.ORDER_ATOMIC
      );
      const code =
        "CS.MLua.Transform(" +
        value_position +
        ", " +
        value_rotate +
        ", " +
        value_scale +
        ")";
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      position: {
        shadow: {
          type: "vector3_data",
          inputs: {
            X: { shadow: { type: "math_number", fields: { NUM: 0 } } },
            Y: { shadow: { type: "math_number", fields: { NUM: 0 } } },
            Z: { shadow: { type: "math_number", fields: { NUM: 0 } } },
          },
        },
      },
      rotate: {
        shadow: {
          type: "vector3_data",
          inputs: {
            X: { shadow: { type: "math_number", fields: { NUM: 0 } } },
            Y: { shadow: { type: "math_number", fields: { NUM: 0 } } },
            Z: { shadow: { type: "math_number", fields: { NUM: 0 } } },
          },
        },
      },
      scale: {
        shadow: {
          type: "vector3_data",
          inputs: {
            X: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            Y: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            Z: { shadow: { type: "math_number", fields: { NUM: 1 } } },
          },
        },
      },
    },
  },
};
export default block;
