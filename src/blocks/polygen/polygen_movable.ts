import DataType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "polygen_movable",
} as const;

interface ResourcePolygen {
  name: string;
  uuid: string;
  moved?: boolean;
}

interface BlockParameters {
  resource?: {
    polygen?: ResourcePolygen[];
  };
}

interface MovableBlockInstance {
  jsonInit: (json: object) => void;
  getInputTargetBlock: (name: string) => {
    type: string;
    updateDropdownOptions?: (options: [string, string][]) => void;
  } | null;
  setOnChange: (callback: (event: { type: string }) => void) => void;
  updateEntityOptions: (resource: BlockParameters["resource"]) => void;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
    const json = {
      type: "block_type",
      message0: Msg["POLYGEN_MOVABLE"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Polygen"],
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
      tooltip: "",
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

      updateEntityOptions: function (this: MovableBlockInstance, resource: BlockParameters["resource"]) {
        if (!resource || !resource.polygen) return;

        const entityBlock = this.getInputTargetBlock("entity");
        if (!entityBlock || entityBlock.type !== "polygen_entity") return;

        const filteredOptions: [string, string][] = [["none", ""]];
        resource.polygen.forEach((poly) => {
          if (poly.moved === true) {
            filteredOptions.push([poly.name, poly.uuid]);
          }
        });

        if (typeof entityBlock.updateDropdownOptions === "function") {
          entityBlock.updateDropdownOptions(filteredOptions);
        }
      },
    };
    return data;
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
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

      const code = `polygen.setMoveable(${value_entity}, ${value_movable})\n`;
      return code;
    };
    return script;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
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
        "_G.polygen.set_moveable(" +
        value_entity +
        ", " +
        value_movable +
        ")\n";
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
