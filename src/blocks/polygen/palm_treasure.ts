import Type from "./type";
import type { BlockDefinition } from "../helper";

function definition(clear: boolean): BlockDefinition {
  const block: BlockDefinition = {
    title: clear ? "clear_palm_model" : "set_palm_model",
    type: Type.name,
    colour: Type.colour,
    getBlockJson() {
      const zh = window.lg === "zh-CN" || window.lg === "zh-TW";
      return {
        type: block.title,
        message0: clear
          ? zh
            ? "清空掌中宝"
            : "clear palm exhibit"
          : zh
            ? "设置掌中宝模型为 %1"
            : "set palm exhibit model to %1",
        args0: clear
          ? []
          : [{ type: "input_value", name: "polygen", check: "Polygen" }],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: Type.colour,
        tooltip: zh
          ? clear
            ? "清空当前模型并隐藏掌中宝。"
            : "替换唯一的掌中宝模型。右手进入摄像头追踪范围时自动显示、跟随掌心自旋转并带环绕；右手消失即隐藏，重新出现会再次显示。不会移动场景原模型。"
          : clear
            ? "Clear the selection and hide the palm exhibit."
            : "Select the only palm exhibit. It follows the tracked right palm, spins with an orbit effect, and hides immediately when the palm is lost. Replaces the previous selection without moving the scene model.",
        helpUrl: "",
      };
    },
    getBlock(parameters) {
      return {
        init(this: { jsonInit: (value: object) => void }) {
          this.jsonInit(block.getBlockJson!(parameters));
        },
      };
    },
    getJavascript() {
      return (b, generator) =>
        clear
          ? "point.clearPalmModel();\n"
          : `point.setPalmModel(${generator.valueToCode(b, "polygen", generator.ORDER_NONE) || "undefined"});\n`;
    },
    getLua() {
      return (b, generator) =>
        clear
          ? "_G.point.clear_palm_model()\n"
          : `_G.point.set_palm_model(${generator.valueToCode(b, "polygen", generator.ORDER_NONE) || "nil"})\n`;
    },
    toolbox: {
      kind: "block",
      type: clear ? "clear_palm_model" : "set_palm_model",
      ...(clear
        ? {}
        : { inputs: { polygen: { block: { type: "polygen_entity" } } } }),
    },
  };
  return block;
}
export const SetPalmModel = definition(false);
export const ClearPalmModel = definition(true);
