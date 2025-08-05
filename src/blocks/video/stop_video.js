import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "stop_video",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.VIDEO_STOP[window.lg],
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
  getBlock(parameters) {
    return {
      init() {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
      },
    };
  },
  getJavascript(parameters) {
    return function (block, generator) {
      const video = generator.valueToCode(block, "video", generator.ORDER_NONE);
      return `await video.stop(${video});\n`;
    };
  },
  getLua(parameters) {
    return function (block, generator) {
      const video = generator.valueToCode(block, "video", generator.ORDER_NONE);
      return `_G.video.stop(${video})\n`;
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;