import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "action_execute",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.TRIGGER_ACTION_EXECUTE[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Action",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.action) {
              const action = resource.action;
              action.forEach(({ name, uuid }) => {
                opt.push([name, uuid]);
              });
            }
            return opt;
          },
        },
        {
          type: "input_value",
          name: "content",
          check: "Task",
        },
      ],
      inputsInline: true,
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
      var statements_content = generator.valueToCode(
        block,
        "content",
        Blockly.JavaScript.ORDER_NONE
      );

      var dropdown_option = block.getFieldValue("Action");
      var execute = "  task.execute(" + statements_content + ")\n";
      var code =
        "meta['@" +
        dropdown_option +
        "'] = function(parameter) {\n" +
        execute +
        "}\n";

      return code;
    };
    return javascript;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var statements_content = generator.valueToCode(
        block,
        "content",
        Blockly.Lua.ORDER_NONE
      );

      var dropdown_option = block.getFieldValue("Action");
      var execute = "  _G.task.execute(" + statements_content + ")\n";
      var code =
        "meta['@" +
        dropdown_option +
        "'] = function(parameter) \n  " +
        execute +
        "end\n";

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
