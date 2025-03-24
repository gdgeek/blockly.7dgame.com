import DataType from "./type";
const data = {
  name: "entity_unexploded",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    const json = {
      type: "block_type",
      // message0: "爆炸还原",
      message0: "爆炸还原 %1 ",
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: "Point",
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
      },
    };
    return data;
  },
  getJavascript(parameters) {
    return this.getLua(parameters);
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      var code = "CS.MLua.Point.Unexploded(" + value_entity + ")\n";
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
