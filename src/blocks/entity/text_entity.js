import DataType from "./type";
import Helper from "../helper";

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
      message0: "文本 %1",
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
      output: "Point",
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
      var dropdown = block.getFieldValue("Text");
      // TODO: Assemble Lua into code variable.
      // var code = "CS.MLua.Handler('" + index + "', '" + dropdown_text + "')"
      // TODO: Change ORDER_NONE to the correct strength.
      return [Helper.handler(dropdown), Blockly.Lua.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
