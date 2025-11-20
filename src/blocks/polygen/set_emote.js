import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "set_emote",
};

function getEmoteOptions() {
  return [
    [Blockly.Msg.POLYGEN_EMOTE_IDLE?.[window.lg] , "Idle"],//默认
    [Blockly.Msg.POLYGEN_EMOTE_ANGER?.[window.lg] , "Anger"],//愤怒
    [Blockly.Msg.POLYGEN_EMOTE_SMIRK?.[window.lg] , "Smirk"],//嘲笑
    [Blockly.Msg.POLYGEN_EMOTE_SMILE?.[window.lg] , "Smile"],//微笑
    [Blockly.Msg.POLYGEN_EMOTE_SAD?.[window.lg] , "Sad"],//悲伤
   // [Blockly.Msg.POLYGEN_EMOTE_DISGUST?.[window.lg] , "Disgust"],//厌恶
  ];
}
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.POLYGEN_SET_EMOTE[window.lg],
      args0: [
        {
          type: "input_value",
          name: "polygen",
          check: "Polygen",
        },
        {
          type: "field_dropdown",
          name: "emote",
          options: getEmoteOptions(),
        },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
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
    const javascript = function (block, generator) {
      const text_emote = block.getFieldValue("emote");
      const value_polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const code = `polygen.setEmote(${value_polygen}, ${JSON.stringify(
        text_emote
      )});\n`;
      return code;
    };
    return javascript;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      const text_emote = block.getFieldValue("emote");
      const value_polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const code = `_G.polygen.set_emote(${value_polygen}, ${JSON.stringify(
        text_emote
      )})\n`;
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