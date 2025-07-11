import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "visual_tooltip",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    // 确保parameters存在，避免出错
    parameters = parameters || {};
    
    const json = {
      type: "block_type",
      message0: Blockly.Msg.TOOLTIP_VISUAL[window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Entity", "Polygen", "Voxel"],
        },
        {
          type: "input_value",
          name: "bool",
          check: "Boolean",
        },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "Show or hide label on a specific point",
      helpUrl: "",
    };
    return json;
  },
  getBlock: function (parameters) {
    const data = {
      init: function () {
        console.error("parameters", parameters);
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
        
        // 存储所有可用的tooltip信息
        this.tooltipsInfo = [];
        
        // 如果有Tooltip类型的action，收集所有parentUuid
        if (parameters && parameters.resource && parameters.resource.action) {
          const tooltipActions = parameters.resource.action.filter(action => action.type === "Tooltip");
          
          // 收集所有具有parentUuid的tooltip
          if (tooltipActions && tooltipActions.length > 0) {
            tooltipActions.forEach(tooltipAction => {
              if (tooltipAction.parentUuid) {
                this.tooltipsInfo.push({
                  parentUuid: tooltipAction.parentUuid
                });
              }
            });
          }
        }
        
        // 监听输入连接事件
        this.setOnChange((event) => {
          if (event.type === Blockly.Events.BLOCK_CHANGE ||
              event.type === Blockly.Events.BLOCK_MOVE ||
              event.type === Blockly.Events.BLOCK_CREATE) {
            this.updateConnectedBlock();
          }
        });
        
        // 初始化时更新
        setTimeout(() => {
          this.updateConnectedBlock();
        }, 0);
      },
      
      // 将tooltipsInfo传递给连接的实体块
      updateConnectedBlock: function() {
        if (!this.tooltipsInfo || this.tooltipsInfo.length === 0) return;
        
        const entityInput = this.getInput('entity');
        if (!entityInput || !entityInput.connection) return;
        
        const connectedBlock = this.getInputTargetBlock('entity');
        if (!connectedBlock) return;
        
        // 给连接的块传递tooltipsInfo
        if (typeof connectedBlock.updateEntityOptions === 'function') {
          connectedBlock.updateEntityOptions({
            tooltipsInfo: this.tooltipsInfo,
            sourceBlockId: this.id // 记录来源块ID，用于后续判断连接断开时恢复选项
          });
        }
      }
    };
    return data;
  },
  getJavascript(parameters) {
    const script = function (block, generator) {
      const value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      const value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      const code = `point.setTooltipVisual(${value_entity}, ${value_bool})\n`;
      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      var value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      var code = `_G.point.set_tooltip_visual(${value_entity}, ${value_bool})\n`;
      return code;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;