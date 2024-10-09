import EventType from "./type";
import * as Blockly from "blockly";
const data = {
  name: "task_circle",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.TASK_CIRCLE[window.lg],
      args0: [
        {
          type: "field_number",
          name: "Times",
          value: "0",
          precision: 1,
          min: 0,
          max: 100,
        },
        {
          type: "input_value",
          name: "TaskArray",
          check: "Array",
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
    return this.getLua(parameters);
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      // var type = block.getFieldValue('ArrayType')
      var number_times = block.getFieldValue("Times");
      var array = generator.valueToCode(
        block,
        "TaskArray",
        generator.ORDER_ATOMIC
      );

      var code = "_G.task.circle(" + number_times + "," + array + ")\n";

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
