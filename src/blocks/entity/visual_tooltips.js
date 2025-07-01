import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "visual_tooltips",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({}) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.TOOLTIPS_VISUAL[window.lg],
      args0: [
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
      tooltip: "Show or hide label on all points",
      helpUrl: "",
    };
    return json;
  },
  getBlock: function (parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
        console.log("resource", parameters.resource);

        this.tooltipsEntities = [];

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
        
        // 筛选模型列表 - 只显示含tooltip的实体
        const filteredOptions = [["none", ""]];
        this.tooltipsEntities = [];
        
        resource.entity.forEach((entity) => {
          // 只筛选 hasTooltips 属性为 true 的模型
          if (entity.hasTooltips === true) {
            filteredOptions.push([entity.name, entity.uuid]);
            this.tooltipsEntities.push(entity.uuid); // 保存UUID
          }
        });
      }
    };
    return data;
  },
  getJavascript(parameters) {
    const script = function (block, generator) {
      const value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      const tooltipsEntities = block.tooltipsEntities || [];
      let code;
      if (tooltipsEntities.length > 0) {
        const handlerCalls = tooltipsEntities.map(uuid => 
          `handleEntity("${uuid}")`
        ).join(',\n    ');
        code = `point.setTooltipsVisual(` + "{" + handlerCalls + "}, " + value_bool + ")\n";
      } else {
        code = `point.setTooltipsVisual(handleEntity(""), ${value_bool})\n`;
      }
      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      const tooltipsEntities = block.tooltipsEntities || [];
      let code;
      if (tooltipsEntities.length > 0) {
        const handlerCalls = tooltipsEntities.map(uuid => 
          `_G.helper.handler(index, '${uuid}')`
        ).join(',\n  ');
        code = "_G.point.set_tooltips_visual(" + "{\n  " + handlerCalls + "\n}, " + value_bool + ")\n";
      } else {
        code = "_G.point.set_tooltips_visual(_G.helper.handler(index, '')," + value_bool + ")\n";
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
