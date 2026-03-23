import DataType from "./type";
import { Handler } from "../helper";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "sound_entity",
} as const;

interface SoundResource {
  name: string;
  uuid: string;
}

interface BlockParameters {
  resource?: {
    sound?: SoundResource[];
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
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["SOUND_SOUND"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Sound",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.sound) {
              const sound = resource.sound;
              sound.forEach(({ name, uuid }) => {
                opt.push([name, uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Sound",
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
      const dropdown_polygen = block.getFieldValue("Sound");
      return [
        `handleSound(${JSON.stringify(dropdown_polygen)})`,
        generator.ORDER_NONE,
      ];
    };
    return script;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const dropdown_polygen = block.getFieldValue("Sound");
      return [Handler(dropdown_polygen), generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
