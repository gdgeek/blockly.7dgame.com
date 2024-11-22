import DataType from "./type";
import * as Blockly from "blockly";
import { Handler } from "../helper";
import { HandlerJS } from "../helperJS";
const data = {
  name: "picture_entity",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.PICTURE_PICTURE[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Picture",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.picture) {
              const picture = resource.picture;
              picture.forEach((pic) => {
                opt.push([pic.name, pic.uuid]);
              });
            }

            return opt;
          },
        },
      ],
      output: "Picture",
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
      var dropdown = block.getFieldValue("Picture");
      return [HandlerJS(dropdown), generator.ORDER_NONE];
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var dropdown = block.getFieldValue("Picture");

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
