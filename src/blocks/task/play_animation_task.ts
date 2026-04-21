import DataType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "play_animation_task",
} as const;

interface PolygenResource {
  uuid: string;
  animations?: string[];
}

interface BlockParameters {
  resource?: {
    polygen?: PolygenResource[];
  };
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as BlockParameters;
    const json = {
      type: data.name,
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["TASK_PLAY_ANIMATION_TASK"][window.lg],
      args0: [
        {
          type: "input_value",
          name: "polygen",
          check: "Polygen",
        },
        {
          type: "field_dropdown",
          name: "animation",
          options: [["none", "none"]],
        },
      ],
      output: "Task",
      colour: DataType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const blockParams = parameters as BlockParameters;
    const data = {
      init: function (this: Record<string, unknown>) {
        const json = block.getBlockJson!(parameters);
        (this as unknown as { jsonInit: (json: object) => void }).jsonInit(json);

        const animationField = (
          this as { getField: (name: string) => Record<string, unknown> | null }
        ).getField("animation");
        if (animationField) {
          animationField.doClassValidation_ = function (
            newValue: string
          ): string {
            return newValue;
          };
          animationField.getText = function (this: {
            getValue: () => string;
            getOptions: () => [string, string][];
          }): string {
            const currentValue = this.getValue();
            const matchingOption = this.getOptions().find(
              (opt: [string, string]) => opt[1] === currentValue
            );
            return matchingOption ? matchingOption[0] : currentValue;
          };
        }

        (this as Record<string, unknown>).lastPolygenUuid = null;

        (this as { setOnChange: (fn: () => void) => void }).setOnChange(() => {
          (
            this as {
              updateAnimationOptions: (
                resource: BlockParameters["resource"]
              ) => void;
            }
          ).updateAnimationOptions(blockParams.resource);
        });

        setTimeout(() => {
          (
            this as {
              updateAnimationOptions: (
                resource: BlockParameters["resource"]
              ) => void;
            }
          ).updateAnimationOptions(blockParams.resource);
        }, 0);
      },

      updateAnimationOptions: function (
        this: Record<string, unknown>,
        resource: BlockParameters["resource"]
      ): void {
        const polygenBlock = (
          this as {
            getInputTargetBlock: (
              name: string
            ) => { getFieldValue: (name: string) => string } | null;
          }
        ).getInputTargetBlock("polygen");
        const selectedPolygenUuid = polygenBlock
          ? polygenBlock.getFieldValue("Polygen")
          : "";

        const animationField = (
          this as { getField: (name: string) => Record<string, unknown> | null }
        ).getField("animation");
        if (!animationField) return;

        const currentValue = (
          animationField as { getValue: () => string }
        ).getValue();

        const modelChanged =
          this.lastPolygenUuid !== null &&
          this.lastPolygenUuid !== selectedPolygenUuid;

        this.lastPolygenUuid = selectedPolygenUuid;

        const options: [string, string][] = [["none", "none"]];

        if (resource && resource.polygen && selectedPolygenUuid) {
          resource.polygen.forEach((poly) => {
            if (poly.uuid === selectedPolygenUuid) {
              if (poly.animations && poly.animations.length > 0) {
                poly.animations.forEach((animation) => {
                  options.push([animation, animation]);
                });
              }
            }
          });
        }

        const valueExists = options.some((opt) => opt[1] === currentValue);
        if (!valueExists && currentValue !== "none") {
          options.push([currentValue, currentValue]);
        }

        animationField.menuGenerator_ = options;

        if (modelChanged) {
          (animationField as { setValue: (v: string) => void }).setValue(
            "none"
          );
        } else {
          (animationField as { setValue: (v: string) => void }).setValue(
            currentValue
          );
          (animationField as { forceRerender: () => void }).forceRerender();
        }
      },
    };
    return data;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const javascript = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const animation = block.getFieldValue("animation");
      const polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const parentBlock = (
        block as unknown as {
          getParent: () => {
            type: string;
            getInputTargetBlock: (name: string) => unknown;
          } | null;
        }
      ).getParent();
      const isAssignment =
        parentBlock &&
        (parentBlock.type === "variables_set" ||
          parentBlock.type === "math_change" ||
          (parentBlock.type === "lists_setIndex" &&
            block === parentBlock.getInputTargetBlock("TO")));
      const methodName = isAssignment ? "createTask" : "playTask";
      const code = `animation.${methodName}(${polygen}, ${JSON.stringify(
        animation
      )})`;
      return [code, generator.ORDER_NONE];
    };
    return javascript;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => [string, unknown] {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): [string, unknown] {
      const animation = block.getFieldValue("animation");
      const polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const code =
        "_G.polygen.play_animation_task(" +
        polygen +
        ", " +
        JSON.stringify(animation) +
        ")";
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      polygen: {
        block: {
          type: "polygen_entity",
        },
      },
    },
  },
};
export default block;
