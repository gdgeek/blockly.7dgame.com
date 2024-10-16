import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "play_animation_task",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.TASK_PLAY_ANIMATION_TASK[window.lg],
      args0: [
        {
          type: "input_value",
          name: "animation",
          check: "Animation",
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
  getJavascript(parameters) {
    return this.getLua(parameters);
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var animation = generator.valueToCode(
        block,
        "animation",
        generator.ORDER_NONE
      );
      var code = "_G.animation.play_task(" + animation + ")\n";
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
