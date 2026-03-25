import EventType from "./type";
import * as Helper from "../helper";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "player_parameter",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["PARAMETER_PLAYER"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "PlayerType",
          options: [
            [
              (
                Blockly.Msg as unknown as Record<string, Record<string, string>>
              )["PARAMETER_PLAYER_OPTIONS_INDEX"][window.lg],
              "index",
            ],
            ["Id", "id"],
            [
              (
                Blockly.Msg as unknown as Record<string, Record<string, string>>
              )["PARAMETER_PLAYER_OPTIONS_SERVER"][window.lg],
              "server",
            ],
            [
              (
                Blockly.Msg as unknown as Record<string, Record<string, string>>
              )["PARAMETER_PLAYER_OPTIONS_RANDOM_CLIENT"][window.lg],
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
  getBlock(parameters: unknown): object {
    return {
      init: function (this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    return function (
      _block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const type = _block.getFieldValue("PlayerType");
      const id = generator.valueToCode(
        _block,
        "Player",
        generator.ORDER_ATOMIC
      );
      return [Helper.PlayerJS(type, id), generator.ORDER_NONE];
    };
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    return function (
      _block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const type = _block.getFieldValue("PlayerType");
      const id = generator.valueToCode(
        _block,
        "Player",
        generator.ORDER_ATOMIC
      );
      return [Helper.Player(type, id), generator.ORDER_NONE];
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
