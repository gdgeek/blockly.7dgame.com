import DataType from "./type";
import { Handler } from "../helper";
import { HandlerJS } from "../helperJS";
import * as Blockly from "blockly";

const data = {
  name: "text_entity",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.TEXT_TEXT[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Text",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.text) {
              const text = resource.text;
              text.forEach((t) => {
                opt.push([t.name, t.uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Text",
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
    const javascript = function (block, generator) {
      const dropdown_text = block.getFieldValue("Text");
      const code = `HandlerJS("${dropdown_text}")`;
      return [code, generator.ORDER_NONE];
    };
    return javascript;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var dropdown_text = block.getFieldValue("Text");
      // TODO: Assemble Lua into code variable.
      // var code =
      // TODO: Change ORDER_NONE to the correct strength.
      return [Handler(dropdown_text), generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
