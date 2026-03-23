import * as Blockly from "blockly";
import LogType from "./type";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "log_reset_uuid",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: LogType.name,
  colour: LogType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = (parameters ?? {}) as { resource?: unknown };
    return {
      type: LogType.name,
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["LOG_RESET_UUID"][window.lg],
      args0: [],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: LogType.colour,
      tooltip: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["LOG_RESET_UUID"][window.lg],
      helpUrl: "",
    };
  },
  getBlock(parameters: unknown): object {
    return {
      init: function (this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (_block: BlocklyBlock, _generator: BlocklyGenerator): string {
      const code = `log.resetUuid();\n`;
      return code;
    };
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (_block: BlocklyBlock, _generator: BlocklyGenerator): string {
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
