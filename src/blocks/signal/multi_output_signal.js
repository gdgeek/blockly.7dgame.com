import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "output_mult_signal",
};

const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,

  getBlockJson({ resource }) {
    return {
      type: data.name,
      message0: Blockly.Msg.SIGNAL_OUTPUT_MULT_SIGNAL?.[window.lg],
      args0: [
        {
          type: "input_value",
          name: "LIST",
          check: "Array", // 连接 list block
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: EventType.colour,
      tooltip: "触发多个信号（传入一个信号列表）",
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
      const listCode =
        generator.valueToCode(block, "LIST", generator.ORDER_ATOMIC) || "[]";
      const code = `event.signal_array (${listCode});\n`;
      return code;
    };
    return script;
  },

  getLua() {
    const lua = function (block, generator) {
      const listCode =
        generator.valueToCode(block, "LIST", generator.ORDER_ATOMIC) || "{}";
      const code = `_G.event.signal_array (${listCode})\n`;
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
