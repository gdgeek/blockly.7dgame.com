import EventType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "init_signal",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: data.name,
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["SIGNAL_INIT_SIGNAL"][window.lg],
      args0: [
        {
          type: "input_dummy",
        },
        {
          type: "input_statement",
          name: "content",
        },
      ],
      colour: EventType.colour,
      tooltip: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["SIGNAL_INIT_SIGNAL_TOOLTIP"][window.lg],
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
    const script = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const statements_content = generator.statementToCode(block, "content");

      const code = `verse['#init'] = async function(parameter) {
        let isPlaying = true;
        console.log('#init');
        ${statements_content}
        isPlaying = false;
      }
      `;

      return code;
    };
    return script;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const statements_content = generator.statementToCode(block, "content");

      const code =
        "verse['#init'] = function(parameter) \n\
  is_playing = true\n\
  print('init')\n" +
        statements_content +
        "  is_playing = false\n\
end\n";

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
