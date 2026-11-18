/**
 * Blockly数据升级工具
 * 用于升级旧版task-tween和task-tween-to-data块的数据格式，确保Time字段兼容性
 */
import { oppositeDissolveDirection } from "../blocks/entity/visual_execute";

function legacyDissolveDirection(
  showDirection: unknown,
  hideDirection: unknown,
  bool: BlocklyShadow | undefined,
): string {
  const showing = bool?.type !== "logic_boolean" || bool.fields?.BOOL !== "FALSE";
  const direction = String(showing ? showDirection ?? "0" : hideDirection ?? "0");
  const opposite = oppositeDissolveDirection(direction);
  return showing ? (opposite ? direction : "0") : opposite ?? "4";
}

/** Shadow block inside an input (e.g. math_number) */
export interface BlocklyShadow {
  type: string;
  fields?: Record<string, unknown>;
}

/** A single input slot on a block */
export interface BlocklyInput {
  block?: BlocklyBlock;
  shadow?: BlocklyShadow;
}

/** Recursive Blockly JSON block structure */
export interface BlocklyBlock {
  type: string;
  id?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, BlocklyInput>;
  next?: { block: BlocklyBlock };
  extraState?: { blocks?: Record<string, BlocklyBlock> };
}

/** Top-level Blockly workspace JSON data */
export interface BlocklyJsonData {
  blocks?: {
    blocks?: BlocklyBlock[];
  };
}

/**
 * 升级数据（自动检测类型）
 * @param data - XML字符串或JSON对象
 * @returns 升级后的数据
 */
export function upgradeTweenData(data: string): string;
export function upgradeTweenData(data: BlocklyJsonData): BlocklyJsonData;
export function upgradeTweenData(data: unknown): unknown;
export function upgradeTweenData(data: unknown): unknown {
  if (typeof data === "string") {
    return upgradeTweenXml(data);
  } else if (typeof data === "object" && data !== null) {
    return upgradeTweenJson(data as BlocklyJsonData);
  } else {
    return data;
  }
}

/**
 * 升级XML字符串中的task-tween块
 * @param xmlText - XML字符串
 * @returns 升级后的XML字符串
 */
export function upgradeTweenXml(xmlText: string): string {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // 找到所有类型为 task-tween 或 task-tween-to-data 的块
  const tweenBlocks = xmlDoc.querySelectorAll(
    'block[type="task-tween"], block[type="task-tween-to-data"]'
  );

  tweenBlocks.forEach((block, _index) => {
    // 检查是否有旧版的 field 标签
    const fieldTime = block.querySelector(':scope > field[name="Time"]');

    if (fieldTime) {
      const timeValue = fieldTime.textContent;

      // 1. 创建 <value> 标签
      const valueTag = xmlDoc.createElement("value");
      valueTag.setAttribute("name", "Time");

      // 2. 创建 <shadow> 标签
      const shadowBlock = xmlDoc.createElement("shadow");
      shadowBlock.setAttribute("type", "math_number");

      // 3. 创建内部的 <field> 标签
      const numField = xmlDoc.createElement("field");
      numField.setAttribute("name", "NUM");
      numField.textContent = timeValue;

      // 组装结构
      shadowBlock.appendChild(numField);
      valueTag.appendChild(shadowBlock);
      block.appendChild(valueTag);

      // 4. 移除旧的 field 标签
      block.removeChild(fieldTime);
    }
  });

  for (const block of xmlDoc.querySelectorAll('block[type="visual_execute"]')) {
    const show = block.querySelector(':scope > field[name="SHOW_DIRECTION"]');
    const hide = block.querySelector(':scope > field[name="HIDE_DIRECTION"]');
    if (!show && !hide) continue;
    if (!block.querySelector(':scope > field[name="DISSOLVE_DIRECTION"]')) {
      const input = block.querySelector(':scope > value[name="bool"]');
      const bool = input?.querySelector(':scope > block') ?? input?.querySelector(':scope > shadow');
      const field = xmlDoc.createElement("field");
      field.setAttribute("name", "DISSOLVE_DIRECTION");
      field.textContent = legacyDissolveDirection(show?.textContent, hide?.textContent, bool ? {
        type: bool.getAttribute("type") ?? "",
        fields: { BOOL: bool.querySelector(':scope > field[name="BOOL"]')?.textContent },
      } : undefined);
      (show ?? hide)?.before(field);
    }
    const duration = block.querySelector(':scope > field[name="DURATION"]');
    if (duration && block.querySelector(':scope > field[name="EFFECT"]')?.textContent === "dissolve"
      && !block.querySelector(':scope > field[name="DISSOLVE_DURATION"]')) {
      const field = xmlDoc.createElement("field");
      field.setAttribute("name", "DISSOLVE_DURATION");
      field.textContent = duration.textContent;
      duration.after(field);
    }
    show?.remove();
    hide?.remove();
  }

  const result = new XMLSerializer().serializeToString(xmlDoc);
  return result;
}

/**
 * 升级JSON对象中的task-tween块
 * @param jsonData - Blockly JSON数据对象
 * @returns 升级后的JSON对象
 */
export function upgradeTweenJson(jsonData: BlocklyJsonData): BlocklyJsonData {
  // eslint-disable-next-line no-unused-vars -- 用于调试日志计数
  let tweenCount = 0;

  const upgradeBlock = (block: BlocklyBlock): void => {
    const fields = block.fields;
    if (block.type === "visual_execute" && fields &&
      ("SHOW_DIRECTION" in fields || "HIDE_DIRECTION" in fields)) {
      fields.DISSOLVE_DIRECTION ??= legacyDissolveDirection(
        fields.SHOW_DIRECTION,
        fields.HIDE_DIRECTION,
        block.inputs?.bool?.block ?? block.inputs?.bool?.shadow,
      );
      if (fields.EFFECT === "dissolve" && fields.DURATION !== undefined) {
        fields.DISSOLVE_DURATION ??= fields.DURATION;
      }
      delete fields.SHOW_DIRECTION;
      delete fields.HIDE_DIRECTION;
    }
    if (block.type === "task-tween" || block.type === "task-tween-to-data") {
      tweenCount++;

      // 检查是否有旧版的 fields.Time
      if (block.fields && block.fields.Time !== undefined) {
        const timeValue = block.fields.Time;

        // 创建 shadow block
        const shadowBlock: BlocklyShadow = {
          type: "math_number",
          fields: {
            NUM: timeValue,
          },
        };

        // 设置 inputs.Time
        if (!block.inputs) block.inputs = {};
        block.inputs.Time = {
          shadow: shadowBlock,
        };

        // 移除旧的 fields.Time
        delete block.fields.Time;
      } else {
        // 没有旧版fields.Time，检查是否有inputs.Time
        if (!block.inputs || !block.inputs.Time) {
          if (!block.inputs) block.inputs = {};
          block.inputs.Time = {
            shadow: {
              type: "math_number",
              fields: {
                NUM: 0.03,
              },
            },
          };
        }
      }
    }

    // 递归处理子块
    if (block.inputs) {
      Object.values(block.inputs).forEach((input: BlocklyInput) => {
        if (input.block) upgradeBlock(input.block);
        if (input.shadow) upgradeBlock(input.shadow as unknown as BlocklyBlock);
      });
    }
    if (block.next && block.next.block) upgradeBlock(block.next.block);
    if (block.extraState && block.extraState.blocks) {
      Object.values(block.extraState.blocks).forEach(upgradeBlock);
    }
  };

  // 递归升级所有块
  if (jsonData.blocks && jsonData.blocks.blocks) {
    jsonData.blocks.blocks.forEach((block: BlocklyBlock, _index: number) => {
      upgradeBlock(block);
    });
  }

  return jsonData;
}
