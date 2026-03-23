import DataType from "./type";
const data = {
  name: "module_to_transform_data",
};
const block = {
  title: data.name,
  type: DataType.name,
  getBlock({}) {
    const block = {
      init: function () {
        this.jsonInit({
          type: data.name,
          message0: "空间数据 %1",
          args0: [
            {
              type: "input_value",
              name: "entity",
              check: "Entity",
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
  getLua({ index: _index }) {
    const lua = function (block, generator) {
      var value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );

      var code = "CS.MLua.Point.ToTransformData(" + value_entity + ")\n";
      // return code
      // var code = 'CS.UnityEngine.Vector3()'
      // TODO: Change ORDER_NONE to the correct strength.
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
