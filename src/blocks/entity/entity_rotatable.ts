import DataType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "entity_rotatable",
} as const;

interface ResourceEntity {
  name: string;
  uuid: string;
  rotate?: boolean;
}

interface BlockParameters {
  resource?: {
    entity?: ResourceEntity[];
  };
}

interface RotatableBlockEvent {
  type: string;
  blockId?: string;
  ids?: string[];
  oldParentId?: string;
  newParentId?: string;
}

interface RotatableBlockInstance {
  id: string;
  jsonInit: (json: object) => void;
  setOnChange: (callback: (event: RotatableBlockEvent) => void) => void;
  getInputTargetBlock: (name: string) => {
    id: string;
    type: string;
    updateDropdownOptions?: (options: [string, string][]) => void;
  } | null;
  updateEntityOptions: (resource: BlockParameters["resource"]) => void;
  shouldUpdateEntityOptions: (event: RotatableBlockEvent) => boolean;
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
    const typedParams = parameters as BlockParameters;
    const data = {
      init: function (this: RotatableBlockInstance) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);

        this.setOnChange((event: RotatableBlockEvent) => {
          if (this.shouldUpdateEntityOptions(event)) {
            this.updateEntityOptions(typedParams.resource);
          }
        });
      },

      shouldUpdateEntityOptions: function (
        this: RotatableBlockInstance,
        event: RotatableBlockEvent
      ) {
        const entityBlock = this.getInputTargetBlock("entity");
        const entityBlockId = entityBlock?.id;

        if (event.type === Blockly.Events.BLOCK_CREATE) {
          return (
            event.blockId === this.id ||
            event.ids?.includes(this.id) === true ||
            (entityBlockId !== undefined &&
              event.ids?.includes(entityBlockId) === true)
          );
        }

        if (event.type === Blockly.Events.BLOCK_MOVE) {
          return (
            event.blockId === entityBlockId ||
            event.oldParentId === this.id ||
            event.newParentId === this.id
          );
        }

        return (
          event.type === Blockly.Events.BLOCK_CHANGE &&
          event.blockId === entityBlockId
        );
      },

      updateEntityOptions: function (
        this: RotatableBlockInstance,
        resource: BlockParameters["resource"]
      ) {
        if (!resource || !resource.entity) return;

        const entityBlock = this.getInputTargetBlock("entity");
        if (!entityBlock || entityBlock.type !== "entity") return;

        const filteredOptions: [string, string][] = [["none", ""]];
        resource.entity.forEach((entity) => {
          if (entity.rotate === true) {
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
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      const value_rotatable = generator.valueToCode(
        block,
        "rotatable",
        generator.ORDER_ATOMIC
      );

      return `point.setRotatable(${value_entity}, ${value_rotatable})\n`;
    };
  },

  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      const value_rotatable = generator.valueToCode(
        block,
        "rotatable",
        generator.ORDER_ATOMIC
      );

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
