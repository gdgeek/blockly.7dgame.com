import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "play_video",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.VIDEO_PLAY[window.lg],
      args0: [
        {
          type: "input_value",
          name: "video",
          check: "Video",
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
      var video = generator.valueToCode(block, "video", generator.ORDER_NONE);
      // 检查是否在 action_trigger 中调用
      var isInActionTrigger =
        block.getSurroundParent() &&
        block.getSurroundParent().type === "action_trigger";
      var code = `await video.play(${video}${
        isInActionTrigger ? ", true" : ""
      });\n`;
      return code;
    };
    return script;
  },

  getLua(parameters) {
    const lua = function (block, generator) {
      var video = generator.valueToCode(block, "video", generator.ORDER_NONE);
      return "_G.video.play(" + video + ")\n";
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
