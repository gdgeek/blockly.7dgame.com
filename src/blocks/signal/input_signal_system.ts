import EventType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "input_signal_system",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: data.name,
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["SIGNAL_INPUT_SIGNAL_SYSTEM"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Event",
          options: [
            [
              (
                Blockly.Msg as unknown as Record<string, Record<string, string>>
              )["SIGNAL_BEGIN_SIGNAL"]?.[window.lg],
              "begin",
            ],
            [
              (
                Blockly.Msg as unknown as Record<string, Record<string, string>>
              )["SIGNAL_END_SIGNAL"]?.[window.lg],
              "end",
            ],
            ["拍照", "photo"],
          ],
        },
        {
          type: "input_dummy",
        },
        {
          type: "input_statement",
          name: "content",
        },
      ],
      colour: EventType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    console.log("Parameters", parameters);
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
      const dropdown_option = block.getFieldValue("Event");
      const statements_content = generator.statementToCode(block, "content");

      const code = `verse['#${dropdown_option}'] = async function (parameter) {
        let isPlaying = true;
        console.log('${dropdown_option}');
        ${statements_content}
        isPlaying = false;
      }
      `;

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
      const dropdown_option = block.getFieldValue("Event");
      const statements_content = generator.statementToCode(block, "content");

      const code =
        "verse['#" +
        dropdown_option +
        "'] = function(parameter) \n\
  is_playing = true\n\
  print('" +
        dropdown_option +
        "')\n" +
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
