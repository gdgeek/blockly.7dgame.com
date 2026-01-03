import TriggerType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "voice_trigger",
};

function getLocalizedCommandName(name) {
  const commandMap = {
    //通用指令
    scaleUp: Blockly.Msg.VOICE_TRIGGER_SCALE_UP[window.lg],
    scaleDown: Blockly.Msg.VOICE_TRIGGER_SCALE_DOWN[window.lg],
    decompose: Blockly.Msg.VOICE_TRIGGER_DECOMPOSE[window.lg],
    reset: Blockly.Msg.VOICE_TRIGGER_RESET[window.lg],
    goBack: Blockly.Msg.VOICE_TRIGGER_GO_BACK[window.lg],

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

const block = {
  title: data.name,
  type: TriggerType.name,
  colour: TriggerType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.VOICE_TRIGGER[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Voice",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.action) {
              const action = resource.action;
              action.forEach(({ name, uuid, type }) => {
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
  getBlock(parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        //console.log("voice_trigger ++parameters:", parameters);
        this.jsonInit(json);
      },
    };
    return data;
  },
  getJavascript(parameters) {
    const javascript = function (block, generator) {
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
  getLua(parameters) {
    const lua = function (block, generator) {
      var dropdown_option = block.getFieldValue("Voice");
      var statements_content = generator.statementToCode(block, "content");

      var code =
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
