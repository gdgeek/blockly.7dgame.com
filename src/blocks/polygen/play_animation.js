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
  getBlock: function (parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
        
        // 使用自定义验证器来允许保存的值即使不在选项中也能被保留
        const animationField = this.getField("animation");
        if (animationField) {
          animationField.doClassValidation_ = function(newValue) {
            // 允许任何值通过验证，这样刷新时保存的值就不会被重置
            return newValue;
          };
        }
        
        // 存储上一次选择的模型UUID，用于检测模型是否变化
        this.lastPolygenUuid = null;
        
        // 模型切换获取更新对应动画选项
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
          
        // 获取动画字段
        const animationField = this.getField("animation");
        if (!animationField) return;
        
        // 获取当前选中的值
        const currentValue = animationField.getValue();
        
        // 检测模型是否变化
        const modelChanged = this.lastPolygenUuid !== null && 
                           this.lastPolygenUuid !== selectedPolygenUuid;
        
        // 更新上一次选择的模型UUID
        this.lastPolygenUuid = selectedPolygenUuid;
        
        // 构建新的选项列表
        let options = [["none", "none"]];
        
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
        
        // 更新选项列表
        animationField.menuGenerator_ = options;
        
        // 如果模型已变化，重置为"none"；否则保持当前值
        if (modelChanged) {
          animationField.setValue("none");
        } else {
          // 确保当前值在选项中，如果不在则添加它
          const valueExists = options.some(opt => opt[1] === currentValue);
          if (!valueExists && currentValue !== "none") {
            options.push([currentValue, currentValue]);
            animationField.menuGenerator_ = options;
          }
          
          // 保持当前值不变
          animationField.setValue(currentValue);
        }
      },
    };
    return data;
  },
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
