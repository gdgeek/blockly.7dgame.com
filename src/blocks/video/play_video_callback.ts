import DataType from "./type";
import {
  quoteLuaString,
  type BlockDefinition,
  type BlocklyBlock,
  type BlocklyGenerator,
} from "../helper";

const data = {
  name: "play_video_callback",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: "播放视频 %1 独占 %2 %3 回调 %4",
      args0: [
        {
          type: "input_value",
          name: "video",
          check: "Video",
        },
        {
          type: "field_checkbox",
          name: "occupy",
          checked: true,
        },
        {
          type: "input_dummy",
        },
        {
          type: "input_statement",
          name: "callback",
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
  getBlock(parameters: unknown): object {
    const data = {
      init: function (this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
    return data;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const video =
        generator.valueToCode(block, "video", generator.ORDER_NONE) ||
        "undefined";
      const occupy = block.getFieldValue("occupy") === "TRUE";

      const callback = generator.statementToCode(block, "callback");
      return `await video.play(${video}, ${JSON.stringify(
        occupy
      )});\n${callback}`;
    };
    return script;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const value_video =
        generator.valueToCode(block, "video", generator.ORDER_NONE) || "nil";
      const statements_callback = generator.statementToCode(block, "callback");

      const checkbox_occupy = block.getFieldValue("occupy") === "TRUE";

      const code =
        "CS.MLua.Video.Play(" +
        value_video +
        ", " +
        JSON.stringify(checkbox_occupy) +
        ", " +
        quoteLuaString(statements_callback) +
        ")\n";
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
