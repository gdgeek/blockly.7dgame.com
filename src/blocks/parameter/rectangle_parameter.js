import * as Blockly from "blockly";
import EventType from "./type";
import * as Helper from "../helper";
const data = {
  name: "rectangle_parameter",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(parameters) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.PARAMETER_RECTANGLE[window.lg],
      args0: [
        {
          type: "input_dummy",
        },
        {
          type: "input_value",
          name: "Anchor",
          check: "Parameter",
        },
        {
          type: "field_number",
          name: "Radius",
          value: 0.2,
          precision: 0.01,
        },
      ],
      inputsInline: true,
      output: "Parameter",
      colour: 230,
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
      var value_anchor = generator.valueToCode(
        block,
        "Anchor",
        generator.ORDER_ATOMIC
      );

      var number_radius = block.getFieldValue("Radius");
      var code = `Helper.Range(${value_anchor}, ${number_radius})\n`;

      return [code, generator.ORDER_NONE];
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var value_anchor = generator.valueToCode(
        block,
        "Anchor",
        generator.ORDER_ATOMIC
      );

      // TODO: Assemble javascript into code variable.

      var number_radius = block.getFieldValue("Radius");
      var code = Helper.Range(value_anchor, number_radius);
      // TODO: Change ORDER_NONE to the correct strength.

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
