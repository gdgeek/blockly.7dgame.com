import DataType from "./type";
import { Handler } from "../helper";
import { HandlerJS } from "../helperJS";
import * as Blockly from "blockly";

const data = {
  name: "sound_entity",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.SOUND_SOUND[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Sound",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.sound) {
              const sound = resource.sound;
              sound.forEach(({ name, uuid }) => {
                opt.push([name, uuid]);
              });
            }

            return opt;
          },
        },
      ],
      output: "Sound",
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
      var dropdown = block.getFieldValue("Sound");
      return [HandlerJS(dropdown), generator.ORDER_NONE];
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var dropdown = block.getFieldValue("Sound");

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
