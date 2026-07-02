import * as Blockly from "blockly/core";

type RandomRangeLocale = "zh-CN" | "zh-TW" | "en-US" | "ja-JP" | "th-TH";

const RANDOM_RANGE_MESSAGES: Record<
  RandomRangeLocale,
  {
    integerTooltip: string;
    randomIntTooltip: string;
    rangeTitle: string;
    rangeTooltip: string;
  }
> = {
  "zh-CN": {
    integerTooltip: "整数。",
    randomIntTooltip: "返回两个指定的极限（含）之间的随机整数。左侧数值必须小于右侧数值。",
    rangeTitle: "从 %1 到 %2 范围内的随机小数",
    rangeTooltip: "返回两个数字之间的随机小数，两个数字都可以输入小数。左侧数值必须小于右侧数值。",
  },
  "zh-TW": {
    integerTooltip: "整數。",
    randomIntTooltip: "返回兩個指定的界限（含）之間的隨機整數。左側數值必須小於右側數值。",
    rangeTitle: "隨機取小數 %1 到 %2",
    rangeTooltip: "在指定兩個數字之間隨機取一個小數，兩個數字都可以輸入小數。左側數值必須小於右側數值。",
  },
  "en-US": {
    integerTooltip: "An integer.",
    randomIntTooltip:
      "Return a random integer between the two specified limits, inclusive. The left value must be smaller than the right value.",
    rangeTitle: "random decimal from %1 to %2",
    rangeTooltip:
      "Return a random decimal between the two specified limits. Decimal inputs are supported. The left value must be smaller than the right value.",
  },
  "ja-JP": {
    integerTooltip: "整数。",
    randomIntTooltip:
      "指定した2つの範囲（両端を含む）内のランダムな整数を返します。左側の値は右側の値より小さくする必要があります。",
    rangeTitle: "%1から%2までのランダムな小数",
    rangeTooltip:
      "指定した2つの数の間のランダムな小数を返します。小数も入力できます。左側の値は右側の値より小さくする必要があります。",
  },
  "th-TH": {
    integerTooltip: "จำนวนเต็ม",
    randomIntTooltip:
      "ส่งคืนจำนวนเต็มสุ่มระหว่างค่าขอบเขตสองค่า รวมค่าขอบเขตด้วย ค่าด้านซ้ายต้องน้อยกว่าค่าด้านขวา",
    rangeTitle: "สุ่มเลขทศนิยมตั้งแต่ %1 ถึง %2",
    rangeTooltip:
      "ส่งคืนเลขทศนิยมสุ่มระหว่างค่าที่ระบุ รองรับการป้อนทศนิยม ค่าด้านซ้ายต้องน้อยกว่าค่าด้านขวา",
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
  Blockly.Msg.MATH_RANDOM_INT_TOOLTIP = messages.randomIntTooltip;
  Blockly.Msg.MATH_RANDOM_FLOAT_RANGE_TITLE = messages.rangeTitle;
  Blockly.Msg.MATH_RANDOM_FLOAT_RANGE_TOOLTIP = messages.rangeTooltip;
};
