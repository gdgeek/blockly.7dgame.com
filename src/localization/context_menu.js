import * as Blockly from "blockly";

export const localizedContextMenu = () => {
  const lang = window.lg || "en";

  const messages = {
    EMPTY_BACKPACK: {
      zh: "清空背包",
      en: "Empty Backpack",
      ja: "バックパックを空にする",
    },
    REMOVE_FROM_BACKPACK: {
      zh: "从背包中移除",
      en: "Remove from Backpack",
      ja: "バックパックから削除",
    },
    COPY_TO_BACKPACK: {
      zh: "复制到背包",
      en: "Copy to Backpack",
      ja: "バックパックにコピー",
    },
    COPY_ALL_TO_BACKPACK: {
      zh: "复制当前工作区所有块到背包",
      en: "Copy All Blocks to Backpack",
      ja: "ワークスペースのすべてをバックパックにコピー",
    },
    PASTE_ALL_FROM_BACKPACK: {
      zh: "从背包粘贴所有块",
      en: "Paste All Blocks from Backpack",
      ja: "バックパックからすべてを貼り付け",
    },
    CROSS_TAB_COPY: {
      zh: "复制到剪贴板",
      en: "Copy to Clipboard",
      ja: "クリップボードにコピー",
    },
    CROSS_TAB_PASTE: {
      zh: "从剪贴板粘贴",
      en: "Paste from Clipboard",
      ja: "クリップボードから貼り付け",
    },
  };

  Object.entries(messages).forEach(([key, msg]) => {
    Blockly.Msg[key] = msg[lang] || msg.en || msg.zh;
  });

};

export default { localizedContextMenu };
