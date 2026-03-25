import DataType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "visual_tooltip",
} as const;

interface TooltipInfo {
  parentUuid: string;
}

interface ResourceAction {
  type: string;
  parentUuid?: string;
}

interface BlockParameters {
  resource?: {
    action?: ResourceAction[];
  };
}

interface TooltipBlockInstance {
  jsonInit: (json: object) => void;
  tooltipsInfo: TooltipInfo[];
  id: string;
  setOnChange: (callback: (event: { type: string }) => void) => void;
  getInput: (name: string) => { connection: unknown } | null;
  getInputTargetBlock: (name: string) => {
    updateEntityOptions?: (data: {
      tooltipsInfo: TooltipInfo[];
      sourceBlockId: string;
    }) => void;
  } | null;
  updateConnectedBlock: () => void;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters: unknown): object {
    // eslint-disable-next-line no-unused-vars -- 防御性赋值，确保参数可用
    const _params = parameters || {};

    const json = {
      type: "block_type",
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["TOOLTIP_VISUAL"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Entity", "Polygen", "Voxel"],
        },
        {
          type: "input_value",
          name: "bool",
          check: "Boolean",
        },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "Show or hide label on a specific point",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const typedParams = parameters as BlockParameters;
    const data = {
      init: function (this: TooltipBlockInstance) {
        console.error("parameters", parameters);
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);

        this.tooltipsInfo = [];

        if (
          typedParams &&
          typedParams.resource &&
          typedParams.resource.action
        ) {
          const tooltipActions = typedParams.resource.action.filter(
            (action) => action.type === "Tooltip"
          );

          if (tooltipActions && tooltipActions.length > 0) {
            tooltipActions.forEach((tooltipAction) => {
              if (tooltipAction.parentUuid) {
                this.tooltipsInfo.push({
                  parentUuid: tooltipAction.parentUuid,
                });
              }
            });
          }
        }

        this.setOnChange((event: { type: string }) => {
          if (
            event.type === Blockly.Events.BLOCK_CHANGE ||
            event.type === Blockly.Events.BLOCK_MOVE ||
            event.type === Blockly.Events.BLOCK_CREATE
          ) {
            this.updateConnectedBlock();
          }
        });

        setTimeout(() => {
          this.updateConnectedBlock();
        }, 0);
      },

      updateConnectedBlock: function (this: TooltipBlockInstance) {
        if (!this.tooltipsInfo || this.tooltipsInfo.length === 0) return;

        const entityInput = this.getInput("entity");
        if (!entityInput || !entityInput.connection) return;

        const connectedBlock = this.getInputTargetBlock("entity");
        if (!connectedBlock) return;

        if (typeof connectedBlock.updateEntityOptions === "function") {
          connectedBlock.updateEntityOptions({
            tooltipsInfo: this.tooltipsInfo,
            sourceBlockId: this.id,
          });
        }
      },
    };
    return data;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      const value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      const code = `point.setTooltipVisual(${value_entity}, ${value_bool})\n`;
      return code;
    };
    return script;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      const value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      const code = `_G.point.set_tooltip_visual(${value_entity}, ${value_bool})\n`;
      return code;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      entity: {
        block: {
          type: "entity",
        },
      },
      bool: {
        block: {
          type: "logic_boolean",
          fields: {
            BOOL: "TRUE",
          },
        },
      },
    },
  },
};

export default block;
