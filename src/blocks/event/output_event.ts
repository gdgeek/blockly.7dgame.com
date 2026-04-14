import EventType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "output_event",
} as const;

interface EventOutput {
  title: string;
  uuid: string;
}

interface BlockParameters {
  resource?: {
    events?: {
      outputs?: EventOutput[];
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
      )["EVENT_OUTPUT"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Output",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.events && resource.events.outputs) {
              const output = resource.events.outputs;
              output.forEach(({ title, uuid }) => {
                opt.push([title, uuid]);
              });
            }
            return opt;
          },
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: EventType.colour,
      tooltip: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["EVENT_OUTPUT_TOOLTIP"][window.lg],
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
      _generator: BlocklyGenerator
    ): string {
      const output_event = block.getFieldValue("Output");
      const code = `event.trigger(index, '${output_event}', parameter);`;
      return code;
    };
    return script;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (
      block: BlocklyBlock,
      _generator: BlocklyGenerator
    ): string {
      const output_event = block.getFieldValue("Output");
      const code =
        "_G.event.trigger(index,'" + output_event + "', parameter)\n";
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
