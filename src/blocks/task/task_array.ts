import EventType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "task_array",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["TASK_ARRAY"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "ArrayType",
          options: [
            ["list", "LIST"],
            ["set", "SET"],
          ],
        },
        {
          type: "input_value",
          name: "TaskArray",
          check: "Array",
        },
      ],
      inputsInline: true,
      output: "Task",
      colour: EventType.colour,
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
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const javascript = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const type = block.getFieldValue("ArrayType");
      const array = generator.valueToCode(
        block,
        "TaskArray",
        generator.ORDER_ATOMIC
      );
      const code = `task.array("${type}", ${array})\n`;
      return [code, generator.ORDER_NONE];
    };
    return javascript;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const type = block.getFieldValue("ArrayType");
      const array = generator.valueToCode(
        block,
        "TaskArray",
        generator.ORDER_ATOMIC
      );
      const code = `_G.task.array("${type}", ${array})\n`;
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      TaskArray: {
        block: {
          type: "lists_create_with",
        },
      },
    },
  },
};
export default block;
