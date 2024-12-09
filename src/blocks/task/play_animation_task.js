import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "play_animation_task",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      // message0: "播放动画 动画 %1 模型 %2 任务",
      message0: Blockly.Msg.TASK_PLAY_ANIMATION_TASK[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "animation",
          options: function () {
            let opt = [["none", "none"]];
            const selectedPolygenUuid = this.selectedPolygenUuid || "";

            if (resource && resource.polygen) {
              if (selectedPolygenUuid) {
                resource.polygen.forEach((poly) => {
                  if (poly.uuid === selectedPolygenUuid) {
                    if (poly.animations && poly.animations.length > 0) {
                      poly.animations.forEach((animation) => {
                        opt.push([animation, animation]);
                      });
                    }
                  }
                });
              } else {
                const allAnimations = new Set();
                resource.polygen.forEach((poly) => {
                  if (poly.animations && poly.animations.length > 0) {
                    poly.animations.forEach((animation) => {
                      allAnimations.add(animation);
                    });
                  }
                });
                Array.from(allAnimations).forEach((animation) => {
                  opt.push([animation, animation]);
                });
              }
            }
            return opt;
          },
        },
        {
          type: "input_value",
          name: "polygen",
          check: "Polygen",
        },
      ],
      output: "Task",
      colour: DataType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock: function (parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);

        this.setOnChange(() => {
          this.updateAnimationOptions(parameters.resource, block.getBlockJson);
        });
      },
      updateAnimationOptions: function (resource, getBlockJson) {
        const polygenBlock = this.getInputTargetBlock("polygen");
        const selectedPolygenUuid = polygenBlock
          ? polygenBlock.getFieldValue("Polygen")
          : "";
        this.selectedPolygenUuid = selectedPolygenUuid;

        const field = this.getField("animation");
        const newOptions = getBlockJson({ resource }).args0[0].options.bind(
          this
        )();
        field.menuGenerator_ = newOptions;

        const currentValue = field.getValue();
        if (!newOptions.some((opt) => opt[1] === currentValue)) {
          field.setValue("none");
        } else {
          field.setValue(currentValue); // 否则保持当前值
        }
      },
    };
    return data;
  },
  getJavascript(parameters) {
    const javascript = function (block, generator) {
      const animation = block.getFieldValue("animation");
      const polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );

      const parentBlock = block.getParent();
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
  getLua(parameters) {
    const lua = function (block, generator) {
      const animation = block.getFieldValue("animation");
      const polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      const code =
        "_G.animation.play_task(" +
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
  },
};
export default block;
