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
      message0: "aaaaa",// Blockly.Msg.TASK_PLAY_ANIMATION_TASK[window.lg],
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
  getBlock: function (parameters) {

    const data = {
      init: function () {
        alert("init play animation task");
        const json = block.getBlockJson(parameters);
        this.jsonInit(json); 
        const animationField = this.getField("animation");
        if (animationField) {
          animationField.doClassValidation_ = function(newValue) {
            return newValue;
          };
          animationField.getText = function() {
            const currentValue = this.getValue();
            const matchingOption = this.getOptions().find(opt => opt[1] === currentValue);
            return matchingOption ? matchingOption[0] : currentValue;
          };
        }
        
        this.lastPolygenUuid = null;
        
        this.setOnChange(() => {
          this.updateAnimationOptions(parameters.resource);
        });
        
        setTimeout(() => {
          this.updateAnimationOptions(parameters.resource);
        }, 0);
      },
      
      updateAnimationOptions: function (resource) {
  
        const polygenBlock = this.getInputTargetBlock("polygen");
        const selectedPolygenUuid = polygenBlock
          ? polygenBlock.getFieldValue("Polygen")
          : "";
          
        const animationField = this.getField("animation");
        if (!animationField) return;
        
        const currentValue = animationField.getValue();
        
        const modelChanged = this.lastPolygenUuid !== null && 
                           this.lastPolygenUuid !== selectedPolygenUuid;
        
        this.lastPolygenUuid = selectedPolygenUuid;
        
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

        const valueExists = options.some(opt => opt[1] === currentValue);
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
  },
};
export default block;
