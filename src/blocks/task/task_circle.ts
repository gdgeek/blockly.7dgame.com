import EventType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "task_circle",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["TASK_CIRCLE"][window.lg],
      args0: [
        {
          type: "field_number",
          name: "Times",
          value: "0",
          precision: 1,
          min: 0,
          max: 100,
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
    const js = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const number_times = block.getFieldValue("Times");
      const array = generator.valueToCode(
        block,
        "TaskArray",
        generator.ORDER_ATOMIC
      );
      const code = `task.circle(${number_times}, ${array})\n`;
      return [code, generator.ORDER_NONE];
    };
    return js;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const number_times = block.getFieldValue("Times");
      const array = generator.valueToCode(
        block,
        "TaskArray",
        generator.ORDER_ATOMIC
      );
      const code = "_G.task.circle(" + number_times + "," + array + ")\n";
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
