import EventType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "system_task",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["TASK_SYSTEM_TASK"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "Input",
          inputsInline: true,
          check: "String",
        },
        {
          type: "input_value",
          name: "Parameter",
          check: "Parameter",
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
      const input = generator.valueToCode(block, "Input", generator.ORDER_NONE);
      const parameter = generator.valueToCode(
        block,
        "Parameter",
        generator.ORDER_ATOMIC
      );
      let code: string;
      if (parameter) {
        code = "system.task(" + input + ", " + parameter + ")";
      } else {
        code = "system.task(" + input + ")";
      }
      return [code, generator.ORDER_NONE];
    };
    return javascript;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const input = generator.valueToCode(block, "Input", generator.ORDER_NONE);
      const parameter = generator.valueToCode(
        block,
        "Parameter",
        generator.ORDER_ATOMIC
      );
      let code: string;
      if (parameter) {
        code = "_G.system.task(" + input + ", " + parameter + ")";
      } else {
        code = "_G.system.task(" + input + ")";
      }
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
