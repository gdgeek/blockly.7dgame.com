import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "play_sound_callback",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.SOUND_PLAY[window.lg],
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
      var value_sound = generator.valueToCode(
        block,
        "sound",
        generator.ORDER_NONE
      );
      var code = `const audio = new Audio(${value_sound});\n  audio.play();\n`;
      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var value_sound = generator.valueToCode(
        block,
        "sound",
        generator.ORDER_NONE
      );
      /*
      var statements_callback = Blockly.Lua.statementToCode(
        block,
        'callback',
        Blockly.Lua.ORDER_NONE
      )*/

      //var checkbox_occupy = block.getFieldValue('occupy') === 'TRUE'

      // TODO: Assemble Lua into code variable.
      var code = "CS.MLua.Sound.Play(" + value_sound + ", )\n";
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
