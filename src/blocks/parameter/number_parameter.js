import EventType from "./type";
import * as Helper from "../helper";
import * as HelperJS from "../helperJS";
import * as Blockly from "blockly";
const data = {
  name: "number_parameter",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.PARAMETER_NUMBER[window.lg],
      args0: [
        {
          type: "input_value",
          name: "Input",
          inputsInline: true,
          check: "Number",
        },
      ],
      inputsInline: true,
      output: "Parameter",
      colour: EventType.colour,
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
      var input = generator.valueToCode(block, "Input", generator.ORDER_NONE);
      return [HelperJS.NumberJS(input), generator.ORDER_NONE];
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var input = generator.valueToCode(block, "Input", generator.ORDER_NONE);
      return [Helper.Number(input), generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
