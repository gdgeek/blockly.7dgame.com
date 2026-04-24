import * as Blockly from "blockly/core";
import {
  javascriptGenerator,
  Order as JsOrder,
  type JavascriptGenerator,
} from "blockly/javascript";
import {
  luaGenerator,
  Order as LuaOrder,
  type LuaGenerator,
} from "blockly/lua";

const MATH_INTEGER_NUMBER = "math_integer_number";
const MATH_RANDOM_FLOAT_RANGE = "math_random_float_range";

const defineBlockOnce = (
  type: string,
  definition: Parameters<typeof Blockly.defineBlocksWithJsonArray>[0][number]
): void => {
  if (!Blockly.Blocks[type]) {
    Blockly.defineBlocksWithJsonArray([definition]);
  }
};

const registerMathRandomRangeBlocks = (): void => {
  defineBlockOnce(MATH_INTEGER_NUMBER, {
    type: MATH_INTEGER_NUMBER,
    message0: "%1",
    args0: [
      {
        type: "field_number",
        name: "NUM",
        value: 0,
        precision: 1,
      },
    ],
    output: "Number",
    helpUrl: "%{BKY_MATH_NUMBER_HELPURL}",
    style: "math_blocks",
    tooltip: "%{BKY_MATH_INTEGER_NUMBER_TOOLTIP}",
    extensions: ["parent_tooltip_when_inline"],
  });

  defineBlockOnce(MATH_RANDOM_FLOAT_RANGE, {
    type: MATH_RANDOM_FLOAT_RANGE,
    message0: "%{BKY_MATH_RANDOM_FLOAT_RANGE_TITLE}",
    args0: [
      {
        type: "input_value",
        name: "FROM",
        check: "Number",
      },
      {
        type: "input_value",
        name: "TO",
        check: "Number",
      },
    ],
    inputsInline: true,
    output: "Number",
    style: "math_blocks",
    tooltip: "%{BKY_MATH_RANDOM_FLOAT_RANGE_TOOLTIP}",
    helpUrl: "%{BKY_MATH_RANDOM_FLOAT_HELPURL}",
  });
};

export const registerMathRandomRangeGenerators = (): void => {
  registerMathRandomRangeBlocks();

  javascriptGenerator.forBlock[MATH_INTEGER_NUMBER] = function (
    block: Blockly.Block
  ): [string, JsOrder] {
    const number = Number(block.getFieldValue("NUM"));
    return [
      String(number),
      number >= 0 ? JsOrder.ATOMIC : JsOrder.UNARY_NEGATION,
    ];
  };

  luaGenerator.forBlock[MATH_INTEGER_NUMBER] = function (
    block: Blockly.Block
  ): [string, LuaOrder] {
    const number = Number(block.getFieldValue("NUM"));
    return [String(number), number < 0 ? LuaOrder.UNARY : LuaOrder.ATOMIC];
  };

  javascriptGenerator.forBlock[MATH_RANDOM_FLOAT_RANGE] = function (
    block: Blockly.Block,
    generator: JavascriptGenerator
  ): [string, JsOrder] {
    const from = generator.valueToCode(block, "FROM", JsOrder.NONE) || "0";
    const to = generator.valueToCode(block, "TO", JsOrder.NONE) || "0";
    const functionName = generator.provideFunction_("mathRandomNumber", [
      `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(a, b) {`,
      "  return Math.random() * (b - a) + a;",
      "}",
    ]);

    return [`${functionName}(${from}, ${to})`, JsOrder.FUNCTION_CALL];
  };

  luaGenerator.forBlock[MATH_RANDOM_FLOAT_RANGE] = function (
    block: Blockly.Block,
    generator: LuaGenerator
  ): [string, LuaOrder] {
    const from = generator.valueToCode(block, "FROM", LuaOrder.NONE) || "0";
    const to = generator.valueToCode(block, "TO", LuaOrder.NONE) || "0";
    const functionName = generator.provideFunction_("math_random_number", [
      `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(a, b)`,
      "  return math.random() * (b - a) + a",
      "end",
    ]);

    return [`${functionName}(${from}, ${to})`, LuaOrder.HIGH];
  };
};
