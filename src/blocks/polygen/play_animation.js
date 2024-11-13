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
          options: [["none", ""]], // 默认选项，稍后动态更新
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

        // 设置块的更改事件
        this.setOnChange(() => {
          this.updateAnimationOptions(parameters.resource);
        });
      },
      updateAnimationOptions: function (resource) {
        // 获取连接的 polygen 块
        const polygenBlock = this.getInputTargetBlock("polygen");
        const selectedPolygenUuid = polygenBlock
          ? polygenBlock.getFieldValue("Polygen")
          : "";

        // 根据连接的 polygen 块的 UUID 获取动画选项
        let animationOptions = [["none", ""]];
        if (resource && resource.polygen) {
          const polygen = resource.polygen.find(
            (poly) => poly.uuid === selectedPolygenUuid
          );
          if (
            polygen &&
            polygen.animations &&
            Array.isArray(polygen.animations)
          ) {
            polygen.animations.forEach((animation) => {
              animationOptions.push([animation, animation]);
            });
          }
        }

        // 更新动画下拉选项
        const dropdownField = this.getField("animation");
        if (dropdownField) {
          // 设置新的选项生成器
          dropdownField.menuGenerator_ = () => animationOptions;

          // 强制刷新下拉框
          dropdownField.forceRerender();
        }
      },
    };
    return data;
  },
  getJavascript(parameters) {
    return this.getLua(parameters);
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
