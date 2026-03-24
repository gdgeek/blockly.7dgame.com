import DataType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "set_text",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["TEXT_SET"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "text",
          check: "Text",
        },
        {
          type: "field_multilinetext",
          name: "value",
          text: "default",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const data = {
      init: function (this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
    return data;
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const js = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const value = block.getFieldValue("value");
      const text = generator.valueToCode(block, "text", generator.ORDER_NONE);
      const code = `text.setText(${text}, ${JSON.stringify(value)});\n`;
      return code;
    };
    return js;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const value = block.getFieldValue("value");
      const text = generator.valueToCode(block, "text", generator.ORDER_NONE);
      const code =
        "_G.text.set_text(" + text + "," + JSON.stringify(value) + ")\n";
      return code;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      text: {
        block: {
          type: "text_entity",
        },
      },
    },
  },
};
export default block;
