import * as Blockly from "blockly";
import DataType from "./type";
import { Handler } from "../helper";

const data = {
  name: "video_entity",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.VIDEO_VIDEO[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Video",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.video) {
              const video = resource.video;
              video.forEach(({ name, uuid }) => {
                opt.push([name, uuid]);
              });
            }

            return opt;
          },
        },
      ],
      output: "Video",
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
      var dropdown_polygen = block.getFieldValue("Video");
      return [
        `handleVideo(${JSON.stringify(dropdown_polygen)})`,
        generator.ORDER_NONE,
      ];
    };
    return script;
  },
  getLua({ index }) {
    const lua = function (block, generator) {
      var dropdown = block.getFieldValue("Video");

      return [Handler(dropdown), generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
