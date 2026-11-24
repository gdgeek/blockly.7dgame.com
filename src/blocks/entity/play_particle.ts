import DataType from "./type";
import type { BlockDefinition } from "../helper";

const messages: Record<string, [string, string]> = {
  "zh-CN": [
    "节点 %1 特效 %2",
    "直接选择特效，无需添加组件。金色流光仅用于模型，可与粒子同时播放。停止流光恢复原材质，停止环绕不影响其他特效。此积木不等待播放结束。",
  ],
  "zh-TW": [
    "節點 %1 特效 %2",
    "直接選擇特效，無需新增元件。流光和粒子可同時播放、分別啟停。此積木不等待播放結束。",
  ],
  "en-US": [
    "%1 effect %2",
    "Select an effect without adding a component. Gold flow and particle effects can play together and be controlled separately. This block continues immediately.",
  ],
  "ja-JP": [
    "%1 のエフェクト %2",
    "コンポーネントの追加なしでテンプレートを選択できます。複数のテンプレートを同時に再生でき、終了を待たずに次へ進みます。",
  ],
  "th-TH": [
    "เอฟเฟกต์ของ %1 %2",
    "เลือกเทมเพลตได้โดยไม่ต้องเพิ่มคอมโพเนนต์ เล่นได้หลายเทมเพลตพร้อมกันและไม่รอให้เล่นจบ",
  ],
};

const modes = ["orbit", "gather", "scatter", "rise", "stopOrbit", "flowOn", "flowOff"] as const;
const labels: Record<string, string[]> = {
  "zh-CN": ["播放环绕", "播放汇聚", "播放消散", "播放出场光点", "停止环绕", "开启金色流光", "停止金色流光"],
  "zh-TW": ["播放環繞", "播放匯聚", "播放消散", "播放出場光點", "停止環繞", "開啟金色流光", "停止金色流光"],
  "en-US": ["Play orbit", "Play gather", "Play scatter", "Play entrance sparkles", "Stop orbit", "Start gold flow", "Stop gold flow"],
  "ja-JP": ["周回を再生", "集合を再生", "拡散を再生", "登場の光を再生", "周回を停止", "金色の光を開始", "金色の光を停止"],
  "th-TH": ["เล่นโคจร", "เล่นรวมตัว", "เล่นกระจายตัว", "เล่นประกายเปิดตัว", "หยุดโคจร", "เปิดแสงสีทอง", "หยุดแสงสีทอง"],
};

function selectedMode(block: { getFieldValue(name: string): string }) {
  const mode = block.getFieldValue("PRESET");
  return modes.find((value) => value === mode) ?? modes[0];
}

const block: BlockDefinition = {
  title: "play_particle",
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson() {
    const [message0, tooltip] = messages[window.lg] || messages["en-US"];
    return {
      type: "play_particle",
      message0,
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: [
            "Entity",
            "Polygen",
            "Picture",
            "Video",
            "Text",
            "Voxel",
            "Sound",
          ],
        },
        {
          type: "field_dropdown",
          name: "PRESET",
          options: modes.map((mode, index) => [(labels[window.lg] || labels["en-US"])[index], mode]),
        },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
      tooltip,
      helpUrl: "",
    };
  },
  getBlock(parameters) {
    return {
      init(this: { jsonInit: (json: object) => void }) {
        this.jsonInit(block.getBlockJson!(parameters));
      },
    };
  },
  getJavascript() {
    return (block, generator) => {
      const target = generator.valueToCode(block, "entity", generator.ORDER_NONE) || "undefined";
      const mode = selectedMode(block);
      return mode === "flowOn" || mode === "flowOff"
        ? `point.setFlowGlow(${target}, ${mode === "flowOn"});\n`
        : `point.playParticle(${target}, ${JSON.stringify(mode)});\n`;
    };
  },
  getLua() {
    return (block, generator) => {
      const target = generator.valueToCode(block, "entity", generator.ORDER_NONE) || "nil";
      const mode = selectedMode(block);
      return mode === "flowOn" || mode === "flowOff"
        ? `_G.point.set_flow_glow(${target}, ${mode === "flowOn"})\n`
        : `_G.point.play_particle(${target}, ${JSON.stringify(mode)})\n`;
    };
  },
  toolbox: {
    kind: "block",
    type: "play_particle",
    fields: { PRESET: "orbit" },
    inputs: { entity: { block: { type: "entity" } } },
  },
};
export default block;
