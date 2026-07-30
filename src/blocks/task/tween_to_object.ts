import EventType from "./type";
import * as Blockly from "blockly";
import {
  quoteJavaScriptString,
  quoteLuaString,
  type BlockDefinition,
  type BlocklyBlock,
  type BlocklyGenerator,
} from "../helper";
import { getTweenEasingOptions } from "./tween_easing_options";

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
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["TASK_TWEEN_OBJECT"][window.lg],
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
          options: getTweenEasingOptions(),
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
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const js = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const time =
        generator.valueToCode(block, "Time", generator.ORDER_NONE) || "0";
      const easy = block.getFieldValue("Easy");
      const from =
        generator.valueToCode(block, "From", generator.ORDER_ATOMIC) ||
        "undefined";
      const to =
        generator.valueToCode(block, "To", generator.ORDER_ATOMIC) ||
        "undefined";
      const code =
        "tween.to_object(" +
        from +
        ", " +
        to +
        ", " +
        time +
        ", " +
        quoteJavaScriptString(easy) +
        ")";
      return [code, generator.ORDER_FUNCTION_CALL];
    };
    return js;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const time =
        generator.valueToCode(block, "Time", generator.ORDER_NONE) || "0";
      const easy = block.getFieldValue("Easy");
      const from =
        generator.valueToCode(block, "From", generator.ORDER_ATOMIC) || "nil";
      const to =
        generator.valueToCode(block, "To", generator.ORDER_ATOMIC) || "nil";
      const code =
        "_G.tween.to_object(" +
        from +
        ", " +
        to +
        ", " +
        time +
        ", " +
        quoteLuaString(easy) +
        ")";
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      From: {
        block: {
          type: "entity",
        },
      },
      To: {
        block: {
          type: "entity",
        },
      },
      Time: {
        block: {
          type: "math_number",
          fields: {
            NUM: 0,
          },
        },
      },
    },
  },
};
export default block;
