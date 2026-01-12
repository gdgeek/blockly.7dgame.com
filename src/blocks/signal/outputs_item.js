import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "output_signal_item",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,

  getBlockJson({ resource }) {
    return {
      type: EventType.name,
      message0: Blockly.Msg.SIGNAL_OUTPUT_SIGNAL_ITEM?.[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Output",
          options: function () {
            let opt = [["none", JSON.stringify({ index: "", uuid: "" })]];
            if (resource && resource.events && resource.events.outputs) {
              resource.events.outputs.forEach(({ title, index, uuid }) => {
                opt.push([title, JSON.stringify({ index, uuid })]);
              });
            }
            return opt;
          },
        },
      ],
      output: null,
      colour: EventType.colour,
      tooltip: "",
      helpUrl: "",
    };
  },

  getBlock(parameters) {
    const data = {
      init() {
        this.jsonInit(block.getBlockJson(parameters));
      },
    };
    return data;
  },

  getJavascript() {
    const script = function (block, generator) {
      const data = JSON.parse(block.getFieldValue("Output"));
      return [JSON.stringify(data), generator.ORDER_ATOMIC];
    };
    return script;
  },

  getLua() {
    const lua = function (block, generator) {
      const data = JSON.parse(block.getFieldValue("Output"));
      return [`{'${data.index}', '${data.uuid}' }`, generator.ORDER_ATOMIC];
    };
    return lua;
  },

  toolbox: {
    kind: "block",
    type: "output_signal_item",
  },
};

export default block;
