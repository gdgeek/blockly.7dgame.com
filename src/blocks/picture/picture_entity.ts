import DataType from "./type";
import * as Blockly from "blockly";
import { Handler } from "../helper";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "picture_entity",
} as const;

interface ResourcePicture {
  name: string;
  uuid: string;
}

interface BlockParameters {
  resource?: {
    picture?: ResourcePicture[];
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
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["PICTURE_PICTURE"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Picture",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.picture) {
              const picture = resource.picture;
              picture.forEach((pic) => {
                opt.push([pic.name, pic.uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Picture",
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
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const script = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const dropdown = block.getFieldValue("Picture");
      return [
        `handlePicture(${JSON.stringify(dropdown)})`,
        generator.ORDER_NONE,
      ];
    };
    return script;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const dropdown = block.getFieldValue("Picture");
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
