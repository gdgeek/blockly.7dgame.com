import DataType from "./type";
import { Handler } from "../helper";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";
import {
  buildNamedResourceOptions,
  buildTooltipResourceOptions,
  type NamedResource,
} from "../resourceFilters";
import {
  applyResourceDropdownOptions,
  isCreateOrMoveEventForBlocks,
  rememberResourceDropdownOptions,
  type BlockEventLike,
  type ResourceDropdownField,
} from "../resourceDropdownOptions";

const data = {
  name: "voxel_entity",
} as const;

interface BlockParameters {
  resource?: {
    voxel?: NamedResource[];
  };
}

interface TooltipsData {
  tooltipsInfo: { parentUuid: string }[];
  sourceBlockId: string;
}

interface VoxelBlockInstance {
  id: string;
  jsonInit: (json: object) => void;
  blockParameters: BlockParameters;
  tooltipsData: TooltipsData | null;
  getField: (name: string) => ResourceDropdownField | null;
  getParent: () => { id: string } | null;
  setOnChange: (callback: (event: BlockEventLike) => void) => void;
  restoreOriginalOptions: () => void;
  updateEntityOptions: (tooltipsData: TooltipsData) => void;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as BlockParameters;
    const json = {
      type: data.name,
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["VOXEL_VOXEL"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Voxel",
          options: buildNamedResourceOptions(resource?.voxel),
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
    const typedParams = parameters as BlockParameters;
    const data = {
      init: function (this: VoxelBlockInstance) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);

        this.blockParameters = typedParams;
        this.tooltipsData = null;

        const voxelField = this.getField("Voxel");
        if (voxelField) {
          rememberResourceDropdownOptions(
            voxelField,
            buildNamedResourceOptions(this.blockParameters.resource?.voxel)
          );
        }

        this.setOnChange((event) => {
          if (!isCreateOrMoveEventForBlocks(event, [this.id])) return;

          const parentBlock = this.getParent();
          if (
            this.tooltipsData &&
            parentBlock?.id !== this.tooltipsData.sourceBlockId
          ) {
            this.tooltipsData = null;
            this.restoreOriginalOptions();
          }
        });
      },

      restoreOriginalOptions: function (this: VoxelBlockInstance) {
        const field = this.getField("Voxel");
        if (!field) return;
        applyResourceDropdownOptions(
          field,
          buildNamedResourceOptions(this.blockParameters.resource?.voxel)
        );
      },

      updateEntityOptions: function (
        this: VoxelBlockInstance,
        tooltipsData: TooltipsData
      ) {
        if (!tooltipsData || !tooltipsData.tooltipsInfo) return;

        this.tooltipsData = tooltipsData;
        const field = this.getField("Voxel");
        if (!field) return;

        applyResourceDropdownOptions(
          field,
          buildTooltipResourceOptions(
            this.blockParameters.resource?.voxel,
            tooltipsData.tooltipsInfo.map((info) => info.parentUuid)
          )
        );
      },
    };
    return data;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const dropdown = block.getFieldValue("Voxel");
      return [`handleVoxel(${JSON.stringify(dropdown)})`, generator.ORDER_NONE];
    };
    return script;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
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
