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
  type ResourceFilterIndex,
} from "../resourceFilters";

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

interface DropdownField {
  getValue: () => string;
  setValue: (value: string) => void;
  setOptions: (options: [string, string][]) => void;
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

interface PolygenEntityBlockInstance {
  jsonInit: (json: object) => void;
  blockParameters: BlockParameters;
  originalOptions: [string, string][];
  tooltipsData: TooltipsData | null;
  parentBlockId: string | null;
  selectedPolygenUuid: string | null;
  setOnChange: (callback: (event: { type: string }) => void) => void;
  getFieldValue: (name: string) => string;
  getField: (name: string) => DropdownField | null;
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

        // 监听模型切换
        this.setOnChange((event: { type: string }) => {
          const selectedUuid = this.getFieldValue("Polygen");

          // 只有在 Polygen 的 UUID 改变时，才触发更新事件
          if (this.selectedPolygenUuid !== selectedUuid) {
            this.selectedPolygenUuid = selectedUuid;

            // 触发更新事件
            Blockly.Events.fire(
              new Blockly.Events.BlockChange(
                this as unknown as Blockly.Block,
                "field",
                "Polygen",
                "",
                selectedUuid
              )
            );
          }

          // 检测是否断开了与visual_tooltip的连接
          if (
            event.type === Blockly.Events.BLOCK_CHANGE ||
            event.type === Blockly.Events.BLOCK_MOVE
          ) {
            this.checkConnectionState();
          }

          if (
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.BLOCK_MOVE
          ) {
            this.syncContextualOptions();
          }
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
        if (
          parentBlock?.type === "visual_tooltip" &&
          this.tooltipsData?.sourceBlockId === parentBlock.id
        ) {
          return;
        }

        const field = this.getField("Polygen");
        if (!field) return;

        applyDropdownOptions(
          field,
          buildPolygenOptions(this.blockParameters?.resource, parentBlock?.type)
        );
      },

      // 更新下拉选项的方法，供其他模块使用
      updateDropdownOptions: function (
        this: PolygenEntityBlockInstance,
        options: [string, string][]
      ) {
        const field = this.getField("Polygen");
        if (!field) return;

        applyDropdownOptions(field, options);
      },

      // 根据tooltipsData更新实体选项
      updateEntityOptions: function (
        this: PolygenEntityBlockInstance,
        tooltipsData: TooltipsData
      ) {
        if (!tooltipsData || !tooltipsData.tooltipsInfo) return;

        this.tooltipsData = tooltipsData;
        this.parentBlockId = tooltipsData.sourceBlockId;

        const field = this.getField("Polygen");
        if (!field) return;

        const resource = this.blockParameters && this.blockParameters.resource;
        const parentUuids = tooltipsData.tooltipsInfo.map(
          (info) => info.parentUuid
        );
        applyDropdownOptions(
          field,
          buildTooltipResourceOptions(resource?.polygen, parentUuids)
        );
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
