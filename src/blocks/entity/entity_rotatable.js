import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "entity_rotatable",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.ENTITY_ROTATABLE[window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Entity"],
        },
        {
          type: "input_value",
          name: "rotatable",
          check: "Boolean",
        },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "设置节点是否自旋转",
      helpUrl: "",
    };
    return json;
  },

  getBlock(parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);

        // 自动更新可选模型（包含 RotateComponent 的实体）
        this.setOnChange((event) => {
          if (
            event.type === Blockly.Events.BLOCK_CHANGE ||
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.BLOCK_MOVE
          ) {
            this.updateEntityOptions(parameters.resource);
          }
        });
      },

      // 更新实体选项
      updateEntityOptions: function (resource) {
        if (!resource || !resource.entity) return;

        // 查找当前连接的实体块
        const entityBlock = this.getInputTargetBlock("entity");
        if (!entityBlock || entityBlock.type !== "entity") return;

        // 筛选实体列表 - 只显示自旋转的实体(rotate为true)
        const filteredOptions = [["none", ""]];
        resource.entity.forEach((entity) => {
          // 只筛选 rotate 属性为 true 的实体
          if (entity.rotate === true) {
            filteredOptions.push([entity.name, entity.uuid]);
          }
        });

        // 使用公共方法更新下拉选项
        if (typeof entityBlock.updateDropdownOptions === "function") {
          entityBlock.updateDropdownOptions(filteredOptions);
        }
      },
    };

    return data;
  },

  getJavascript(parameters) {
    return function (block, generator) {
      const value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      const value_rotatable = generator.valueToCode(
        block,
        "rotatable",
        generator.ORDER_ATOMIC
      );

      return `point.setRotatable(${value_entity}, ${value_rotatable})\n`;
    };
  },

  getLua(parameters) {
    return function (block, generator) {
      const value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      const value_rotatable = generator.valueToCode(
        block,
        "rotatable",
        generator.ORDER_ATOMIC
      );

      return `_G.point.set_rotatable(${value_entity}, ${value_rotatable})\n`;
    };
  },

  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
