import DataType from "./type";

const data = {
  name: "tween_execute",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({}) {
    const json = {
      type: data.name,
      message0: "实体 %1 经过 %2 秒移动到 %3 %4 同步 %5 独占 %6",
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: "Entity",
        },
        {
          type: "field_number",
          name: "time",
          value: 0.3,
          min: 0,
          max: 1000,
        },
        {
          type: "input_dummy",
        },
        {
          type: "input_value",
          name: "transform",
          check: "Transform",
        },
        {
          type: "field_checkbox",
          name: "sync",
          checked: true,
        },
        {
          type: "field_checkbox",
          name: "occupy",
          checked: true,
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
      var entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_ATOMIC
      );
      var time = block.getFieldValue("time");
      var transform = generator.valueToCode(
        block,
        "transform",
        generator.ORDER_ATOMIC
      );

      var sync = block.getFieldValue("sync") === "TRUE";
      var occupy = block.getFieldValue("sync") === "TRUE";

      var parameter =
        entity + ", " + time + ", " + transform + ", " + JSON.stringify(occupy);
      if (sync) {
        return "_G.point.sync_tween(" + parameter + ")\n";
      } else {
        return "_G.point.tween(" + parameter + ")\n";
      }
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
