import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "polygen_movable",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.POLYGEN_MOVABLE[window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Polygen"],
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
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock: function (parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
        
        // 监听"是否可移动"输入变化
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
        if (!resource || !resource.polygen) return;
        
        // 获取连接的 movable 块
        const movableBlock = this.getInputTargetBlock("movable");
        if (!movableBlock) return;
        
        // 获取"是否可移动"的值
        let isMovable = false;
        if (movableBlock.type === "logic_boolean") {
          isMovable = movableBlock.getFieldValue("BOOL") === "TRUE";
        }
        
        // 查找当前连接的实体块
        const entityBlock = this.getInputTargetBlock("entity");
        if (!entityBlock || entityBlock.type !== "polygen_entity") return;
        
        // 筛选模型列表
        const filteredOptions = [["none", ""]];
        resource.polygen.forEach((poly) => {
          // 根据 moved 属性筛选
          if ((isMovable && poly.moved === true) || (!isMovable && poly.moved === false)) {
            filteredOptions.push([poly.name, poly.uuid]);
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

      const code = `polygen.setMoveable(${value_entity}, ${value_movable})`;
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
      var code = "_G.polygen.set_moveable(" + value_entity + ", " + value_movable + ")";
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