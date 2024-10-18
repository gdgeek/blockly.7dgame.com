import * as Blockly from "blockly";
import * as Lua from "blockly/lua";
import DataType from "./type";
const data = {
  name: "transform_data",
};
const block = {
  title: data.name,
  type: DataType.name,
  getBlock({ }) {
    const block = {
      init: function () {
        this.jsonInit({
          type: data.name,
          message0: Blockly.Msg.DATA_TRANSFORM_DATA[window.lg],
          args0: [
            {
              type: "input_value",
              name: "position",
              check: "Vector3",
            },
            {
              type: "input_value",
              name: "rotate",
              check: "Vector3",
            },
            {
              type: "input_value",
              name: "scale",
              check: "Vector3",
            },
          ],
          inputsInline: false,
          output: "Transform",
          colour: DataType.colour,
          tooltip: "",
          helpUrl: "",
        });
      },
    };
    return block;
  },
  getJavascript({ }) {
    const script = function (block, generator) {
      return ["", generator.ORDER_NONE];
    };
    return script;
  },
  getLua({ }) {
    const lua = function (block, generator) {

      var value_position = generator.valueToCode(
        block,
        "position",
        generator.ORDER_ATOMIC
      );
      var value_scale = generator.valueToCode(
        block,
        "scale",
        generator.ORDER_ATOMIC
      );
      var value_rotate = generator.valueToCode(
        block,
        "rotate",
        generator.ORDER_ATOMIC
      );
      // TODO: Assemble Lua into code variable.
      var code =
        "CS.MLua.Transform(" +
        value_position +
        ", " +
        value_rotate +
        ", " +
        value_scale +
        ")";
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
    inputs: {
      position: {
        shadow: {
          type: "vector3_data",
          inputs: {
            X: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 0,
                },
              },
            },
            Y: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 0,
                },
              },
            },
            Z: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 0,
                },
              },
            },
          },
        },
      },
      rotate: {
        shadow: {
          type: "vector3_data",
          inputs: {
            X: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 0,
                },
              },
            },
            Y: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 0,
                },
              },
            },
            Z: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 0,
                },
              },
            },
          },
        },
      },
      scale: {
        shadow: {
          type: "vector3_data",
          inputs: {
            X: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 1,
                },
              },
            },
            Y: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 1,
                },
              },
            },
            Z: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
      },
    },
  },
};
export default block;
