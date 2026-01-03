import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "game_add_score",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.GAME_ADD_SCORE[window.lg],
      args0: [
        {
          type: "field_number",
          name: "Score",
          value: 1,
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
      var score = block.getFieldValue("Score");
      var code = `managers.game_add_score(${score}, parameter);\n`;
      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var score = block.getFieldValue("Score");
      var code = `_G.managers.game_add_score(${score}, parameter)\n`;
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
