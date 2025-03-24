import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "visual_tooltip",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({}) {
    const json = {
      type: "block_type",
      message0: "节点 %1 的 tooltip 显示/隐藏 %2",
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Point", "Polygen", "Picture", "Video", "Text"],
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
      tooltip: "Show or hide tooltip on a specific point",
      helpUrl: "",
    };
    return json;
  },
  getBlock: function (parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
      },
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
      const code = `_G.point.set_tooltip_visual(${value_entity}, ${value_bool})\n`;
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