import TriggerType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "voice_trigger",
};

function getLocalizedCommandName(name) {
  const commandMap = {
    "scaleUp": Blockly.Msg.VOICE_TRIGGER_SCALE_UP[window.lg],
    "scaleDown": Blockly.Msg.VOICE_TRIGGER_SCALE_DOWN[window.lg],
    "decompose": Blockly.Msg.VOICE_TRIGGER_DECOMPOSE[window.lg],
    "reset": Blockly.Msg.VOICE_TRIGGER_RESET[window.lg],
    "nextStep": Blockly.Msg.VOICE_TRIGGER_NEXT_STEP[window.lg],
    "returnMain": Blockly.Msg.VOICE_TRIGGER_RETURN_MAIN[window.lg],
    "closeTooltip": Blockly.Msg.VOICE_TRIGGER_CLOSE_TOOLTIP[window.lg],
    "openTooltip": Blockly.Msg.VOICE_TRIGGER_OPEN_TOOLTIP[window.lg],
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
    console.log("Generated Block JSON:", JSON.stringify(json, null, 2));
    return json;
  },
  getBlock(parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        console.log("voice_trigger ++parameters:", parameters);
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
    console.error('${dropdown_option}')
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
