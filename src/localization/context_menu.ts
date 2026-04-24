import * as Blockly from "blockly";
import type { LocalizedMessages } from "./index";

export const localizedContextMenu = (): void => {
  const lang = (window.lg || "en-US") as keyof LocalizedMessages;

  const messages: Record<string, LocalizedMessages> = {
    EMPTY_BACKPACK: {
      "zh-CN": "清空背包",
      "en-US": "Empty Backpack",
      "ja-JP": "バックパックを空にする",
      "zh-TW": "清空背包",
      "th-TH": "เคลียร์เป้สะพาย",
    },
    REMOVE_FROM_BACKPACK: {
      "zh-CN": "从背包中移除",
      "en-US": "Remove from Backpack",
      "ja-JP": "バックパックから削除",
      "zh-TW": "從背包中移除",
      "th-TH": "ลบออกจากเป้สะพาย",
    },
    COPY_TO_BACKPACK: {
      "zh-CN": "复制到背包",
      "en-US": "Copy to Backpack",
      "ja-JP": "バックパックにコピー",
      "zh-TW": "複製到背包",
      "th-TH": "คัดลอกไปยังเป้สะพาย",
    },
    COPY_ALL_TO_BACKPACK: {
      "zh-CN": "复制当前工作区所有块到背包",
      "en-US": "Copy All Blocks to Backpack",
      "ja-JP": "ワークスペースのすべてをバックパックにコピー",
      "zh-TW": "複製當前工作區所有塊到背包",
      "th-TH": "คัดลอกบล็อกทั้งหมดไปยังเป้สะพาย",
    },
    PASTE_ALL_FROM_BACKPACK: {
      "zh-CN": "从背包粘贴所有块",
      "en-US": "Paste All Blocks from Backpack",
      "ja-JP": "バックパックからすべてを貼り付け",
      "zh-TW": "從背包粘貼所有塊",
      "th-TH": "วางบล็อกทั้งหมดจากเป้สะพาย",
    },
    CROSS_TAB_COPY: {
      "zh-CN": "复制到剪贴板",
      "en-US": "Copy to Clipboard",
      "ja-JP": "クリップボードにコピー",
      "zh-TW": "複製到剪貼板",
      "th-TH": "คัดลอกไปยังคลิปบอร์ด",
    },
    CROSS_TAB_PASTE: {
      "zh-CN": "从剪贴板粘贴",
      "en-US": "Paste from Clipboard",
      "ja-JP": "クリップボードから貼り付け",
      "zh-TW": "從剪貼板粘貼",
      "th-TH": "วางจากคลิปบอร์ด",
    },
    WORKSPACE_SELECT_ALL_BLOCKS: {
      "zh-CN": "选择所有块",
      "en-US": "Select All Blocks",
      "ja-JP": "すべてのブロックを選択",
      "zh-TW": "選擇所有塊",
      "th-TH": "เลือกบล็อกทั้งหมด",
    },
  };

  Object.entries(messages).forEach(([key, msg]) => {
    Blockly.Msg[key] = msg[lang];
  });
};

export default { localizedContextMenu };
