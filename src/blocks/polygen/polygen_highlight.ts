import DataType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "polygen_highlight",
} as const;

const getColorOptions = (): [string, string][] => {
  const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
  return [
    [Msg["COLOR_NONE"][window.lg], "none"],
    [Msg["COLOR_WHITE"][window.lg], "white"],
    [Msg["COLOR_RED"][window.lg], "red"],
    [Msg["COLOR_ORANGE"][window.lg], "orange"],
    [Msg["COLOR_YELLOW"][window.lg], "yellow"],
    [Msg["COLOR_GREEN"][window.lg], "green"],
    [Msg["COLOR_CYAN"][window.lg], "cyan"],
    [Msg["COLOR_BLUE"][window.lg], "blue"],
    [Msg["COLOR_PURPLE"][window.lg], "purple"],
  ];
};

interface HighlightBlockInstance {
  jsonInit: (json: object) => void;
  getInputTargetBlock: (name: string) => { getFieldValue: (name: string) => string } | null;
  getField: (name: string) => {
    menuGenerator_: [string, string][];
    getValue: () => string;
    setValue: (value: string) => void;
    forceRerender: () => void;
  } | null;
  setOnChange: (callback: (event: { type: string }) => void) => void;
  updateColorOptions: () => void;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
    const json = {
      type: "block_type",
      message0: Msg["POLYGEN_POLYGEN_HIGHLIGHT"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Polygen"],
        },
        {
          type: "input_value",
          name: "bool",
          check: "Boolean",
        },
        {
          type: "field_dropdown",
          name: "colorName",
          options: getColorOptions(),
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const data = {
      init: function (this: HighlightBlockInstance) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);

        setTimeout(() => {
          this.updateColorOptions();
        }, 0);

        this.setOnChange((event: { type: string }) => {
          if (
            event.type === Blockly.Events.BLOCK_CHANGE ||
            event.type === Blockly.Events.BLOCK_MOVE
          ) {
            this.updateColorOptions();
          }
        });
      },

      updateColorOptions: function (this: HighlightBlockInstance) {
        const boolBlock = this.getInputTargetBlock("bool");
        const boolValue = boolBlock ? boolBlock.getFieldValue("BOOL") : false;

        const field = this.getField("colorName");
        if (!field) return;

        const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
        const newOptions: [string, string][] =
          boolValue === "TRUE"
            ? getColorOptions()
            : [[Msg["COLOR_NONE"][window.lg], "none"]];

        field.menuGenerator_ = newOptions;

        const currentValue = field.getValue();

        if (!newOptions.some((opt) => opt[1] === currentValue)) {
          field.setValue("none");
        }

        field.forceRerender();
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
      const value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      const value_color = block.getFieldValue("colorName");

      const code = `polygen.setHighlight(${value_entity}, ${value_bool}, "${value_color}")\n`;
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
      const value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      const value_color = block.getFieldValue("colorName");

      const code =
        "_G.polygen.set_highlight(" +
        value_entity +
        ", " +
        value_bool +
        ', "' +
        value_color +
        '")\n';
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
          type: "polygen_entity",
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
