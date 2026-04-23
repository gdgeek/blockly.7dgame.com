import * as Blockly from "blockly/core";

type RandomRangeLocale = "zh-CN" | "zh-TW" | "en-US" | "ja-JP" | "th-TH";

const RANDOM_RANGE_MESSAGES: Record<
  RandomRangeLocale,
  { integerTooltip: string; rangeTitle: string; rangeTooltip: string }
> = {
  "zh-CN": {
    integerTooltip: "整数。",
    rangeTitle: "从 %1 到 %2 范围内的随机小数",
    rangeTooltip: "返回两个数字之间的随机小数，两个数字都可以输入小数。",
  },
  "zh-TW": {
    integerTooltip: "整數。",
    rangeTitle: "隨機取小數 %1 到 %2",
    rangeTooltip: "在指定兩個數字之間隨機取一個小數，兩個數字都可以輸入小數。",
  },
  "en-US": {
    integerTooltip: "An integer.",
    rangeTitle: "random decimal from %1 to %2",
    rangeTooltip:
      "Return a random decimal between the two specified limits. Decimal inputs are supported.",
  },
  "ja-JP": {
    integerTooltip: "整数。",
    rangeTitle: "%1から%2までのランダムな小数",
    rangeTooltip: "指定した2つの数の間のランダムな小数を返します。小数も入力できます。",
  },
  "th-TH": {
    integerTooltip: "จำนวนเต็ม",
    rangeTitle: "สุ่มเลขทศนิยมตั้งแต่ %1 ถึง %2",
    rangeTooltip: "ส่งคืนเลขทศนิยมสุ่มระหว่างค่าที่ระบุ รองรับการป้อนทศนิยม",
  },
};

const getRandomRangeLocale = (): RandomRangeLocale => {
  const language =
    window.lg ||
    new URLSearchParams(window.location.search).get("language") ||
    "en-US";
  const locales = Object.keys(RANDOM_RANGE_MESSAGES) as RandomRangeLocale[];
  return locales.find((locale) => language.includes(locale)) ?? "en-US";
};

export const overrideMathRandomRangeMessages = (): void => {
  const messages = RANDOM_RANGE_MESSAGES[getRandomRangeLocale()];
  Blockly.Msg.MATH_INTEGER_NUMBER_TOOLTIP = messages.integerTooltip;
  Blockly.Msg.MATH_RANDOM_FLOAT_RANGE_TITLE = messages.rangeTitle;
  Blockly.Msg.MATH_RANDOM_FLOAT_RANGE_TOOLTIP = messages.rangeTooltip;
};
