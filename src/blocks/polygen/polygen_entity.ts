import DataType from "./type";
import { Handler } from "../helper";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "polygen_entity",
} as const;

interface ResourcePolygen {
  name: string;
  uuid: string;
}

interface BlockParameters {
  resource?: {
    polygen?: ResourcePolygen[];
  };
}

interface TooltipsData {
  tooltipsInfo: { parentUuid: string }[];
  sourceBlockId: string;
}

interface DropdownField {
  menuGenerator_: [string, string][];
  getValue: () => string;
  setValue: (value: string) => void;
  forceRerender: () => void;
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
  getParent: () => { id: string } | null;
  getOriginalOptions: () => [string, string][];
  checkConnectionState: () => void;
  restoreOriginalOptions: () => void;
  updateDropdownOptions: (options: [string, string][]) => void;
  updateEntityOptions: (tooltipsData: TooltipsData) => void;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as BlockParameters;
    const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
    const json = {
      type: data.name,
      message0: Msg["POLYGEN_POLYGEN_ENTITY"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Polygen",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.polygen) {
              const polygen = resource.polygen;
              polygen.forEach((poly) => {
                opt.push([poly.name, poly.uuid]);
              });
            }
            return opt;
          },
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
        });
      },

      // 获取原始选项
      getOriginalOptions: function (this: PolygenEntityBlockInstance): [string, string][] {
        const opt: [string, string][] = [["none", ""]];
        const resource = this.blockParameters && this.blockParameters.resource;
        if (resource && resource.polygen) {
          resource.polygen.forEach((poly) => {
            opt.push([poly.name, poly.uuid]);
          });
        }
        return opt;
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
          this.restoreOriginalOptions();
          this.tooltipsData = null;
          this.parentBlockId = null;
        }

        this.parentBlockId = parentBlockId;
      },

      // 恢复原始选项
      restoreOriginalOptions: function (this: PolygenEntityBlockInstance) {
        const field = this.getField("Polygen");
        if (!field) return;

        field.menuGenerator_ = this.originalOptions;
        field.forceRerender();
      },

      // 更新下拉选项的方法，供其他模块使用
      updateDropdownOptions: function (this: PolygenEntityBlockInstance, options: [string, string][]) {
        const field = this.getField("Polygen");
        if (!field) return;

        field.menuGenerator_ = options;

        const currentValue = field.getValue();
        if (!options.some((opt) => opt[1] === currentValue)) {
          field.setValue("");
        }
      },

      // 根据tooltipsData更新实体选项
      updateEntityOptions: function (this: PolygenEntityBlockInstance, tooltipsData: TooltipsData) {
        if (
          !tooltipsData ||
          !tooltipsData.tooltipsInfo ||
          tooltipsData.tooltipsInfo.length === 0
        )
          return;

        this.tooltipsData = tooltipsData;
        this.parentBlockId = tooltipsData.sourceBlockId;

        const field = this.getField("Polygen");
        if (!field) return;

        const currentValue = field.getValue();

        const resource = this.blockParameters && this.blockParameters.resource;
        if (!resource || !resource.polygen) return;

        const matchedPolygens: [string, string][] = [];
        const parentUuids = tooltipsData.tooltipsInfo.map(
          (info) => info.parentUuid
        );

        resource.polygen.forEach((polygen) => {
          if (parentUuids.includes(polygen.uuid)) {
            matchedPolygens.push([polygen.name, polygen.uuid]);
          }
        });

        if (matchedPolygens.length > 0) {
          const options: [string, string][] = [["none", ""], ...matchedPolygens];
          field.menuGenerator_ = options;

          if (!parentUuids.includes(currentValue) && currentValue !== "") {
            field.setValue("");
          }
        } else {
          field.menuGenerator_ = [["none", ""]];
          field.setValue("");
        }

        field.forceRerender();
      },
    };
    return data;
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const javascript = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
      const dropdown_polygen = block.getFieldValue("Polygen");
      return [
        `handlePolygen(${JSON.stringify(dropdown_polygen)})`,
        generator.ORDER_NONE,
      ];
    };
    return javascript;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): [string, unknown] {
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
