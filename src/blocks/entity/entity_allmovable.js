import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "entity_allmovable",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.ENTITY_MOVABLE_ALL[window.lg],
      args0: [
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
      tooltip: "设置所有节点是否可移动",
      helpUrl: "",
    };
    return json;
  },
  getBlock: function (parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
        
        // 保存可移动实体列表的属性
        this.movableEntities = [];

        // 监听块变化，以便在适当时机更新实体选项
        this.setOnChange((event) => {
            if (event.type === Blockly.Events.BLOCK_CHANGE ||
                event.type === Blockly.Events.BLOCK_CREATE || 
                event.type === Blockly.Events.BLOCK_MOVE) {
              this.updateEntityOptions(parameters.resource);
            }
          });
      },
      updateEntityOptions: function(resource) {
        if (!resource || !resource.entity) return;
        
        // 筛选实体列表 - 只显示可移动的实体(moved为true)
        const filteredOptions = [["none", ""]];
        this.movableEntities = []; // 重置可移动实体列表
        
        resource.entity.forEach((entity) => {
          // 只筛选 moved 属性为 true 的实体
          if (entity.moved === true) {
            filteredOptions.push([entity.name, entity.uuid]);
            this.movableEntities.push(entity.uuid);
          }
        });
      }
    };
    return data;
  },
  getJavascript(parameters) {
    const script = function (block, generator) {
      const value_movable = generator.valueToCode(
        block,
        "movable",
        generator.ORDER_ATOMIC
      );
      
      // 获取当前块实例上保存的可移动实体列表
      const movableEntities = block.movableEntities || [];
      
      let code;
      if (movableEntities.length > 0) {
        // 将每个UUID单独作为参数调用handleEntity
        const handlerCalls = movableEntities.map(uuid => 
          `handleEntity("${uuid}")`
        ).join(',\n    ');
        
        // 组合所有handler调用和value_movable参数
        code = `point.setAllMovable(` + "[\n" + handlerCalls + "], " + value_movable + ")\n";
      } else {
        // 如果没有可移动实体，传递空字符串
        code = `point.setAllMovable(handleEntity(""), ${value_movable})\n`;
      }
      
      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var value_movable = generator.valueToCode(
        block,
        "movable",
        generator.ORDER_ATOMIC
      );
      
      // 获取当前块实例上保存的可移动实体列表
      const movableEntities = block.movableEntities || [];
      
      let code;
      if (movableEntities.length > 0) {
        // 将每个UUID单独作为参数调用_G.helper.handler
        const handlerCalls = movableEntities.map(uuid => 
          `_G.helper.handler(index, '${uuid}')`
        ).join(',\n  ');
        
        // 组合所有handler调用和value_movable参数
        code = "_G.point.set_all_movable(" + "{\n  " + handlerCalls + "\n}, " + value_movable + ")\n";
      } else {
        // 如果没有可移动实体，传递空字符串
        code = "_G.point.set_all_movable(_G.helper.handler(index, ''), " + value_movable + ")\n";
      }
      
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