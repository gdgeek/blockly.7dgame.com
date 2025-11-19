import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "set_viseme_clip",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0:  Blockly.Msg.POLYGEN_SET_VISEME_CLIP[window.lg],
      args0: [
        {
          type: "input_value",
          name: "polygen",
          check: "Polygen",
        },
        {
          type: "input_value",
          name: "sound",
          check: "Sound",
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
    return {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
      },
    };
  },
  getJavascript(parameters) {
    const javascript = function (block, generator) {
      const value_sound = generator.valueToCode(block, "sound", generator.ORDER_NONE);
      const value_polygen = generator.valueToCode(block, "polygen", generator.ORDER_NONE);
      const code = `polygen.setVisemeClip(${value_polygen}, ${value_sound});\n`;
      return code;
    };
    return javascript;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      const value_sound = generator.valueToCode(block, "sound", generator.ORDER_NONE);
      const value_polygen = generator.valueToCode(block, "polygen", generator.ORDER_NONE);
      const code = `_G.polygen.set_viseme_clip(${value_polygen}, ${value_sound})\n`;
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