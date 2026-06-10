import * as Blockly from "blockly";
import DataType from "./type";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "transform_data",
} as const;

type TransformPartName = "position" | "rotate" | "scale";

interface TransformPart {
  name: TransformPartName;
  mutatorType: string;
  labelKey: string;
}

type TransformBlock = Blockly.Block & {
  transformParts_: TransformPartName[];
  updateShape_: () => void;
  saveExtraState: () => { parts: TransformPartName[] } | null;
  loadExtraState: (state: { parts?: TransformPartName[] }) => void;
  mutationToDom: () => Element;
  domToMutation: (xmlElement: Element) => void;
  decompose: (workspace: Blockly.Workspace) => Blockly.Block;
  compose: (containerBlock: Blockly.Block) => void;
  saveConnections: (containerBlock: Blockly.Block) => void;
};

type MutatorItemBlock = Blockly.Block & {
  valueConnection_?: Blockly.Connection | null;
};

const TRANSFORM_PARTS: TransformPart[] = [
  {
    name: "position",
    mutatorType: "transform_data_position_item",
    labelKey: "DATA_TRANSFORM_PART_POSITION",
  },
  {
    name: "rotate",
    mutatorType: "transform_data_rotate_item",
    labelKey: "DATA_TRANSFORM_PART_ROTATE",
  },
  {
    name: "scale",
    mutatorType: "transform_data_scale_item",
    labelKey: "DATA_TRANSFORM_PART_SCALE",
  },
];

const DEFAULT_TRANSFORM_PARTS = TRANSFORM_PARTS.map((part) => part.name);
const TRANSFORM_PART_BY_NAME = new Map(
  TRANSFORM_PARTS.map((part) => [part.name, part])
);
const TRANSFORM_PART_BY_MUTATOR_TYPE = new Map(
  TRANSFORM_PARTS.map((part) => [part.mutatorType, part])
);

function getLocalizedMessage(messageKey: string, fallback: string): string {
  const message = (
    Blockly.Msg as unknown as Record<string, Record<string, string> | string>
  )[messageKey];
  if (typeof message === "string") return message;
  return message?.[window.lg] || message?.["en-US"] || fallback;
}

function registerTransformMutatorBlocks(): void {
  if (!Blockly.Blocks.transform_data_mutator_container) {
    Blockly.Blocks.transform_data_mutator_container = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput().appendField(
          getLocalizedMessage(
            "DATA_TRANSFORM_MUTATOR_TITLE",
            "Edit transform data"
          )
        );
        this.appendStatementInput("STACK");
        this.setColour(DataType.colour);
        this.setTooltip(
          getLocalizedMessage("DATA_TRANSFORM_MUTATOR_TOOLTIP", "")
        );
        this.contextMenu = false;
      },
    };
  }

  for (const part of TRANSFORM_PARTS) {
    if (Blockly.Blocks[part.mutatorType]) continue;

    Blockly.Blocks[part.mutatorType] = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput().appendField(
          getLocalizedMessage(part.labelKey, part.name)
        );
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(DataType.colour);
        this.setTooltip(getLocalizedMessage("DATA_TRANSFORM_PART_TOOLTIP", ""));
        this.contextMenu = false;
      },
    };
  }
}

registerTransformMutatorBlocks();

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  getBlock(_parameters: unknown): object {
    const block = {
      init: function (this: TransformBlock) {
        this.transformParts_ = [...DEFAULT_TRANSFORM_PARTS];
        this.setOutput(true, "Transform");
        this.setColour(DataType.colour);
        this.setTooltip(
          getLocalizedMessage("DATA_TRANSFORM_MUTATOR_TOOLTIP", "")
        );
        this.setHelpUrl("");
        this.setMutator(
          new (Blockly as unknown as {
            icons: {
              MutatorIcon: new (
                blockList: string[],
                sourceBlock: Blockly.Block
              ) => Blockly.icons.MutatorIcon;
            };
          }).icons.MutatorIcon(
            TRANSFORM_PARTS.map((part) => part.mutatorType),
            this
          )
        );
        this.updateShape_();
      },
      saveExtraState: function (this: TransformBlock) {
        return { parts: this.transformParts_ };
      },
      loadExtraState: function (
        this: TransformBlock,
        state: { parts?: TransformPartName[] }
      ) {
        this.transformParts_ = normalizeTransformParts(state.parts);
        this.updateShape_();
      },
      mutationToDom: function (this: TransformBlock): Element {
        const container = document.createElement("mutation");
        container.setAttribute("parts", this.transformParts_.join(","));
        return container;
      },
      domToMutation: function (
        this: TransformBlock,
        xmlElement: Element
      ): void {
        this.transformParts_ = normalizeTransformParts(
          xmlElement.getAttribute("parts")?.split(",")
        );
        this.updateShape_();
      },
      decompose: function (
        this: TransformBlock,
        workspace: Blockly.Workspace
      ): Blockly.Block {
        const containerBlock = workspace.newBlock(
          "transform_data_mutator_container"
        ) as Blockly.BlockSvg;
        containerBlock.initSvg();

        let connection = containerBlock.getInput("STACK")?.connection || null;
        for (const partName of this.transformParts_) {
          const part = TRANSFORM_PART_BY_NAME.get(partName);
          if (!part || !connection) continue;

          const itemBlock = workspace.newBlock(part.mutatorType) as Blockly.BlockSvg;
          itemBlock.initSvg();
          if (!itemBlock.previousConnection) continue;

          connection.connect(itemBlock.previousConnection);
          connection = itemBlock.nextConnection;
        }

        return containerBlock;
      },
      compose: function (this: TransformBlock, containerBlock: Blockly.Block) {
        const parts: TransformPartName[] = [];
        const connections = new Map<TransformPartName, Blockly.Connection>();
        let itemBlock = containerBlock.getInputTargetBlock("STACK");

        while (itemBlock) {
          if (!itemBlock.isInsertionMarker()) {
            const part = TRANSFORM_PART_BY_MUTATOR_TYPE.get(itemBlock.type);
            if (part && !parts.includes(part.name)) {
              parts.push(part.name);
              const valueConnection = (itemBlock as MutatorItemBlock)
                .valueConnection_;
              if (valueConnection) {
                connections.set(part.name, valueConnection);
              }
            }
          }
          itemBlock = itemBlock.getNextBlock();
        }

        this.transformParts_ = parts;
        this.updateShape_();

        for (const [partName, connection] of connections) {
          connection.reconnect(this, partName);
        }
      },
      saveConnections: function (
        this: TransformBlock,
        containerBlock: Blockly.Block
      ) {
        let itemBlock = containerBlock.getInputTargetBlock("STACK");
        while (itemBlock) {
          const part = TRANSFORM_PART_BY_MUTATOR_TYPE.get(itemBlock.type);
          if (part) {
            const input = this.getInput(part.name);
            (itemBlock as MutatorItemBlock).valueConnection_ =
              input?.connection?.targetConnection || null;
          }
          itemBlock = itemBlock.getNextBlock();
        }
      },
      updateShape_: function (this: TransformBlock) {
        for (const part of TRANSFORM_PARTS) {
          if (this.getInput(part.name)) {
            this.removeInput(part.name);
          }
        }

        for (const partName of this.transformParts_) {
          const part = TRANSFORM_PART_BY_NAME.get(partName);
          if (!part) continue;

          this.appendValueInput(part.name)
            .setCheck("Vector3")
            .appendField(getLocalizedMessage(part.labelKey, part.name));
        }
        this.setInputsInline(false);
      },
    };
    return block;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const value_position = generator.valueToCode(
        block,
        "position",
        generator.ORDER_ATOMIC
      ) || "null";
      const value_scale = generator.valueToCode(
        block,
        "scale",
        generator.ORDER_ATOMIC
      ) || "null";
      const value_rotate = generator.valueToCode(
        block,
        "rotate",
        generator.ORDER_ATOMIC
      ) || "null";
      const code = `transform(${value_position}, ${value_rotate}, ${value_scale})`;
      return [code, generator.ORDER_NONE];
    };
    return script;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const value_position = generator.valueToCode(
        block,
        "position",
        generator.ORDER_ATOMIC
      ) || "nil";
      const value_scale = generator.valueToCode(
        block,
        "scale",
        generator.ORDER_ATOMIC
      ) || "nil";
      const value_rotate = generator.valueToCode(
        block,
        "rotate",
        generator.ORDER_ATOMIC
      ) || "nil";
      const code =
        "CS.MLua.Transform(" +
        value_position +
        ", " +
        value_rotate +
        ", " +
        value_scale +
        ")";
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      position: {
        shadow: {
          type: "vector3_data",
          inputs: {
            X: { shadow: { type: "math_number", fields: { NUM: 0 } } },
            Y: { shadow: { type: "math_number", fields: { NUM: 0 } } },
            Z: { shadow: { type: "math_number", fields: { NUM: 0 } } },
          },
        },
      },
      rotate: {
        shadow: {
          type: "vector3_data",
          inputs: {
            X: { shadow: { type: "math_number", fields: { NUM: 0 } } },
            Y: { shadow: { type: "math_number", fields: { NUM: 0 } } },
            Z: { shadow: { type: "math_number", fields: { NUM: 0 } } },
          },
        },
      },
      scale: {
        shadow: {
          type: "vector3_data",
          inputs: {
            X: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            Y: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            Z: { shadow: { type: "math_number", fields: { NUM: 1 } } },
          },
        },
      },
    },
  },
};

function normalizeTransformParts(
  parts: unknown
): TransformPartName[] {
  if (!Array.isArray(parts)) return [...DEFAULT_TRANSFORM_PARTS];

  const normalized: TransformPartName[] = [];
  for (const part of parts) {
    if (
      typeof part === "string" &&
      TRANSFORM_PART_BY_NAME.has(part as TransformPartName) &&
      !normalized.includes(part as TransformPartName)
    ) {
      normalized.push(part as TransformPartName);
    }
  }
  return normalized;
}

export default block;
