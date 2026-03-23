import TriggerType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "init_trigger",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: TriggerType.name,
  colour: TriggerType.colour,
  getBlock(_parameters: unknown): object {
    const block = {
      init: function (this: { jsonInit: (json: object) => void }) {
        this.jsonInit({
          type: data.name,
          message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["TRIGGER_INIT"][window.lg],
          args0: [
            {
              type: "input_dummy",
            },
            {
              type: "input_statement",
              name: "content",
            },
          ],
          colour: TriggerType.colour,
          tooltip: "",
          helpUrl: "",
        });
      },
    };
    return block;
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const statements_content = generator.statementToCode(block, "content");
      const code = `
meta['@init'] = async function() {
  console.log('@init');
  ${statements_content}
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
        "meta['@init'] = function() \n\
    print('@init')\n" +
        statements_content +
        "end\n";
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
