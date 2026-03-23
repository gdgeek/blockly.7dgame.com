import EventType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "task-tween",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["TASK_TWEEN_OBJECT"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "From",
          check: "Entity",
        },
        {
          type: "input_value",
          name: "To",
          check: "Entity",
        },
        {
          type: "input_value",
          name: "Time",
          check: "Number",
        },
        {
          type: "input_dummy",
        },
        {
          type: "field_dropdown",
          name: "Easy",
          options: [
            ["LINEAR", "LINEAR"],
            ["EASE_IN", "EASE_IN"],
            ["EASE_OUT", "EASE_OUT"],
            ["EASE_IN_OUT", "EASE_IN_OUT"],
            ["BOUNCE_IN", "BOUNCE_IN"],
            ["BOUNCE_OUT", "BOUNCE_OUT"],
            ["BOUNCE_IN_OUT", "BOUNCE_IN_OUT"],
          ],
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
      const time = generator.valueToCode(block, "Time", generator.ORDER_NONE);
      const easy = block.getFieldValue("Easy");
      const from = generator.valueToCode(block, "From", generator.ORDER_ATOMIC);
      const to = generator.valueToCode(block, "To", generator.ORDER_ATOMIC);
      const code =
        "tween.to_object(" +
        from +
        ", " +
        to +
        ", " +
        time +
        ', "' +
        easy +
        '")';
      return [code, generator.ORDER_NONE];
    };
    return js;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const time = generator.valueToCode(block, "Time", generator.ORDER_NONE);
      const easy = block.getFieldValue("Easy");
      const from = generator.valueToCode(block, "From", generator.ORDER_ATOMIC);
      const to = generator.valueToCode(block, "To", generator.ORDER_ATOMIC);
      const code =
        "_G.tween.to_object(" +
        from +
        ", " +
        to +
        ", " +
        time +
        ', "' +
        easy +
        '")';
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
