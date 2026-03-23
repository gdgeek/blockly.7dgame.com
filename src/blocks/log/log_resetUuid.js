import * as Blockly from "blockly";
import LogType from "./type";

const data = {
  name: "log_reset_uuid",
};

const block = {
  title: data.name,
  type: LogType.name,
  colour: LogType.colour,
  getBlockJson({ resource }) {
    return {
      type: LogType.name,
      message0: Blockly.Msg.LOG_RESET_UUID[window.lg],
      args0: [],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: LogType.colour,
      tooltip: Blockly.Msg.LOG_RESET_UUID[window.lg],
      helpUrl: "",
    };
  },
  getBlock: function (parameters) {
    return {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
      },
    };
  },
  getJavascript(parameters) {
    return function (block, generator) {
      let code = `log.resetUuid();\n`;
      return code;
    };
  },
  getLua(parameters) {
    return function (block, generator) {
      const code = `log.resetUuid()\n`;
      return code;
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
