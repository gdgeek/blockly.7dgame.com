import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "set_text",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.TEXT_SET[window.lg],
      args0: [
        {
          type: "input_value",
          name: "text",
          check: "Text",
        },
        {
          type: "field_multilinetext",
          name: "value",
          text: "default",
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
    const js = function (block, generator) {
      var value = block.getFieldValue("value");
      var text = generator.valueToCode(block, "text", generator.ORDER_NONE);
      var code = `text.setText(${text}, ${JSON.stringify(value)});\n`;
      return code;
    };
    return js;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var value = block.getFieldValue("value");
      var text = generator.valueToCode(block, "text", generator.ORDER_NONE);
      // TODO: Assemble Lua into code variable.
      var code =
        "_G.text.set_text(" + text + "," + JSON.stringify(value) + ")\n";
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
