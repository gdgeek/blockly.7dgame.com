import { describe, expect, it, vi } from "vitest";
import type { Block } from "blockly/core";
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
import { registerMathRandomRangeGenerators } from "@/custom/math_random_range";

describe("math random range generator", () => {
  it("keeps Blockly's default random integer generators registered", () => {
    const originalJavaScriptRandomInt =
      javascriptGenerator.forBlock["math_random_int"];
    const originalLuaRandomInt = luaGenerator.forBlock["math_random_int"];

    registerMathRandomRangeGenerators();

    expect(javascriptGenerator.forBlock["math_random_int"]).toBe(
      originalJavaScriptRandomInt
    );
    expect(luaGenerator.forBlock["math_random_int"]).toBe(originalLuaRandomInt);
  });

  it("generates a JavaScript integer literal for the integer-only shadow block", () => {
    registerMathRandomRangeGenerators();
    const block = {
      getFieldValue: vi.fn().mockReturnValue("-8"),
    } as unknown as Block;

    const code = javascriptGenerator.forBlock["math_integer_number"](
      block,
      {} as JavascriptGenerator
    );

    expect(code).toEqual(["-8", JsOrder.UNARY_NEGATION]);
  });

  it("generates a JavaScript decimal random number between two inputs", () => {
    registerMathRandomRangeGenerators();
    const generator = {
      FUNCTION_NAME_PLACEHOLDER_: "%%FUNC%%",
      valueToCode: vi.fn((_block: Block, inputName: string) =>
        inputName === "FROM" ? "1.5" : "3.25"
      ),
      provideFunction_: vi.fn().mockReturnValue("mathRandomNumber"),
    } as unknown as JavascriptGenerator;

    const code = javascriptGenerator.forBlock["math_random_float_range"](
      {} as Block,
      generator
    );

    expect(code).toEqual([
      "mathRandomNumber(1.5, 3.25)",
      JsOrder.FUNCTION_CALL,
    ]);
    expect(generator.provideFunction_).toHaveBeenCalledWith(
      "mathRandomNumber",
      [
        "function %%FUNC%%(a, b) {",
        "  return Math.random() * (b - a) + a;",
        "}",
      ]
    );
  });

  it("generates a Lua integer literal for the integer-only shadow block", () => {
    registerMathRandomRangeGenerators();
    const block = {
      getFieldValue: vi.fn().mockReturnValue("12"),
    } as unknown as Block;

    const code = luaGenerator.forBlock["math_integer_number"](
      block,
      {} as LuaGenerator
    );

    expect(code).toEqual(["12", LuaOrder.ATOMIC]);
  });

  it("generates a Lua decimal random number between two inputs", () => {
    registerMathRandomRangeGenerators();
    const generator = {
      FUNCTION_NAME_PLACEHOLDER_: "__FUNC__",
      valueToCode: vi.fn((_block: Block, inputName: string) =>
        inputName === "FROM" ? "0.25" : "8.5"
      ),
      provideFunction_: vi.fn().mockReturnValue("math_random_number"),
    } as unknown as LuaGenerator;

    const code = luaGenerator.forBlock["math_random_float_range"](
      {} as Block,
      generator
    );

    expect(code).toEqual(["math_random_number(0.25, 8.5)", LuaOrder.HIGH]);
    expect(generator.provideFunction_).toHaveBeenCalledWith(
      "math_random_number",
      [
        "function __FUNC__(a, b)",
        "  return math.random() * (b - a) + a",
        "end",
      ]
    );
  });
});
