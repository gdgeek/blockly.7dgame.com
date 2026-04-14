import DataType from "./type";
import { Handler } from "../helper";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "text_entity",
} as const;

interface BlockParameters {
  resource?: {
    text?: { name: string; uuid: string }[];
  };
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as BlockParameters;
    const json = {
      type: data.name,
      message0: "文本 %1",
      args0: [
        {
          type: "field_dropdown",
          name: "Text",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.text) {
              const text = resource.text;
              text.forEach((t) => {
                opt.push([t.name, t.uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Entity",
      colour: DataType.colour,
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
    parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    return this.getLua(parameters) as (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ) => [string, unknown];
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const dropdown = block.getFieldValue("Text");
      return [Handler(dropdown), generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
