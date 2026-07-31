import DataType from "./type";
import { Handler } from "../helper";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";
import {
  buildPolygenOptions,
  buildTooltipResourceOptions,
  collectTooltipParentUuids,
  type ResourceFilterIndex,
} from "../resourceFilters";
import {
  applyResourceDropdownOptions,
  isCreateOrMoveEventForBlocks,
  rememberResourceDropdownOptions,
  type BlockEventLike,
  type ResourceDropdownField,
} from "../resourceDropdownOptions";

const data = {
  name: "polygen_entity",
} as const;

interface BlockParameters {
  resource?: ResourceFilterIndex;
}

interface TooltipsData {
  tooltipsInfo: { parentUuid: string }[];
  sourceBlockId: string;
}

interface PolygenEntityBlockInstance {
  id: string;
  jsonInit: (json: object) => void;
  blockParameters: BlockParameters;
  originalOptions: [string, string][];
  tooltipsData: TooltipsData | null;
  parentBlockId: string | null;
  setOnChange: (callback: (event: BlockEventLike) => void) => void;
  getField: (name: string) => ResourceDropdownField | null;
  getParent: () => { id: string; type?: string } | null;
  getOriginalOptions: () => [string, string][];
  checkConnectionState: () => void;
  restoreOriginalOptions: () => void;
  syncContextualOptions: () => void;
  updateDropdownOptions: (options: [string, string][]) => void;
  updateEntityOptions: (tooltipsData: TooltipsData) => void;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as BlockParameters;
    const Msg = Blockly.Msg as unknown as Record<
      string,
      Record<string, string>
    >;
    const json = {
      type: data.name,
      message0: Msg["POLYGEN_POLYGEN_ENTITY"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Polygen",
          options: buildPolygenOptions(resource),
        },
      ],
      output: "Polygen",
      colour: DataType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const typedParams = parameters as BlockParameters;
    const data = {
      init: function (this: PolygenEntityBlockInstance) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);

        // 保存原始参数
        this.blockParameters = typedParams;
        // 保存原始下拉选项
        this.originalOptions = this.getOriginalOptions();
        // 保存当前的tooltips信息和连接信息
        this.tooltipsData = null;
        // 保存父块信息，用于检测断开连接
        this.parentBlockId = null;

        const polygenField = this.getField("Polygen");
        if (polygenField) {
          rememberResourceDropdownOptions(polygenField, this.originalOptions);
        }

        // 监听模型切换
        this.setOnChange((event: BlockEventLike) => {
          if (!isCreateOrMoveEventForBlocks(event, [this.id])) return;

          // 检测是否断开了与visual_tooltip的连接
          this.checkConnectionState();
          this.syncContextualOptions();
        });

        setTimeout(() => this.syncContextualOptions(), 0);
      },

      // 获取原始选项
      getOriginalOptions: function (
        this: PolygenEntityBlockInstance
      ): [string, string][] {
        const resource = this.blockParameters && this.blockParameters.resource;
        return buildPolygenOptions(resource);
      },

      // 检测连接状态
      checkConnectionState: function (this: PolygenEntityBlockInstance) {
        const parentBlock = this.getParent();
        const parentBlockId = parentBlock ? parentBlock.id : null;

        if (
          this.tooltipsData &&
          (parentBlockId === null ||
            parentBlockId !== this.tooltipsData.sourceBlockId)
        ) {
          this.tooltipsData = null;
          this.parentBlockId = null;
        }

        this.parentBlockId = parentBlockId;
      },

      // 恢复原始选项
      restoreOriginalOptions: function (this: PolygenEntityBlockInstance) {
        this.syncContextualOptions();
      },

      syncContextualOptions: function (this: PolygenEntityBlockInstance) {
        const parentBlock = this.getParent();
        const field = this.getField("Polygen");
        if (!field) return;

        const resource = this.blockParameters?.resource;
        if (parentBlock?.type === "visual_tooltip") {
          const parentUuids =
            this.tooltipsData?.sourceBlockId === parentBlock.id
              ? this.tooltipsData.tooltipsInfo.map((info) => info.parentUuid)
              : collectTooltipParentUuids(resource);
          applyResourceDropdownOptions(
            field,
            buildTooltipResourceOptions(resource?.polygen, parentUuids)
          );
          return;
        }

        applyResourceDropdownOptions(
          field,
          buildPolygenOptions(resource, parentBlock?.type)
        );
      },

      // 更新下拉选项的方法，供其他模块使用
      updateDropdownOptions: function (
        this: PolygenEntityBlockInstance,
        options: [string, string][]
      ) {
        const field = this.getField("Polygen");
        if (!field) return;

        applyResourceDropdownOptions(field, options);
      },

      // 根据tooltipsData更新实体选项
      updateEntityOptions: function (
        this: PolygenEntityBlockInstance,
        tooltipsData: TooltipsData
      ) {
        if (!tooltipsData || !tooltipsData.tooltipsInfo) return;

        this.tooltipsData = tooltipsData;
        this.parentBlockId = tooltipsData.sourceBlockId;
        this.syncContextualOptions();
      },
    };
    return data;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const javascript = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const dropdown_polygen = block.getFieldValue("Polygen");
      return [
        `handlePolygen(${JSON.stringify(dropdown_polygen)})`,
        generator.ORDER_NONE,
      ];
    };
    return javascript;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const dropdown_polygen = block.getFieldValue("Polygen");
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
