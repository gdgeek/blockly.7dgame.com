import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "play_sound_task",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.TASK_PLAY_SOUND_TASK[window.lg],
      args0: [
        {
          type: "input_value",
          name: "sound",
          check: "Sound",
        },
      ],
      output: "Task",
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
  // getJavascript(parameters) {
  //   return this.getLua(parameters);
  // },
  getJavascript(parameters) {
    const javascript = function (block, generator) {
      const sound = generator.valueToCode(block, "sound", generator.ORDER_NONE);
      const code = `sound.playTask(${sound})\n`;
      return [code, generator.ORDER_NONE];
    };
    return javascript;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var sound = generator.valueToCode(block, "sound", generator.ORDER_NONE);
      var code = "_G.sound.play_task(" + sound + ")\n";
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
