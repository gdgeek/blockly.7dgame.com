import DataType from "./type";

const data = {
  name: "line_execute",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    const json = {
      type: data.name,
      message0: "从 %1 连线到 %2",
      args0: [
        {
          type: "input_value",
          name: "from",
          check: "Point",
        },
        {
          type: "input_value",
          name: "to",
          check: "Point",
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
      },
    };
    return data;
  },
  getJavascript(parameters) {
    return this.getLua(parameters);
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var value_from = generator.valueToCode(
        block,
        "from",
        generator.ORDER_ATOMIC
      );
      var value_to = generator.valueToCode(block, "to", generator.ORDER_ATOMIC);
      // TODO: Assemble Lua into code variable.
      var code = "CS.MLua.Helper.Lined(" + value_from + ", " + value_to + ")\n";
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
