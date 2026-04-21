import TriggerType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "gesture_trigger",
} as const;

interface ResourceAction {
  name: string;
  uuid: string;
  type: string;
}

interface BlockParameters {
  resource?: {
    action?: ResourceAction[];
  };
}

function getLocalizedCommandName(name: string): string {
  const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
  const commandMap: Record<string, string> = {
    ok: Msg["GESTURE_TRIGGER_OK"][window.lg],
    fist: Msg["GESTURE_TRIGGER_FIST"][window.lg],
  };

  return commandMap[name] || name;
}

const block: BlockDefinition = {
  title: data.name,
  type: TriggerType.name,
  colour: TriggerType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as BlockParameters;
    const json = {
      type: data.name,
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["GESTURE_TRIGGER"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Gesture",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.action) {
              const action = resource.action;
              action.forEach(({ name, uuid, type }: ResourceAction) => {
                if (type === "Gesture") {
                  if (name) {
                    opt.push([getLocalizedCommandName(name), uuid]);
                  } else {
                    opt.push([uuid, uuid]);
                  }
                }
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
    const data = {
      init: function () {
        const current = this as unknown as { jsonInit: (_json: object) => void };
        const json = block.getBlockJson!(parameters);
        current.jsonInit(json);
      },
    };
    return data;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const javascript = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const dropdown_option = block.getFieldValue("Gesture");
      const statements_content = generator.statementToCode(block, "content");
      const code = `
  meta['@${dropdown_option}'] = async function(parameter) {
    let isPlaying = true
    console.error('${dropdown_option}')
    ${statements_content}
    isPlaying = false
  };
  `;
      return code;
    };
    return javascript;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const dropdown_option = block.getFieldValue("Gesture");
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
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
