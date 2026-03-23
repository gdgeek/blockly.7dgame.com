import DataType from "./type";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "play_video",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(_parameters: unknown): object {
    const json = {
      type: "block_type",
      message0: "播放视频 %1 同步 %2 独占 %3",
      args0: [
        {
          type: "input_value",
          name: "video",
          check: "Video",
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
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const script = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const video = generator.valueToCode(block, "video", generator.ORDER_NONE);
      const sync = block.getFieldValue("sync") === "TRUE";
      const occupy = block.getFieldValue("occupy") === "TRUE";

      const parameter = video + ", " + JSON.stringify(occupy);
      if (sync) {
        return `handleVideo(${JSON.stringify(parameter)})`;
      } else {
        return `handleVideo(${JSON.stringify(parameter)})`;
      }
    };
    return script;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const video = generator.valueToCode(block, "video", generator.ORDER_NONE);
      const sync = block.getFieldValue("sync") === "TRUE";
      const occupy = block.getFieldValue("occupy") === "TRUE";

      const parameter = video + ", " + JSON.stringify(occupy);

      if (sync) {
        return "_G.video.sync_play(" + parameter + ")\n";
      } else {
        return "_G.video.play(" + parameter + ")\n";
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
