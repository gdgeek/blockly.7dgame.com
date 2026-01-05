import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "output_event",
};
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.EVENT_OUTPUT[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Output",
          options: function () {
            let opt = [["none", ""]];

            if (resource && resource.events && resource.events.outputs) {
              const output = resource.events.outputs;

              output.forEach(({ title, uuid }) => {
                opt.push([title, uuid]);
              });
            }
            return opt;
          },
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: EventType.colour,
      tooltip: Blockly.Msg.EVENT_OUTPUT_TOOLTIP[window.lg],
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
      const output_event = block.getFieldValue("Output");

      const code = `event.trigger(index, '${output_event}', parameter);`;
      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var output_event = block.getFieldValue("Output");
      // TODO: Assemble Lua into code variable.
      var code = "_G.event.trigger(index,'" + output_event + "', parameter)\n";
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
