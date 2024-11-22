import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "init_signal",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.SIGNAL_INIT_SIGNAL[window.lg],
      args0: [
        {
          type: "input_dummy",
        },
        {
          type: "input_statement",
          name: "content",
        },
      ],
      colour: EventType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters) {
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
      var statements_content = generator.statementToCode(block, "content");

      var code =
        "function init(parameter) {\n" +
        "  let isPlaying = true;\n" +
        "  console.log('init');\n" +
        statements_content +
        "  isPlaying = false;\n" +
        "}\n";

      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var statements_content = generator.statementToCode(block, "content");

      var code =
        "verse['#init'] = function(parameter) \n\
  is_playing = true\n\
  print('init')\n" +
        statements_content +
        "  is_playing = false\n\
end\n";

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
