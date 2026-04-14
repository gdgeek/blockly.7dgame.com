import DataType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "entity_movable",
} as const;

interface ResourceEntity {
  name: string;
  uuid: string;
  moved?: boolean;
}

interface BlockParameters {
  resource?: {
    entity?: ResourceEntity[];
  };
}

interface MovableBlockInstance {
  jsonInit: (json: object) => void;
  setOnChange: (callback: (event: { type: string }) => void) => void;
  getInputTargetBlock: (name: string) => {
    type: string;
    updateDropdownOptions?: (options: [string, string][]) => void;
  } | null;
  updateEntityOptions: (resource: BlockParameters["resource"]) => void;
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
    const typedParams = parameters as BlockParameters;
    const data = {
      init: function (this: MovableBlockInstance) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);

        this.setOnChange((event: { type: string }) => {
          if (
            event.type === Blockly.Events.BLOCK_CHANGE ||
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.BLOCK_MOVE
          ) {
            this.updateEntityOptions(typedParams.resource);
          }
        });
      },

      updateEntityOptions: function (
        this: MovableBlockInstance,
        resource: BlockParameters["resource"]
      ) {
        if (!resource || !resource.entity) return;

        const entityBlock = this.getInputTargetBlock("entity");
        if (!entityBlock || entityBlock.type !== "entity") return;

        const filteredOptions: [string, string][] = [["none", ""]];
        resource.entity.forEach((entity) => {
          if (entity.moved === true) {
            filteredOptions.push([entity.name, entity.uuid]);
          }
        });

        if (typeof entityBlock.updateDropdownOptions === "function") {
          entityBlock.updateDropdownOptions(filteredOptions);
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
      const value_movable = generator.valueToCode(
        block,
        "movable",
        generator.ORDER_ATOMIC
      );

      const code = `point.setMoveable(${value_entity}, ${value_movable})\n`;
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
      const value_movable = generator.valueToCode(
        block,
        "movable",
        generator.ORDER_ATOMIC
      );
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
