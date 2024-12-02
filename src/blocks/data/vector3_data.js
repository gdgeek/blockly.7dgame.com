import * as Blockly from "blockly";
import DataType from "./type";
const data = {
  name: "vector3_data",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlock: function ({}) {
    const block = {
      init: function () {
        this.jsonInit({
          type: data.name,
          message0: "X %1 Y %2 Z %3",
          args0: [
            {
              type: "input_value",
              name: "X",
              check: "Number",
            },
            {
              type: "input_value",
              name: "Y",
              check: "Number",
            },
            {
              type: "input_value",
              name: "Z",
              check: "Number",
            },
          ],
          inputsInline: true,
          output: "Vector3",
          colour: DataType.colour,
          tooltip: "",
          helpUrl: "",
        });
      },
    };
    return block;
  },
  // getJavascript({}) {
  //   const javascript = function (block, generator) {
  //     return "aaa";
  //   };
  //   return javascript;
  // },
  getJavascript({}) {
    const javascript = function (block, generator) {
      const value_x = generator.valueToCode(block, "X", generator.ORDER_ATOMIC);
      const value_y = generator.valueToCode(block, "Y", generator.ORDER_ATOMIC);
      const value_z = generator.valueToCode(block, "Z", generator.ORDER_ATOMIC);
      const code = `new Vector3(${value_x}, ${value_y}, ${value_z})`;
      return [code, generator.ORDER_NONE];
    };
    return javascript;
  },
  getLua({}) {
    const lua = function (block, generator) {
      var value_x = generator.valueToCode(block, "X", generator.ORDER_ATOMIC);
      var value_y = generator.valueToCode(block, "Y", generator.ORDER_ATOMIC);
      var value_z = generator.valueToCode(block, "Z", generator.ORDER_ATOMIC);
      // TODO: Assemble Lua into code variable.
      var code = "CS.UnityEngine.Vector3(" + [value_x, value_y, value_z] + ")";
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
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
};
export default block;
