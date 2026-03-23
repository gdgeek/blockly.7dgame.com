import * as Blockly from "blockly";
import LogType from "./type";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "log_key_value",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: LogType.name,
  colour: LogType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = (parameters ?? {}) as { resource?: unknown };
    return {
      type: LogType.name,
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["LOG_KEY_VALUE"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "DATATYPE",
          options: [
            [(Blockly.Msg as unknown as Record<string, Record<string, string>>)["LOG_RECORD"][window.lg], "record"],
            [(Blockly.Msg as unknown as Record<string, Record<string, string>>)["LOG_WARNING"][window.lg], "warning"],
            [(Blockly.Msg as unknown as Record<string, Record<string, string>>)["LOG_ERROR"][window.lg], "error"],
          ],
        },
        {
          type: "field_input",
          name: "KEY",
          text: "log_key",
        },
        {
          type: "input_value",
          name: "VALUE",
          check: ["String", "Number", "Boolean", "Variable"],
        },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: LogType.colour,
      tooltip: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["LOG_KEY_VALUE_TOOLTIP"][window.lg],
      helpUrl: "",
    };
  },
  getBlock(parameters: unknown): object {
    return {
      init: function (this: { jsonInit: (json: object) => void; getField: (name: string) => { setValidator: (fn: (newValue: string) => string) => void } | null }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);

        const keyField = this.getField("KEY");
        if (keyField) {
          keyField.setValidator(function (newValue: string): string {
            return newValue.replace(/[^a-zA-Z0-9_\-.~]/g, "");
          });
        }
      },
    };
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const dataType = block.getFieldValue("DATATYPE");
      const key = block.getFieldValue("KEY");
      const value =
        generator.valueToCode(block, "VALUE", generator.ORDER_ATOMIC) || "''";

      const code = `log.post("${dataType}", "${key}", String(${value}));\n`;
      return code;
    };
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const dataType = block.getFieldValue("DATATYPE");
      const key = block.getFieldValue("KEY");
      const value =
        generator.valueToCode(block, "VALUE", generator.ORDER_ATOMIC) || "''";

      const code = `log.post("${dataType}", "${key}", tostring(${value}))\n`;
      return code;
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
