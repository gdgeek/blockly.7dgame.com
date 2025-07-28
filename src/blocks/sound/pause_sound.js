import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "pause_sound",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,

  getBlockJson(parameters) {
    const json = {
      type: "pause_sound", // 唯一type标识
      message0: Blockly.Msg.SOUND_PAUSE[window.lg], // 多语言文本
      args0: [
        {
          type: "input_value",
          name: "sound",
          check: "Sound",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },

  getBlock(parameters) {
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
      const sound = generator.valueToCode(block, "sound", generator.ORDER_NONE);
      const code = `${sound}.pause();\n`;
      return code;
    };
    return script;
  },

  getLua(parameters) {
    const lua = function (block, generator) {
      const sound = generator.valueToCode(block, "sound", generator.ORDER_NONE);
      return "_G.sound.pause(" + sound + ")\n";
    };
    return lua;
  },

  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;