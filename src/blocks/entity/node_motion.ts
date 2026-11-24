import * as Blockly from "blockly";
import Type from "./type";
import type { BlockDefinition, BlocklyBlock } from "../helper";

function settings(block: BlocklyBlock): string {
  if (block.getFieldValue("MOTION") === "stopFloat") return "0, 0";
  return `${Number(block.getFieldValue("AMPLITUDE"))}, ${Number(block.getFieldValue("PERIOD"))}`;
}

const motion: BlockDefinition = {
  title: "node_motion", type: Type.name, colour: Type.colour,
  toolbox: { kind: "block", type: "node_motion", inputs: { entity: { block: { type: "entity" } } } },
  getBlock() {
    return { init(this: Blockly.Block) {
      const zh = window.lg.startsWith("zh");
      this.jsonInit({
        type: "node_motion", colour: Type.colour,
        message0: zh ? "节点 %1 动效 %2" : "%1 motion %2",
        args0: [
          { type: "input_value", name: "entity", check: ["Entity", "Polygen", "Picture", "Video", "Text", "Voxel", "Sound"] },
          { type: "field_dropdown", name: "MOTION", options: [
            [zh ? "开始上下浮动" : "Start bobbing", "float"],
            [zh ? "停止上下浮动" : "Stop bobbing", "stopFloat"],
          ] },
        ],
        inputsInline: true, previousStatement: null, nextStatement: null,
      });
      const options = this.appendDummyInput("FLOAT_SETTINGS")
        .appendField(zh ? "振幅（厘米）" : "Amplitude (cm)")
        .appendField(new Blockly.FieldNumber(1, 0, Infinity, 0.1), "AMPLITUDE")
        .appendField(zh ? "周期（秒）" : "Period (s)")
        .appendField(new Blockly.FieldNumber(3, 0.1, Infinity, 0.1), "PERIOD");
      const showSettings = (mode: string) => {
        const visible = mode === "float" && !this.isCollapsed();
        if (visible !== options.isVisible()) {
          options.setVisible(visible);
          if ((this as Blockly.BlockSvg).rendered) void (this as Blockly.BlockSvg).queueRender();
        }
      };
      this.getField("MOTION")!.setValidator(value => { showSettings(String(value)); return value; });
      this.setOnChange(() => showSettings(this.getFieldValue("MOTION")));
    } };
  },
  getLua: () => (block, gen) =>
    `_G.point.set_float(${gen.valueToCode(block, "entity", gen.ORDER_NONE) || "nil"}, ${settings(block)})\n`,
  getJavascript: () => (block, gen) =>
    `point.setFloat(${gen.valueToCode(block, "entity", gen.ORDER_NONE) || "undefined"}, ${settings(block)});\n`,
};
export default motion;
