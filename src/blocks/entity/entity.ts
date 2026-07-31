import DataType from "./type";
import * as Blockly from "blockly";
import { Handler } from "../helper";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";
import {
  buildEntityOptions,
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
  name: "entity",
} as const;

interface BlockParameters {
  resource?: ResourceFilterIndex;
}

interface TooltipsData {
  tooltipsInfo: { parentUuid: string }[];
  sourceBlockId: string;
}

interface EntityBlockInstance {
  id: string;
  jsonInit: (_json: object) => void;
  blockParameters: BlockParameters;
  originalOptions: [string, string][];
  tooltipsData: TooltipsData | null;
  parentBlockId: string | null;
  setOnChange: (_callback: (_event: BlockEventLike) => void) => void;
  getField: (_name: string) => ResourceDropdownField | null;
  getParent: () => { id: string; type?: string } | null;
  getOriginalOptions: () => [string, string][];
  checkConnectionState: () => void;
  restoreOriginalOptions: () => void;
  syncContextualOptions: () => void;
  updateDropdownOptions: (_options: [string, string][]) => void;
  updateEntityOptions: (_tooltipsData: TooltipsData) => void;
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
      )["ENTITY_ENTITY"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Entity",
          options: buildEntityOptions(resource),
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
    const typedParams = parameters as BlockParameters;
    const data = {
      init: function (this: EntityBlockInstance) {
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
        const entityField = this.getField("Entity");
        if (entityField) {
          rememberResourceDropdownOptions(entityField, this.originalOptions);
        }

        // 监听块的变化事件
        this.setOnChange((event: BlockEventLike) => {
          if (!isCreateOrMoveEventForBlocks(event, [this.id])) return;

          // 检测是否断开了与visual_tooltip的连接
          this.checkConnectionState();
          this.syncContextualOptions();
        });

        setTimeout(() => {
          this.checkConnectionState();
          this.syncContextualOptions();
        }, 0);
      },

      // 获取原始选项
      getOriginalOptions: function (
        this: EntityBlockInstance
      ): [string, string][] {
        const resource = this.blockParameters && this.blockParameters.resource;
        return buildEntityOptions(resource);
      },

      // 检测连接状态
      checkConnectionState: function (this: EntityBlockInstance) {
        // 获取父块
        const parentBlock = this.getParent();
        const parentBlockId = parentBlock ? parentBlock.id : null;

        // 如果有tooltipsData但没有父块，或者父块ID变了，说明断开了连接
        if (
          this.tooltipsData &&
          (parentBlockId === null ||
            parentBlockId !== this.tooltipsData.sourceBlockId)
        ) {
          this.tooltipsData = null;
          this.parentBlockId = null;
        }

        // 更新父块ID
        this.parentBlockId = parentBlockId;
      },

      // 恢复原始选项
      restoreOriginalOptions: function (this: EntityBlockInstance) {
        this.syncContextualOptions();
      },

      syncContextualOptions: function (this: EntityBlockInstance) {
        const field = this.getField("Entity");
        if (!field) return;

        const resource = this.blockParameters?.resource;
        const parentBlock = this.getParent();

        if (parentBlock?.type === "visual_tooltip") {
          const parentUuids =
            this.tooltipsData?.sourceBlockId === parentBlock.id
              ? this.tooltipsData.tooltipsInfo.map((info) => info.parentUuid)
              : collectTooltipParentUuids(resource);
          applyResourceDropdownOptions(
            field,
            buildTooltipResourceOptions(resource?.entity, parentUuids)
          );
          return;
        }

        applyResourceDropdownOptions(
          field,
          buildEntityOptions(resource, parentBlock?.type)
        );
      },

      // 更新下拉选项的方法，供其他模块使用
      updateDropdownOptions: function (
        this: EntityBlockInstance,
        options: [string, string][]
      ) {
        const field = this.getField("Entity");
        if (!field) return;

        applyResourceDropdownOptions(field, options);
      },

      // 根据tooltipsData更新实体选项
      updateEntityOptions: function (
        this: EntityBlockInstance,
        tooltipsData: TooltipsData
      ) {
        if (!tooltipsData || !tooltipsData.tooltipsInfo) return;

        // 保存tooltipsData，包括来源块ID
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
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const dropdown = block.getFieldValue("Entity");
      return [
        `handleEntity(${JSON.stringify(dropdown)})`,
        generator.ORDER_NONE,
      ];
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
      const dropdown = block.getFieldValue("Entity");
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
