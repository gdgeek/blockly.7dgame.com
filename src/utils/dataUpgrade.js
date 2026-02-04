/**
 * Blockly数据升级工具
 * 用于升级旧版task-tween和task-tween-to-data块的数据格式，确保Time字段兼容性
 */

/**
 * 升级数据（自动检测类型）
 * @param {string|object} data - XML字符串或JSON对象
 * @returns {string|object} 升级后的数据
 */
export function upgradeTweenData(data) {
  if (typeof data === 'string') {
    // XML字符串
    // console.log('[DataUpgrade] XML string detected, upgrading XML');
    return upgradeTweenXml(data);
  } else if (typeof data === 'object' && data !== null) {
    // JSON对象
    // console.log('[DataUpgrade] JSON object detected, upgrading JSON');
    return upgradeTweenJson(data);
  } else {
    // console.log('[DataUpgrade] Unknown data type:', typeof data);
    return data;
  }
}

/**
 * 升级XML字符串中的task-tween块
 * @param {string} xmlText - XML字符串
 * @returns {string} 升级后的XML字符串
 */
export function upgradeTweenXml(xmlText) {
  // console.log('[DataUpgrade XML] 开始升级XML:', xmlText.substring(0, 200) + '...');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // 找到所有类型为 task-tween 或 task-tween-to-data 的块
  const tweenBlocks = xmlDoc.querySelectorAll('block[type="task-tween"], block[type="task-tween-to-data"]');
  // console.log('[DataUpgrade XML] 找到 task-tween 和 task-tween-to-data 块数量:', tweenBlocks.length);

  tweenBlocks.forEach((block, index) => {
    // 检查是否有旧版的 field 标签
    const fieldTime = block.querySelector(':scope > field[name="Time"]');

    if (fieldTime) {
      const timeValue = fieldTime.textContent;
      // console.log(`[DataUpgrade XML] 块 ${index} (${block.getAttribute('type')}): 发现旧版数据 Time: ${timeValue}, 正在转换...`);

      // 1. 创建 <value> 标签
      const valueTag = xmlDoc.createElement('value');
      valueTag.setAttribute('name', 'Time');

      // 2. 创建 <shadow> 标签
      const shadowBlock = xmlDoc.createElement('shadow');
      shadowBlock.setAttribute('type', 'math_number');

      // 3. 创建内部的 <field> 标签
      const numField = xmlDoc.createElement('field');
      numField.setAttribute('name', 'NUM');
      numField.textContent = timeValue;

      // 组装结构
      shadowBlock.appendChild(numField);
      valueTag.appendChild(shadowBlock);
      block.appendChild(valueTag);

      // 4. 移除旧的 field 标签
      block.removeChild(fieldTime);
      // console.log(`[DataUpgrade XML] 块 ${index} (${block.getAttribute('type')}): 转换完成`);
    } else {
      // console.log(`[DataUpgrade XML] 块 ${index} (${block.getAttribute('type')}): 没有旧版field`);
    }
  });

  const result = new XMLSerializer().serializeToString(xmlDoc);
  // console.log('[DataUpgrade XML] 升级后的XML:', result.substring(0, 200) + '...');
  return result;
}

/**
 * 升级JSON对象中的task-tween块
 * @param {object} jsonData - Blockly JSON数据对象
 * @returns {object} 升级后的JSON对象
 */
export function upgradeTweenJson(jsonData) {
  // console.log('[DataUpgrade JSON] 开始升级JSON:', JSON.stringify(jsonData).substring(0, 200) + '...');

  let tweenCount = 0;
  const upgradeBlock = (block) => {

    if (block.type === 'task-tween' || block.type === 'task-tween-to-data') {
      tweenCount++;
      // console.log('[DataUpgrade JSON] 找到 task-tween 或 task-tween-to-data 块:', block.id);
      // console.log('[DataUpgrade JSON] 块结构:', JSON.stringify(block, null, 2));

      // 检查是否有旧版的 fields.Time
      if (block.fields && block.fields.Time !== undefined) {
        const timeValue = block.fields.Time;
        // console.log('[DataUpgrade JSON] 发现旧版数据 Time:', timeValue, '正在转换...');

        // 创建 shadow block
        const shadowBlock = {
          type: 'math_number',
          fields: {
            NUM: timeValue
          }
        };

        // 设置 inputs.Time
        if (!block.inputs) block.inputs = {};
        block.inputs.Time = {
          shadow: shadowBlock
        };

        // 移除旧的 fields.Time
        delete block.fields.Time;
        // console.log('[DataUpgrade JSON] 转换完成');
      } else {
        // 没有旧版fields.Time，检查是否有inputs.Time
        if (!block.inputs || !block.inputs.Time) {
          // console.log('[DataUpgrade JSON] 该块没有inputs.Time，添加默认数字块');
          if (!block.inputs) block.inputs = {};
          block.inputs.Time = {
            shadow: {
              type: 'math_number',
              fields: {
                NUM: 0.03
              }
            }
          };
        } else {
          // console.log('[DataUpgrade JSON] 该块已有inputs.Time');
        }
      }
    }

    // 递归处理子块
    if (block.inputs) {
      Object.values(block.inputs).forEach(input => {
        if (input.block) upgradeBlock(input.block);
        if (input.shadow) upgradeBlock(input.shadow);
      });
    }
    if (block.next && block.next.block) upgradeBlock(block.next.block);
    if (block.extraState && block.extraState.blocks) {
      Object.values(block.extraState.blocks).forEach(upgradeBlock);
    }
  };

  // 递归升级所有块
  if (jsonData.blocks && jsonData.blocks.blocks) {
    // console.log('[DataUpgrade JSON] 总块数量:', jsonData.blocks.blocks.length);
    jsonData.blocks.blocks.forEach((block, index) => {
      // console.log(`[DataUpgrade JSON] 块 ${index} 类型: ${block.type}`);
      upgradeBlock(block);
    });
  } else {
    // console.log('[DataUpgrade JSON] 没有找到 blocks.blocks');
  }

  // console.log('[DataUpgrade JSON] 总共找到 task-tween 和 task-tween-to-data 块数量:', tweenCount);
  // console.log('[DataUpgrade JSON] 升级后的JSON:', JSON.stringify(jsonData).substring(0, 200) + '...');
  return jsonData;
}