import DataType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "entity_allmovable",
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

interface AllMovableBlockInstance {
  jsonInit: (json: object) => void;
  movableEntities: string[];
  setOnChange: (callback: (event: { type: string }) => void) => void;
  updateEntityOptions: (resource: BlockParameters["resource"]) => void;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["ENTITY_MOVABLE_ALL"][window.lg],
      args0: [
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
      tooltip: "设置所有节点是否可移动",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const typedParams = parameters as BlockParameters;
    const data = {
      init: function (this: AllMovableBlockInstance) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);

        this.movableEntities = [];

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
      updateEntityOptions: function (this: AllMovableBlockInstance, resource: BlockParameters["resource"]) {
        if (!resource || !resource.entity) return;

        const filteredOptions: [string, string][] = [["none", ""]];
        this.movableEntities = [];

        resource.entity.forEach((entity) => {
          if (entity.moved === true) {
            filteredOptions.push([entity.name, entity.uuid]);
            this.movableEntities.push(entity.uuid);
          }
        });
      },
    };
    return data;
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const value_movable = generator.valueToCode(
        block,
        "movable",
        generator.ORDER_ATOMIC
      );

      const movableEntities = (block as unknown as { movableEntities?: string[] }).movableEntities || [];

      let code: string;
      if (movableEntities.length > 0) {
        const handlerCalls = movableEntities
          .map((uuid) => `handleEntity("${uuid}")`)
          .join(",\n    ");

        code =
          `point.setAllMovable(` +
          "[\n" +
          handlerCalls +
          "], " +
          value_movable +
          ")\n";
      } else {
        code = `point.setAllMovable(handleEntity(""), ${value_movable})\n`;
      }

      return code;
    };
    return script;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const value_movable = generator.valueToCode(
        block,
        "movable",
        generator.ORDER_ATOMIC
      );

      const movableEntities = (block as unknown as { movableEntities?: string[] }).movableEntities || [];

      let code: string;
      if (movableEntities.length > 0) {
        const handlerCalls = movableEntities
          .map((uuid) => `_G.helper.handler(index, '${uuid}')`)
          .join(",\n  ");

        code =
          "_G.point.set_all_movable(" +
          "{\n  " +
          handlerCalls +
          "\n}, " +
          value_movable +
          ")\n";
      } else {
        code =
          "_G.point.set_all_movable(_G.helper.handler(index, ''), " +
          value_movable +
          ")\n";
      }

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
