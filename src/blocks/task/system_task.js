import EventType from "./type";
import * as Blockly from "blockly";
const data = {
  name: "system_task",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(parameters) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.TASK_SYSTEM_TASK[window.lg],
      args0: [
        {
          type: "input_value",
          name: "Input",
          inputsInline: true,
          check: "String",
        },
        {
          type: "input_value",
          name: "Parameter",
          check: "Parameter",
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
      var input = generator.valueToCode(block, "Input", generator.ORDER_NONE);
      var parameter = generator.valueToCode(
        block,
        "Parameter",
        generator.ORDER_ATOMIC
      );
      var code = null;
      if (parameter) {
        code = "system.task(" + input + ", " + parameter + ");";
      } else {
        code = "system.task(" + input + ");";
      }

      return [code, generator.ORDER_NONE];
    };
    return javascript;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var input = generator.valueToCode(block, "Input", generator.ORDER_NONE);
      var parameter = generator.valueToCode(
        block,
        "Parameter",
        generator.ORDER_ATOMIC
      );

      var code = null;
      if (parameter) {
        code = "_G.system.task(" + input + ", " + parameter + ")";
      } else {
        code = "_G.system.task(" + input + ")";
      }

      return [code, Blockly.Lua.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
