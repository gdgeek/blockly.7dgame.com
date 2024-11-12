import DataType from "./type";
import * as Blockly from "blockly";
import { selectedPolygenUuid } from "./polygen_entity";

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
            let opt = [["none", ""]];
            if (resource && resource.polygen) {
              console.log("polygenResource", resource);
              // 如果选择了模型，则只显示该 polygen 的动画数据
              if (selectedPolygenUuid) {
                resource.polygen.forEach((poly) => {
                  if (poly.uuid === selectedPolygenUuid) {
                    if (poly.animations) {
                      poly.animations.forEach((animation) => {
                        opt.push([animation, animation]);
                      });
                    } else {
                      opt.push(["none", ""]);
                    }
                  }
                });
              } else {
                // 如果没有绑定模型，显示所有 polygen 的动画数据
                resource.polygen.forEach((poly) => {
                  if (poly.animations) {
                    poly.animations.forEach((animation) => {
                      opt.push([animation, animation]);
                    });
                  } else {
                    opt.push(["none", ""]);
                  }
                });
              }
            }
            console.log("opt", opt);
            return opt;
          },
        },
        {
          type: "input_value",
          name: "polygen",
          check: "Polygen",
        },
      ],
      output: "Polygen",
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
      },
    };
    return data;
  },
  getJavascript(parameters) {
    return this.getLua(parameters);
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var text_animation = block.getFieldValue("animation");
      var value_polygen = generator.valueToCode(
        block,
        "polygen",
        generator.ORDER_NONE
      );
      var code =
        "_G.polygen.play_animation(" +
        value_polygen +
        "," +
        JSON.stringify(text_animation) +
        ")\n";
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
