import DataType from "./type";
import * as Blockly from "blockly";
import { Handler } from "../helper";
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
  name: "entity",
} as const;

interface BlockParameters {
  resource?: {
    entity?: NamedResource[];
  };
}

interface TooltipsData {
  tooltipsInfo: { parentUuid: string }[];
  sourceBlockId: string;
}

interface DropdownField {
  getValue: () => string;
  setValue: (_value: string) => void;
  setOptions: (_options: [string, string][]) => void;
  forceRerender: () => void;
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

interface EntityBlockInstance {
  jsonInit: (_json: object) => void;
  blockParameters: BlockParameters;
  originalOptions: [string, string][];
  tooltipsData: TooltipsData | null;
  parentBlockId: string | null;
  selectedEntityUuid: string | null;
  setOnChange: (_callback: (_event: { type: string }) => void) => void;
  getFieldValue: (_name: string) => string;
  getField: (_name: string) => DropdownField | null;
  getParent: () => { id: string } | null;
  getOriginalOptions: () => [string, string][];
  checkConnectionState: () => void;
  restoreOriginalOptions: () => void;
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
          options: buildNamedResourceOptions(resource?.entity),
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
        // 保存当前选中的实体UUID
        this.selectedEntityUuid = null;

        // 监听块的变化事件
        this.setOnChange((event: { type: string }) => {
          const selectedUuid = this.getFieldValue("Entity");

          // 只有在 Entity 的 UUID 改变时，才触发更新事件
          if (this.selectedEntityUuid !== selectedUuid) {
            this.selectedEntityUuid = selectedUuid;

            // 触发更新事件
            Blockly.Events.fire(
              new Blockly.Events.BlockChange(
                this as unknown as Blockly.Block,
                "field",
                "Entity",
                "",
                selectedUuid
              )
            );
          }

          if (
            event.type === Blockly.Events.BLOCK_CHANGE ||
            event.type === Blockly.Events.BLOCK_MOVE
          ) {
            // 检测是否断开了与visual_tooltip的连接
            this.checkConnectionState();
          }
        });
      },

      // 获取原始选项
      getOriginalOptions: function (
        this: EntityBlockInstance
      ): [string, string][] {
        const resource = this.blockParameters && this.blockParameters.resource;
        return buildNamedResourceOptions(resource?.entity);
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
          // 恢复原始选项
          this.restoreOriginalOptions();
          this.tooltipsData = null;
          this.parentBlockId = null;
        }

        // 更新父块ID
        this.parentBlockId = parentBlockId;
      },

      // 恢复原始选项
      restoreOriginalOptions: function (this: EntityBlockInstance) {
        const field = this.getField("Entity");
        if (!field) return;

        applyDropdownOptions(field, this.originalOptions);
      },

      // 更新下拉选项的方法，供其他模块使用
      updateDropdownOptions: function (
        this: EntityBlockInstance,
        options: [string, string][]
      ) {
        const field = this.getField("Entity");
        if (!field) return;

        applyDropdownOptions(field, options);
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

        // 获取字段
        const field = this.getField("Entity");
        if (!field) return;

        const resource = this.blockParameters && this.blockParameters.resource;
        const parentUuids = tooltipsData.tooltipsInfo.map(
          (info) => info.parentUuid
        );
        applyDropdownOptions(
          field,
          buildTooltipResourceOptions(resource?.entity, parentUuids)
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
