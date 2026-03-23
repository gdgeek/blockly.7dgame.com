import EventType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "run_task",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["META_RUN"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "content",
          check: "Task",
        },
      ],
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
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const statements_content = generator.valueToCode(
        block,
        "content",
        (generator as unknown as { ORDER_NONE: number }).ORDER_NONE
      );
      const code = `await task.execute(${statements_content});\n`;
      return code;
    };
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const statements_content = generator.valueToCode(
        block,
        "content",
        (generator as unknown as { ORDER_NONE: number }).ORDER_NONE
      );
      const execute = "_G.task.execute(" + statements_content + ")\n";
      return execute;
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
