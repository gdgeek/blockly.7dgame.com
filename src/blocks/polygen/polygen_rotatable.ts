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
  name: "polygen_rotatable",
} as const;

interface RotatableBlockInstance {
  id: string;
  jsonInit: (json: object) => void;
  getInputTargetBlock: (name: string) => {
    id: string;
    type: string;
    syncContextualOptions?: () => void;
  } | null;
  setOnChange: (callback: (event: BlockEventLike) => void) => void;
  updateEntityOptions: () => void;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const Msg = Blockly.Msg as unknown as Record<
      string,
      Record<string, string>
    >;
    const json = {
      type: "block_type",
      message0: Msg["POLYGEN_ROTATABLE"][window.lg] || "模型 %1 是否自旋转 %2",
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Polygen"],
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
      tooltip: "设置模型是否自旋转",
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
        if (!entityBlock || entityBlock.type !== "polygen_entity") return;

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

      return `polygen.setRotatable(${value_entity}, ${value_rotatable});\n`;
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

      return `_G.polygen.set_rotatable(${value_entity}, ${value_rotatable})\n`;
    };
  },

  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
