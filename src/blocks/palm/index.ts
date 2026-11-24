import type { Toolbox } from "../helper";
import { RegisterData } from "../helper";

const Type = { name: "Palm", colour: 265 };
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
          ? (zh ? "清空 %1 掌中宝" : "clear %1 palm exhibit")
          : (zh ? "设置 %1 掌中宝展品为 %2" : "set %1 palm exhibit to %2"),
        args0: [
          { type: "field_dropdown", name: "HAND", options: [
            [zh ? "右手" : "right", "right"], [zh ? "左手" : "left", "left"],
          ] },
          ...(clear ? [] : [{ type: "input_value", name: "polygen", check: ["Polygen", "Picture"] }]),
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: Type.colour,
        tooltip: clear
          ? (zh ? "清空所选手的掌中宝。" : "Clear the exhibit on the selected hand.")
          : (zh ? "替换所选手上的展品。图片朝向观众，模型自旋转。手离开视野时隐藏。" : "Replace this hand’s exhibit. Pictures face the viewer and models spin. The exhibit hides when tracking is lost."),
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
          ? `point.clearPalmModel(${b.getFieldValue("HAND") === "left" ? '"left"' : ""});\n`
          : `point.setPalmModel(${generator.valueToCode(b, "polygen", generator.ORDER_NONE) || "undefined"}${b.getFieldValue("HAND") === "left" ? ', "left"' : ""});\n`;
    },
    getLua() {
      return (b, generator) =>
        clear
          ? `_G.point.clear_palm_model(${b.getFieldValue("HAND") === "left" ? '"left"' : ""})\n`
          : `_G.point.set_palm_model(${generator.valueToCode(b, "polygen", generator.ORDER_NONE) || "nil"}${b.getFieldValue("HAND") === "left" ? ', "left"' : ""})\n`;
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

export function Setup(toolbox: Toolbox, parameters: unknown, authoring: boolean) {
  RegisterData(SetPalmModel, parameters);
  RegisterData(ClearPalmModel, parameters);
  if (authoring) toolbox.contents.push({
    kind: "category",
    name: window.lg.startsWith("zh") ? "掌中宝" : "Palm exhibits",
    colour: Type.colour,
    contents: [SetPalmModel.toolbox, ClearPalmModel.toolbox],
  });
}
