import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "output_signal",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.SIGNAL_OUTPUT_SIGNAL[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Output",
          options: function () {
            let opt = [["none", JSON.stringify({ index: "", uuid: "" })]];
            if (resource && resource.events && resource.events.outputs) {
              const output = resource.events.outputs;
              output.forEach(({ title, index, uuid }) => {
                opt.push([title, JSON.stringify({ index, uuid })]);
              });
            }
            return opt;
          },
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: EventType.colour,
      tooltip: Blockly.Msg.SIGNAL_OUTPUT_SIGNAL_TOOLTIP[window.lg],
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
    const script = function (block, generator) {
      var output_event = block.getFieldValue("Output");
      const data = JSON.parse(output_event);
      var code = `event.signal('${data.index}', '${data.uuid}');\n`;
      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var output_event = block.getFieldValue("Output");
      const data = JSON.parse(output_event);
      var code = "_G.event.signal('" + data.index + "', '" + data.uuid + "')\n";
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
