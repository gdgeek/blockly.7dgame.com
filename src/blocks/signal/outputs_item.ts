import EventType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "output_signal_item",
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
    return {
      type: EventType.name,
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["SIGNAL_OUTPUT_SIGNAL_ITEM"]?.[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Output",
          options: function (): [string, string][] {
            const opt: [string, string][] = [
              ["none", JSON.stringify({ index: "", uuid: "" })],
            ];
            if (resource && resource.events && resource.events.outputs) {
              resource.events.outputs.forEach(({ title, index, uuid }) => {
                opt.push([title, JSON.stringify({ index, uuid })]);
              });
            }
            return opt;
          },
        },
      ],
      output: null,
      colour: EventType.colour,
      tooltip: "",
      helpUrl: "",
    };
  },

  getBlock(parameters: unknown): object {
    const data = {
      init(this: { jsonInit: (json: object) => void }) {
        this.jsonInit(block.getBlockJson!(parameters));
      },
    };
    return data;
  },

  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const data = JSON.parse(block.getFieldValue("Output"));
      return [JSON.stringify(data), generator.ORDER_ATOMIC];
    };
    return script;
  },

  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const data = JSON.parse(block.getFieldValue("Output"));
      return [`{'${data.index}', '${data.uuid}' }`, generator.ORDER_ATOMIC];
    };
    return lua;
  },

  toolbox: {
    kind: "block",
    type: "output_signal_item",
  },
};

export default block;
