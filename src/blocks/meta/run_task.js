import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "run_task",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.META_RUN[window.lg],
      args0: [
        {
          type: "input_value",
          name: "content",
          check: "Task",
        },
      ],

      previousStatement: null,
      nextStatement: null,
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
      const statements_content = generator.valueToCode(
        block,
        "content",
        generator.ORDER_NONE
      );
      const code = `await task.execute(${statements_content});\n`;
      return code;
    };
    return script;
  },
  getLua({ index }) {
    const lua = function (block, generator) {
      var statements_content = generator.valueToCode(
        block,
        "content",
        generator.ORDER_NONE
      );

      // var dropdown_option = block.getFieldValue('Action')
      var execute = "_G.task.execute(" + statements_content + ")\n";

      return execute;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
