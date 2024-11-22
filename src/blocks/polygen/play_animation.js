import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "play_animation",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.POLYGEN_PLAY_ANIMATION[window.lg],
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
                    if (poly.animations) {
                      poly.animations.forEach((animation) => {
                        opt.push([animation, animation]);
                      });
                    } else {
                      opt.push(["none", "none"]);
                    }
                  }
                });
              } else {
                resource.polygen.forEach((poly) => {
                  if (poly.animations) {
                    poly.animations.forEach((animation) => {
                      opt.push([animation, animation]);
                    });
                  } else {
                    opt.push(["none", "none"]);
                  }
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
      previousStatement: null,
      nextStatement: null,
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

        // 模型切换获取更新对应动画选项
        this.setOnChange(() => {
          this.updateAnimationOptions(parameters.resource, block.getBlockJson);
        });
      },
      updateAnimationOptions: function (resource, getBlockJson) {
        // 获取连接的 polygen 块
        const polygenBlock = this.getInputTargetBlock("polygen");
        const selectedPolygenUuid = polygenBlock
          ? polygenBlock.getFieldValue("Polygen")
          : "";
        this.selectedPolygenUuid = selectedPolygenUuid;

        // 更新动画下拉框选项
        const field = this.getField("animation");

        // 获取新的选项
        const newOptions = getBlockJson({ resource }).args0[0].options.bind(
          this
        )();

        // 如果 none 选项没有在新选项中，确保它被加到选项里
        if (!newOptions.some((opt) => opt[1] === "none")) {
          newOptions.unshift(["none", "none"]);
        }

        // 设置新的选项
        field.menuGenerator_ = newOptions;

        // 设置字段的值，确保字段值在选项中
        const currentValue = field.getValue();
        if (!newOptions.some((opt) => opt[1] === currentValue)) {
          field.setValue("none"); // 如果当前值不可用，重置为 "none"
        } else {
          field.setValue(currentValue); // 否则保持当前值
        }
      },
    };
    return data;
  },
  // getJavascript(parameters) {
  //   return this.getLua(parameters);
  // },
  getJavascript(parameters) {
    const javascript = function (block, generator) {
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
  getLua(parameters) {
    const lua = function (block, generator) {
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
