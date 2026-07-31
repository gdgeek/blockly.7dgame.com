import DataType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";
import {
  isCreateOrMoveEventForBlocks,
  type BlockEventLike,
} from "../resourceDropdownOptions";

const data = {
  name: "entity_rotatable",
} as const;

interface RotatableBlockInstance {
  id: string;
  jsonInit: (json: object) => void;
  setOnChange: (callback: (event: BlockEventLike) => void) => void;
  getInputTargetBlock: (name: string) => {
    id: string;
    type: string;
    syncContextualOptions?: () => void;
  } | null;
  updateEntityOptions: () => void;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["ENTITY_ROTATABLE"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Entity"],
        },
        {
          type: "input_value",
          name: "rotatable",
          check: "Boolean",
        },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "控制节点的自旋转启停。",
      helpUrl: "",
    };
    return json;
  },

  getBlock(parameters: unknown): object {
    const data = {
      init: function (this: RotatableBlockInstance) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);

        this.setOnChange((event: BlockEventLike) => {
          const entityBlock = this.getInputTargetBlock("entity");
          if (
            !isCreateOrMoveEventForBlocks(event, [this.id, entityBlock?.id])
          ) {
            return;
          }

          this.updateEntityOptions();
        });
      },

      updateEntityOptions: function (this: RotatableBlockInstance) {
        const entityBlock = this.getInputTargetBlock("entity");
        if (!entityBlock || entityBlock.type !== "entity") return;

        if (typeof entityBlock.syncContextualOptions === "function") {
          entityBlock.syncContextualOptions();
        }
      },
    };

    return data;
  },

  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const value_entity =
        generator.valueToCode(block, "entity", generator.ORDER_NONE) ||
        "undefined";
      const value_rotatable =
        generator.valueToCode(block, "rotatable", generator.ORDER_ATOMIC) ||
        "false";

      return `point.setRotatable(${value_entity}, ${value_rotatable});\n`;
    };
  },

  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const value_entity =
        generator.valueToCode(block, "entity", generator.ORDER_NONE) || "nil";
      const value_rotatable =
        generator.valueToCode(block, "rotatable", generator.ORDER_ATOMIC) ||
        "false";

      return `_G.point.set_rotatable(${value_entity}, ${value_rotatable})\n`;
    };
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
      rotatable: {
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
