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
  name: "entity_movable",
} as const;

interface MovableBlockInstance {
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
      )["ENTITY_MOVABLE"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Entity"],
        },
        {
          type: "input_value",
          name: "movable",
          check: "Boolean",
        },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "设置节点是否可移动",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const data = {
      init: function (this: MovableBlockInstance) {
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

      updateEntityOptions: function (this: MovableBlockInstance) {
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
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const value_entity =
        generator.valueToCode(block, "entity", generator.ORDER_NONE) ||
        "undefined";
      const value_movable =
        generator.valueToCode(block, "movable", generator.ORDER_ATOMIC) ||
        "false";

      const code = `point.setMoveable(${value_entity}, ${value_movable});\n`;
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
      const value_entity =
        generator.valueToCode(block, "entity", generator.ORDER_NONE) || "nil";
      const value_movable =
        generator.valueToCode(block, "movable", generator.ORDER_ATOMIC) ||
        "false";
      const code =
        "_G.point.set_moveable(" + value_entity + ", " + value_movable + ")\n";
      return code;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
