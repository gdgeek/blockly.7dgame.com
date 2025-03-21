import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "task-tween-to-data",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.TASK_TWEEN_TO_DATA[window.lg],
      args0: [
        {
          type: "input_value",
          name: "From",
          check: "Point",
        },
        {
          type: "input_value",
          name: "Transform",
          check: "Transform",
        },
        {
          type: "field_number",
          name: "Time",
          value: 0.03,
        },
        {
          type: "input_dummy",
        },
        {
          type: "field_dropdown",
          name: "Easy",
          options: [
            ["LINEAR", "LINEAR"],
            ["EASE_IN", "EASE_IN"],
            ["EASE_OUT", "EASE_OUT"],
            ["EASE_IN_OUT", "EASE_IN_OUT"],
            ["BOUNCE_IN", "BOUNCE_IN"],
            ["BOUNCE_OUT", "BOUNCE_OUT"],
            ["BOUNCE_IN_OUT", "BOUNCE_IN_OUT"],
          ],
        },
      ],
      inputsInline: true,
      output: "Task",
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
    const js = function (block, generator) {
      var time = block.getFieldValue("Time");
      var easy = block.getFieldValue("Easy");

      var from = generator.valueToCode(block, "From", generator.ORDER_ATOMIC);
      var transform = generator.valueToCode(
        block,
        "Transform",
        generator.ORDER_ATOMIC
      );

      var code =
        "tween.to_data(" +
        from +
        ", " +
        transform +
        ", " +
        time +
        ', "' +
        easy +
        '")';
      return [code, generator.ORDER_NONE];
    };
    return js;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var time = block.getFieldValue("Time");
      var easy = block.getFieldValue("Easy");

      var from = generator.valueToCode(block, "From", generator.ORDER_ATOMIC);

      var transform = generator.valueToCode(
        block,
        "Transform",
        generator.ORDER_ATOMIC
      );

      var code =
        "_G.tween.to_data(" +
        from +
        ", " +
        transform +
        ", " +
        time +
        ', "' +
        easy +
        '")';
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
