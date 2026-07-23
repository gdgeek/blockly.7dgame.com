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

interface DropdownField {
  getValue: () => string;
  setValue: (value: string) => void;
  setOptions: (options: [string, string][]) => void;
  forceRerender: () => void;
}

interface VoxelBlockInstance {
  jsonInit: (json: object) => void;
  blockParameters: BlockParameters;
  tooltipsData: TooltipsData | null;
  getField: (name: string) => DropdownField | null;
  getParent: () => { id: string } | null;
  setOnChange: (callback: (event: { type: string }) => void) => void;
  restoreOriginalOptions: () => void;
  updateEntityOptions: (tooltipsData: TooltipsData) => void;
}

function applyDropdownOptions(
  field: DropdownField,
  options: [string, string][]
): void {
  const currentValue = field.getValue();
  field.setOptions(options);
  if (options.some((option) => option[1] === currentValue)) {
    field.setValue(currentValue);
  }
  field.forceRerender();
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

        this.setOnChange((event) => {
          if (event.type !== Blockly.Events.BLOCK_MOVE) return;

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
        applyDropdownOptions(
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

        applyDropdownOptions(
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
