import DataType from "./type";
import { Handler } from "../helper";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "voxel_entity",
} as const;

interface VoxelResource {
  name: string;
  uuid: string;
}

interface BlockParameters {
  resource?: {
    voxel?: VoxelResource[];
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
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["VOXEL_VOXEL"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Voxel",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.voxel) {
              const voxel = resource.voxel;
              voxel.forEach(({ name, uuid }) => {
                opt.push([name, uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Voxel",
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
      const dropdown = block.getFieldValue("Voxel");
      return [`handleVoxel(${JSON.stringify(dropdown)})`, generator.ORDER_NONE];
    };
    return script;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const dropdown = block.getFieldValue("Voxel");
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
