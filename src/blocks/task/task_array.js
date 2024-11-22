import EventType from "./type";
import * as Blockly from "blockly";
const data = {
  name: "task_array",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(parameters) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.TASK_ARRAY[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "ArrayType",
          options: [
            ["list", "LIST"],
            ["set", "SET"],
          ],
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
    const javascript = function (block, generator) {
      const type = block.getFieldValue("ArrayType");
      const array = generator.valueToCode(
        block,
        "TaskArray",
        generator.ORDER_ATOMIC
      );

      const code = `task.array("${type}", ${array});\n`;

      return [code, generator.ORDER_NONE];
    };
    return javascript;
  },

  getLua() {
    const lua = function (block, generator) {
      const type = block.getFieldValue("ArrayType");
      const array = generator.valueToCode(
        block,
        "TaskArray",
        generator.ORDER_ATOMIC
      );

      const code = `_G.task.array("${type}", ${array})\n`;

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
