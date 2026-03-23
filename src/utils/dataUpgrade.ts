/**
 * Blockly数据升级工具
 * 用于升级旧版task-tween和task-tween-to-data块的数据格式，确保Time字段兼容性
 */

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
