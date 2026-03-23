import TriggerType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "meta_action",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: TriggerType.name,
  colour: TriggerType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as { resource?: { action?: { name: string; uuid: string }[] } };
    const json = {
      type: data.name,
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["META_ACTION"][window.lg] + "!",
      args0: [
        {
          type: "field_dropdown",
          name: "Action",
          options: function () {
            const opt: [string, string][] = [["none", "none"]];
            if (resource && resource.action) {
              const action = resource.action;
              console.error("action", action);
              action.forEach(({ name, uuid }: { name: string; uuid: string }) => {
                opt.push([name, uuid]);
              });
            }
            return opt;
          },
        },
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
      const dropdown_option = block.getFieldValue("Action");
      const statements_content = generator.statementToCode(block, "content");

      const code = `
  meta['@${dropdown_option}'] = async function(parameter) {
    let isPlaying = true
    console.log('${dropdown_option}')
    ${statements_content}
    isPlaying = false
  }
  `;
      return code;
    };
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const dropdown_option = block.getFieldValue("Action");
      const statements_content = generator.statementToCode(block, "content");

      const code =
        "meta['@" +
        dropdown_option +
        "'] = function(parameter) \n\
  is_playing = true\n\
  print('" +
        dropdown_option +
        "')\n\
" +
        statements_content +
        "\n\
  is_playing = false\n\
end\n";

      return code;
    };
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
