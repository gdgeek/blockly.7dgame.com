import * as Blockly from "blockly";
import DataType from "./type";
import { Handler } from "../helper";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "video_entity",
} as const;

interface VideoResource {
  name: string;
  uuid: string;
}

interface BlockParameters {
  resource?: {
    video?: VideoResource[];
  };
  index?: unknown;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as BlockParameters;
    const json = {
      type: data.name,
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["VIDEO_VIDEO"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Video",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.video) {
              const video = resource.video;
              video.forEach(({ name, uuid }) => {
                opt.push([name, uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Video",
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
      const dropdown_polygen = block.getFieldValue("Video");
      return [
        `handleVideo(${JSON.stringify(dropdown_polygen)})`,
        generator.ORDER_NONE,
      ];
    };
    return script;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const dropdown = block.getFieldValue("Video");
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
