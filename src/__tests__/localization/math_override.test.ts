import { describe, expect, it } from "vitest";
import * as Blockly from "blockly/core";
import { overrideMathRandomRangeMessages } from "@/localization/math_override";

describe("overrideMathRandomRangeMessages", () => {
  it("adds Simplified Chinese messages for the extra decimal range block", () => {
    window.lg = "zh-CN";
    Blockly.Msg.MATH_RANDOM_INT_TITLE = "从 %1 到 %2 范围内的随机整数";

    overrideMathRandomRangeMessages();

    expect(Blockly.Msg.MATH_RANDOM_INT_TITLE).toBe(
      "从 %1 到 %2 范围内的随机整数"
    );
    expect(Blockly.Msg.MATH_RANDOM_FLOAT_RANGE_TITLE).toBe(
      "从 %1 到 %2 范围内的随机小数"
    );
    expect(Blockly.Msg.MATH_RANDOM_FLOAT_RANGE_TOOLTIP).toContain("小数");
    expect(Blockly.Msg.MATH_INTEGER_NUMBER_TOOLTIP).toBe("整数。");
  });

  it("falls back to English for unsupported languages", () => {
    window.lg = "fr-FR";

    overrideMathRandomRangeMessages();

    expect(Blockly.Msg.MATH_RANDOM_FLOAT_RANGE_TITLE).toBe(
      "random decimal from %1 to %2"
    );
  });
});
