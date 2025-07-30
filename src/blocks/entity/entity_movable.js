import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "entity_movable",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.ENTITY_MOVABLE[window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Entity"],
        },
        {
          type: "input_value",
          name: "movable",
          check: "Boolean",
        },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "设置节点是否可移动",
      helpUrl: "",
    };
    return json;
  },
  getBlock: function (parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
        
        // 监听块变化，以便在适当时机更新实体选项
        this.setOnChange((event) => {
          if (event.type === Blockly.Events.BLOCK_CHANGE ||
              event.type === Blockly.Events.BLOCK_CREATE || 
              event.type === Blockly.Events.BLOCK_MOVE) {
            this.updateEntityOptions(parameters.resource);
          }
        });
      },
      
      // 更新实体选项
      updateEntityOptions: function(resource) {
        if (!resource || !resource.entity) return;
        
        // 查找当前连接的实体块
        const entityBlock = this.getInputTargetBlock("entity");
        if (!entityBlock || entityBlock.type !== "entity") return;
        
        // 筛选实体列表 - 只显示可移动的实体(moved为true)
        const filteredOptions = [["none", ""]];
        resource.entity.forEach((entity) => {
          // 只筛选 moved 属性为 true 的实体
          if (entity.moved === true) {
            filteredOptions.push([entity.name, entity.uuid]);
          }
        });
        
        // 使用公共方法更新下拉选项
        if (typeof entityBlock.updateDropdownOptions === 'function') {
          entityBlock.updateDropdownOptions(filteredOptions);
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
      const value_movable = generator.valueToCode(
        block,
        "movable",
        generator.ORDER_ATOMIC
      );

      const code = `entity.setMoveable(${value_entity}, ${value_movable})\n`;
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
      var value_movable = generator.valueToCode(
        block,
        "movable",
        generator.ORDER_ATOMIC
      );
      var code = "_G.entity.set_moveable(" + value_entity + ", " + value_movable + ")\n";
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