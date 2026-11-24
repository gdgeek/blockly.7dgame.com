import DataType from "./type";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "module_to_transform_data",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  getBlock(_parameters: unknown): object {
    const block = {
      init: function () {
        const current = this as unknown as {
          jsonInit: (_json: object) => void;
        };
        current.jsonInit({
          type: data.name,
          message0: window.lg.startsWith("zh") ? "读取节点 %1 的位置、旋转和大小" : "read local transform of %1",
          args0: [
            {
              type: "input_value",
              name: "entity",
              check: ["Entity", "Video", "Picture", "Polygen", "Text", "Voxel", "Sound"],
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
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      const code = "CS.MLua.Point.ToTransformData(" + value_entity + ")";
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const javascript = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const entity =
        generator.valueToCode(block, "entity", generator.ORDER_NONE) ||
        "undefined";
      return [
        `point.toTransformData(${entity})`,
        generator.ORDER_FUNCTION_CALL,
      ];
    };
    return javascript;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
