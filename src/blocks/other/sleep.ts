import DataType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "sleep",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: data.name,
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["OTHER_SLEEP"][window.lg],
      args0: [
        {
          type: "field_number",
          name: "time",
          value: 0.3,
          min: 0,
          max: 1000,
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
  getBlock(parameters: unknown): object {
    return {
      init: function (this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, _generator: BlocklyGenerator): string {
      const time = block.getFieldValue("time");
      const code = `helper.sync_sleep(${time})\n`;
      return code;
    };
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, _generator: BlocklyGenerator): string {
      const time = block.getFieldValue("time");
      return "_G.helper.sync_sleep(" + time + ")\n";
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
