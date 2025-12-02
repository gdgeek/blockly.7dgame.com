import * as Blockly from "blockly";

export const localizedContextMenu = () => {
  const lang = window.lg || "en";

  const messages = {
    EMPTY_BACKPACK: {
      "zh-cn": "清空背包",
      en: "Empty Backpack",
      ja: "バックパックを空にする",
      "zh-tw": "清空背包",
      th: "เคลียร์เป้สะพาย",
    },
    REMOVE_FROM_BACKPACK: {
      "zh-cn": "从背包中移除",
      en: "Remove from Backpack",
      ja: "バックパックから削除",
      "zh-tw": "從背包中移除",
      th: "ลบออกจากเป้สะพาย",
    },
    COPY_TO_BACKPACK: {
      "zh-cn": "复制到背包",
      en: "Copy to Backpack",
      ja: "バックパックにコピー",
      "zh-tw": "複製到背包",
      th: "คัดลอกไปยังเป้สะพาย",
    },
    COPY_ALL_TO_BACKPACK: {
      "zh-cn": "复制当前工作区所有块到背包",
      en: "Copy All Blocks to Backpack",
      ja: "ワークスペースのすべてをバックパックにコピー",
      "zh-tw": "複製當前工作區所有塊到背包",
      th: "คัดลอกบล็อกทั้งหมดไปยังเป้สะพาย",
    },
    PASTE_ALL_FROM_BACKPACK: {
      "zh-cn": "从背包粘贴所有块",
      en: "Paste All Blocks from Backpack",
      ja: "バックパックからすべてを貼り付け",
      "zh-tw": "從背包粘貼所有塊",
      th: "วางบล็อกทั้งหมดจากเป้สะพาย",
    },
    CROSS_TAB_COPY: {
      "zh-cn": "复制到剪贴板",
      en: "Copy to Clipboard",
      ja: "クリップボードにコピー",
      "zh-tw": "複製到剪貼板",
      th: "คัดลอกไปยังคลิปบอร์ด",
    },
    CROSS_TAB_PASTE: {
      "zh-cn": "从剪贴板粘贴",
      en: "Paste from Clipboard",
      ja: "クリップボードから貼り付け",
      "zh-tw": "從剪貼板粘貼",
      th: "วางจากคลิปบอร์ด",
    },
  };

  Object.entries(messages).forEach(([key, msg]) => {
    Blockly.Msg[key] = msg[lang];
  });
};

export default { localizedContextMenu };
