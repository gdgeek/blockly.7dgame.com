import EventType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "game_reset",
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
      )["GAME_RESET"][window.lg],
      previousStatement: null,
      nextStatement: null,
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
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (
      _block: BlocklyBlock,
      _generator: BlocklyGenerator
    ): string {
      const code = `managers.game_reset(parameter);\n`;
      return code;
    };
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (
      _block: BlocklyBlock,
      _generator: BlocklyGenerator
    ): string {
      const code = `_G.managers.game_reset(parameter)\n`;
      return code;
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
