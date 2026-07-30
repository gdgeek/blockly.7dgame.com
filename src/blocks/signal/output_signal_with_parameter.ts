import EventType from "./type";
import * as Blockly from "blockly";
import {
  parseSignalReference,
  quoteJavaScriptString,
  quoteLuaString,
  type BlockDefinition,
  type BlocklyBlock,
  type BlocklyGenerator,
} from "../helper";

const data = {
  name: "output_signal_with_parameter",
} as const;

interface SignalOutput {
  title: string;
  index: string;
  uuid: string;
}

interface BlockParameters {
  resource?: {
    events?: {
      outputs?: SignalOutput[];
    };
  };
}

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as BlockParameters;
    const json = {
      type: "block_type",
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["SIGNAL_OUTPUT_SIGNAL_WITH_PARAMETER"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Output",
          options: function (): [string, string][] {
            const opt: [string, string][] = [
              ["none", JSON.stringify({ index: "", uuid: "" })],
            ];
            if (resource && resource.events && resource.events.outputs) {
              const output = resource.events.outputs;
              output.forEach(({ title, index, uuid }) => {
                opt.push([title, JSON.stringify({ index, uuid })]);
              });
            }
            return opt;
          },
        },
        {
          type: "input_value",
          name: "Parameter",
          check: "Parameter",
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
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const data = parseSignalReference(block.getFieldValue("Output"));
      const parameter =
        generator.valueToCode(block, "Parameter", generator.ORDER_ATOMIC) ||
        "undefined";

      const code = `event.signal(${quoteJavaScriptString(
        data.index
      )}, ${quoteJavaScriptString(data.uuid)}, ${parameter});\n`;
      return code;
    };
    return script;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const data = parseSignalReference(block.getFieldValue("Output"));
      const parameter =
        generator.valueToCode(block, "Parameter", generator.ORDER_ATOMIC) ||
        "nil";
      const code = `_G.event.signal(${quoteLuaString(
        data.index
      )}, ${quoteLuaString(data.uuid)}, ${parameter})\n`;
      return code;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
