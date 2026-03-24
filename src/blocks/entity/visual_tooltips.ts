import DataType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "visual_tooltips",
} as const;

interface ResourceEntity {
  name: string;
  uuid: string;
  hasTooltips?: boolean;
}

interface BlockParameters {
  resource?: {
    entity?: ResourceEntity[];
  };
}

interface TooltipsBlockInstance {
  jsonInit: (json: object) => void;
  tooltipsEntities: string[];
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
      message0: (Blockly.Msg as unknown as Record<string, Record<string, string>>)["TOOLTIPS_VISUAL"][window.lg],
      args0: [
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
      tooltip: "Show or hide label on all points",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const typedParams = parameters as BlockParameters;
    const data = {
      init: function (this: TooltipsBlockInstance) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
        console.log("resource", typedParams.resource);

        this.tooltipsEntities = [];

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
      updateEntityOptions: function (this: TooltipsBlockInstance, resource: BlockParameters["resource"]) {
        if (!resource || !resource.entity) return;

        const filteredOptions: [string, string][] = [["none", ""]];
        this.tooltipsEntities = [];

        resource.entity.forEach((entity) => {
          if (entity.hasTooltips === true) {
            filteredOptions.push([entity.name, entity.uuid]);
            this.tooltipsEntities.push(entity.uuid);
          }
        });
      },
    };
    return data;
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      const tooltipsEntities = (block as unknown as { tooltipsEntities?: string[] }).tooltipsEntities || [];
      let code: string;
      if (tooltipsEntities.length > 0) {
        const handlerCalls = tooltipsEntities
          .map((uuid) => `handleEntity("${uuid}")`)
          .join(",\n    ");
        code =
          `point.setTooltipsVisual(` +
          "{" +
          handlerCalls +
          "}, " +
          value_bool +
          ")\n";
      } else {
        code = `point.setTooltipsVisual(handleEntity(""), ${value_bool})\n`;
      }
      return code;
    };
    return script;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      const tooltipsEntities = (block as unknown as { tooltipsEntities?: string[] }).tooltipsEntities || [];
      let code: string;
      if (tooltipsEntities.length > 0) {
        const handlerCalls = tooltipsEntities
          .map((uuid) => `_G.helper.handler(index, '${uuid}')`)
          .join(",\n  ");
        code =
          "_G.point.set_tooltips_visual(" +
          "{\n  " +
          handlerCalls +
          "\n}, " +
          value_bool +
          ")\n";
      } else {
        code =
          "_G.point.set_tooltips_visual(_G.helper.handler(index, '')," +
          value_bool +
          ")\n";
      }
      return code;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
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
