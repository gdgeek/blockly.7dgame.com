import DataType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const defaultDissolveDuration = 1.5;
const oppositeDirections = new Map([
  ["0", "4"],
  ["1", "3"],
  ["2", "5"],
  ["3", "1"],
  ["4", "0"],
  ["5", "2"],
]);

export function oppositeDissolveDirection(direction: string): string | undefined {
  return oppositeDirections.get(direction);
}

export function fadeDuration(block: BlocklyBlock): number {
  const effect = block.getFieldValue?.("EFFECT");
  if (effect !== "fade" && effect !== "dissolve") return 0;
  const field = effect === "dissolve" ? "DISSOLVE_DURATION" : "DURATION";
  const value = Number(block.getFieldValue(field) ?? NaN);
  if (Number.isFinite(value)) {
    return Math.max(0.1, Math.min(12.7, Math.round(value * 10) / 10));
  }
  return effect === "dissolve" ? defaultDissolveDuration : 0.5;
}

export function transitionArguments(
  block: BlocklyBlock,
  duration = fadeDuration(block),
): string {
  if (!duration) return "";
  if (block.getFieldValue("EFFECT") !== "dissolve") return `, ${duration}`;
  const direction = block.getFieldValue("DISSOLVE_DIRECTION");
  const reverse = oppositeDissolveDirection(direction);
  return `, ${duration}, "dissolve", ${reverse === undefined ? "0" : direction}, ${reverse ?? "4"}`;
}

const data = {
  name: "visual_execute",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["ENTITY_VISUAL_EXECUTE"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Entity", "Polygen", "Picture", "Video", "Text"],
        },
        {
          type: "input_dummy",
          name: "VISIBILITY_LABEL",
        },
        {
          type: "input_value",
          name: "bool",
          check: "Boolean",
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
      init: function (this: Blockly.Block) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
        const zh = window.lg === "zh-CN" || window.lg === "zh-TW";
        const durationLabel = zh ? "时长（秒）" : "Duration (seconds)";
        const canAuthor = (parameters as { tourismAuthoring?: boolean } | null)?.tourismAuthoring !== false;
        const effectSettings = this.appendDummyInput("EFFECT_SETTINGS")
          .appendField(zh ? "过渡" : "Transition")
          .appendField(
            new Blockly.FieldDropdown([
              [zh ? "无" : "None", "instant"],
              [zh ? "渐变" : "Fade", "fade"],
              [zh ? "溶解" : "Dissolve", "dissolve"],
            ]),
            "EFFECT",
          );
        const duration = this.appendDummyInput("FADE_SETTINGS")
          .appendField(durationLabel)
          .appendField(
            new Blockly.FieldNumber(0.5, 0.1, 12.7, 0.1),
            "DURATION",
          );
        const directions = this.appendDummyInput("DISSOLVE_SETTINGS")
          .appendField(
            new Blockly.FieldDropdown([
              [zh ? "从左到右" : "Left to right", "0"],
              [zh ? "从右到左" : "Right to left", "4"],
              [zh ? "从下到上" : "Bottom to top", "1"],
              [zh ? "从上到下" : "Top to bottom", "3"],
              [zh ? "从中间往四周" : "Center outward", "2"],
              [zh ? "从四周往中间" : "Outside inward", "5"],
            ]),
            "DISSOLVE_DIRECTION",
          )
          .appendField(durationLabel)
          .appendField(
            new Blockly.FieldNumber(defaultDissolveDuration, 0.1, 12.7, 0.1),
            "DISSOLVE_DURATION",
          );
        this.moveInputBefore("DISSOLVE_SETTINGS", "FADE_SETTINGS");
        this.setInputsInline(true);
        const update = () => {
          const effect = this.getFieldValue("EFFECT");
          const expanded = canAuthor && !this.isCollapsed();
          const visible = expanded && effect === "fade";
          const showDirections = expanded && effect === "dissolve";
          if (effectSettings.isVisible() !== expanded) effectSettings.setVisible(expanded);
          if (directions.isVisible() !== showDirections) {
            directions.setVisible(showDirections);
            if ((this as Blockly.BlockSvg).rendered)
              void (this as Blockly.BlockSvg).queueRender();
          }
          if (duration.isVisible() !== visible) {
            duration.setVisible(visible);
            if ((this as Blockly.BlockSvg).rendered)
              void (this as Blockly.BlockSvg).queueRender();
          }
        };
        this.setOnChange(update);
        update();
      },
    };
    return data;
  },
  getJavascript(
    _parameters: unknown,
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator,
    ): string {
      const value_entity =
        generator.valueToCode(block, "entity", generator.ORDER_NONE) ||
        "undefined";
      const value_bool =
        generator.valueToCode(block, "bool", generator.ORDER_ATOMIC) || "false";

      const duration = fadeDuration(block);
      const code = `point.setVisual(${value_entity}, ${value_bool}${transitionArguments(block, duration)});\n`;
      return code;
    };
    return script;
  },
  getLua(
    _parameters: unknown,
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator,
    ): string {
      const value_entity =
        generator.valueToCode(block, "entity", generator.ORDER_NONE) || "nil";
      const value_bool =
        generator.valueToCode(block, "bool", generator.ORDER_ATOMIC) || "false";
      const code =
        "_G.point.set_visual(" +
        value_entity +
        ", " +
        value_bool +
        transitionArguments(block, fadeDuration(block)) +
        ")\n";
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
          type: "entity",
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
