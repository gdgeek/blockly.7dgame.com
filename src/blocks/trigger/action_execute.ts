import EventType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "action_execute",
} as const;

interface ActionResource {
  name: string;
  uuid: string;
}

interface BlockParameters {
  resource?: {
    action?: ActionResource[];
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
      )["TRIGGER_ACTION_EXECUTE"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Action",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.action) {
              const action = resource.action;
              action.forEach(({ name, uuid }) => {
                opt.push([name, uuid]);
              });
            }
            return opt;
          },
        },
        {
          type: "input_value",
          name: "content",
          check: "Task",
        },
      ],
      inputsInline: true,
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
    const javascript = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const statements_content = generator.valueToCode(
        block,
        "content",
        generator.ORDER_NONE
      );

      const dropdown_option = block.getFieldValue("Action");
      const execute = "await task.execute(" + statements_content + ");\n";
      const code =
        "meta['@" +
        dropdown_option +
        "'] = async function(parameter) {\n" +
        execute +
        "}\n";

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
      const statements_content = generator.valueToCode(
        block,
        "content",
        generator.ORDER_NONE
      );

      const dropdown_option = block.getFieldValue("Action");
      const execute = "  _G.task.execute(" + statements_content + ")\n";
      const code =
        "meta['@" +
        dropdown_option +
        "'] = function(parameter) \n  " +
        execute +
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
