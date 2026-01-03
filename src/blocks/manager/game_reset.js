import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "game_reset",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.GAME_RESET[window.lg],

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
      var code = `managers.game_reset(parameter);\n`;
      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var code = `_G.managers.game_reset(parameter)\n`;
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
