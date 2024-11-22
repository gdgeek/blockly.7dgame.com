import TriggerType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "update_trigger",
};
const block = {
  title: data.name,
  type: TriggerType.name,
  colour: TriggerType.colour,
  getBlock(parameters) {
    const block = {
      init: function () {
        this.jsonInit({
          type: data.name,
          message0: Blockly.Msg.TRIGGER_UPDATE[window.lg],
          args0: [
            {
              type: "input_dummy",
            },
            {
              type: "input_statement",
              name: "content",
            },
          ],
          colour: TriggerType.colour,
          tooltip: "",
          helpUrl: "",
        });
      },
    };
    return block;
  },
  getJavascript(parameters) {
    const script = function (block, generator) {
      const statements_content = generator.statementToCode(block, "content");
      const code = `
  meta['@update'] = function(interval) {
    console.log('@update');
    ${statements_content}
  };
  `;
      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var statements_content = generator.statementToCode(block, "content");
      // TODO: Assemble Lua into code variable.
      var code =
        "meta['@update'] = function(interval) \n\
  print('@update')\n" +
        statements_content +
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
