import DataType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "play_animation",
} as const;

interface ResourcePolygen {
  name: string;
  uuid: string;
  animations?: string[];
}

interface BlockParameters {
  resource?: {
    polygen?: ResourcePolygen[];
  };
}

interface AnimationDropdownField {
  doClassValidation_: (newValue: string) => string;
  getText: () => string;
  getValue: () => string;
  setValue: (value: string) => void;
  getOptions: () => [string, string][];
  menuGenerator_: [string, string][];
  forceRerender: () => void;
}

interface PlayAnimationBlockInstance {
  jsonInit: (json: object) => void;
  lastPolygenUuid: string | null;
  getField: (name: string) => AnimationDropdownField | null;
  getInputTargetBlock: (name: string) => {
    getFieldValue: (name: string) => string;
  } | null;
  setOnChange: (callback: () => void) => void;
  updateAnimationOptions: (resource: BlockParameters["resource"]) => void;
}

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
    const json = {
      type: data.name,
      message0: Msg["POLYGEN_PLAY_ANIMATION"][window.lg],
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
      init: function (this: PlayAnimationBlockInstance) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);

        const animationField = this.getField("animation");

        if (animationField) {
          animationField.doClassValidation_ = function (newValue: string): string {
            return newValue;
          };

          animationField.getText = function (this: AnimationDropdownField): string {
            const currentValue = this.getValue();
            const matchingOption = this.getOptions().find(
              (opt) => opt[1] === currentValue
            );
            return matchingOption ? matchingOption[0] : currentValue;
          };
        }

        this.lastPolygenUuid = null;

        this.setOnChange(() => {
          this.updateAnimationOptions(typedParams.resource);
        });

        setTimeout(() => {
          this.updateAnimationOptions(typedParams.resource);
        }, 0);
      },

      updateAnimationOptions: function (
        this: PlayAnimationBlockInstance,
        resource: BlockParameters["resource"]
      ) {
        const polygenBlock = this.getInputTargetBlock("polygen");
        const selectedPolygenUuid = polygenBlock
          ? polygenBlock.getFieldValue("Polygen")
          : "";

        const animationField = this.getField("animation");
        if (!animationField) return;

        const currentValue = animationField.getValue();

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
          animationField.setValue("none");
        } else {
          animationField.setValue(currentValue);
          animationField.forceRerender();
        }
      },
    };
    return data;
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const javascript = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const text_animation = block.getFieldValue("animation");
      const value_polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const code = `polygen.playAnimation(${value_polygen}, ${JSON.stringify(
        text_animation
      )});\n`;
      return code;
    };
    return javascript;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const text_animation = block.getFieldValue("animation");
      const value_polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const code = `_G.polygen.play_animation(${value_polygen}, ${JSON.stringify(
        text_animation
      )})\n`;
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
