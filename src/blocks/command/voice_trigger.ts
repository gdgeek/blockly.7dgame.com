import TriggerType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "voice_trigger",
} as const;

interface ResourceAction {
  name: string;
  uuid: string;
  type: string;
}

interface BlockParameters {
  resource?: {
    action?: ResourceAction[];
  };
}

function getLocalizedCommandName(name: string): string {
  const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
  const commandMap: Record<string, string> = {
    //通用指令
    scaleUp: Msg["VOICE_TRIGGER_SCALE_UP"][window.lg],
    scaleDown: Msg["VOICE_TRIGGER_SCALE_DOWN"][window.lg],
    decompose: Msg["VOICE_TRIGGER_DECOMPOSE"][window.lg],
    reset: Msg["VOICE_TRIGGER_RESET"][window.lg],
    goBack: Msg["VOICE_TRIGGER_GO_BACK"][window.lg],

    //教育项目
    nextStep: "下一步",
    returnMain: "返回主界面",
    closeTooltip: "关闭说明卡",
    openTooltip: "显示说明卡",
    vertical: "垂直展示",
    horizontal: "水平展示",
    hidden: "隐藏模式",
    visible: "显示模式",
    showYuelu: "展示岳麓山校区",
    showLunan: "展示麓南校区",
    showXiaoxiang: "展示潇湘校区",
    showTianxin: "展示天心校区",
    showXinglin: "展示杏林校区",
    showKaifu: "展示开福校区",
    bgmOn: "打开背景音乐",
    bgmOff: "关闭背景音乐",
    sandboxFxOn: "打开沙盘特效",
    sandboxFxOff: "关闭沙盘特效",
    sandboxRotateOn: "打开沙盘旋转",
    sandboxRotateOff: "关闭沙盘旋转",
    campusIntroOff: "关闭校区介绍",
    campusIntroOn: "打开校区介绍",
    //反欺凌项目
    mockFace: "像怪物",
    almostCrying: "他快哭了",
    stopBullying: "别再欺负他",
    carefulHeard: "小心被听到",
    stillResisting: "还想反抗",
    goCheck: "东西被拿了去看看",
    wishfulThinking: "想得美",
    tooMuch: "太过分了",
    ostracizing: "在搞孤立",
    whatsHappening: "出事了去看看",
  };

  return commandMap[name] || name;
}

const block: BlockDefinition = {
  title: data.name,
  type: TriggerType.name,
  colour: TriggerType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as BlockParameters;
    const json = {
      type: data.name,
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["VOICE_TRIGGER"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Voice",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.action) {
              const action = resource.action;
              action.forEach(({ name, uuid, type }: ResourceAction) => {
                if (type === "Voice") {
                  if (name) {
                    opt.push([getLocalizedCommandName(name), uuid]);
                  } else {
                    opt.push([uuid, uuid]);
                  }
                }
              });
            }
            return opt;
          },
        },
        {
          type: "input_dummy",
        },
        {
          type: "input_statement",
          name: "content",
        },
      ],
      colour: TriggerType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const data = {
      init: function () {
        const current = this as unknown as { jsonInit: (_json: object) => void };
        const json = block.getBlockJson!(parameters);
        current.jsonInit(json);
      },
    };
    return data;
  },
  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const javascript = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const dropdown_option = block.getFieldValue("Voice");
      const statements_content = generator.statementToCode(block, "content");
      const code = `
  meta['@${dropdown_option}'] = async function(parameter) {
    let isPlaying = true
    ${statements_content}
    isPlaying = false
  };
  `;
      return code;
    };
    return javascript;
  },
  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (
      block: BlocklyBlock,
      generator: BlocklyGenerator
    ): string {
      const dropdown_option = block.getFieldValue("Voice");
      const statements_content = generator.statementToCode(block, "content");

      const code =
        "meta['@" +
        dropdown_option +
        "'] = function(parameter) \n\
  is_playing = true\n\
  print('" +
        dropdown_option +
        "')\n\
" +
        statements_content +
        "\n\
  is_playing = false\n\
end\n";

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
