import EventType from "./type";
import * as Helper from "../helper";
import * as HelperJS from "../helperJS";
import * as Blockly from "blockly";
const data = {
  name: "player_parameter",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.PARAMETER_PLAYER[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "PlayerType",
          options: [
            [Blockly.Msg.PARAMETER_PLAYER_OPTIONS_INDEX[window.lg], "index"],
            ["Id", "id"],
            [Blockly.Msg.PARAMETER_PLAYER_OPTIONS_SERVER[window.lg], "server"],
            [
              Blockly.Msg.PARAMETER_PLAYER_OPTIONS_RANDOM_CLIENT[window.lg],
              "random_client",
            ],
          ],
        },
        {
          type: "input_value",
          name: "Player",
          check: "Number",
        },
      ],
      inputsInline: true,
      output: "Parameter",
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
      var type = block.getFieldValue("PlayerType");
      var id = generator.valueToCode(block, "Player", generator.ORDER_ATOMIC);
      return [HelperJS.PlayerJS(type, id), generator.ORDER_NONE];
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var type = block.getFieldValue("PlayerType");

      var id = generator.valueToCode(block, "Player", generator.ORDER_ATOMIC);

      return [Helper.Player(type, id), generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
