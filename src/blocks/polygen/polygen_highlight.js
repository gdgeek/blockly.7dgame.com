import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "polygen_highlight",
};
const getColorOptions = () => {
  return [
    [Blockly.Msg.COLOR_NONE[window.lg], "none"],
    [Blockly.Msg.COLOR_WHITE[window.lg], "white"],
    [Blockly.Msg.COLOR_RED[window.lg], "red"],
    [Blockly.Msg.COLOR_ORANGE[window.lg], "orange"],
    [Blockly.Msg.COLOR_YELLOW[window.lg], "yellow"],
    [Blockly.Msg.COLOR_GREEN[window.lg], "green"],
    [Blockly.Msg.COLOR_CYAN[window.lg], "cyan"],
    [Blockly.Msg.COLOR_BLUE[window.lg], "blue"],
    [Blockly.Msg.COLOR_PURPLE[window.lg], "purple"],
  ];
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({}) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.POLYGEN_POLYGEN_HIGHLIGHT[window.lg],
      args0: [
        {
          type: "input_value",
          name: "entity",
          check: ["Polygen"],
        },
        
        {
          type: "input_value",
          name: "bool",
          check: "Boolean",
        },
        
        {
          type: "field_dropdown",
          name: "colorName",
          options: getColorOptions(),
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
  getBlock: function (parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);

        setTimeout(() => {
          this.updateColorOptions();
        }, 0);

        this.setOnChange((event) => {
          if (event.type === Blockly.Events.BLOCK_CHANGE || 
              event.type === Blockly.Events.BLOCK_MOVE) {
            this.updateColorOptions();
          }
        });
      },

      updateColorOptions: function () {
        const boolBlock = this.getInputTargetBlock('bool');
        const boolValue = boolBlock ? boolBlock.getFieldValue('BOOL') : false;

        // 获取colorName字段
        const field = this.getField('colorName');
        if (!field) return;

        // 根据bool值更新选项
        const newOptions = boolValue === 'TRUE' ? getColorOptions() : [[Blockly.Msg.COLOR_NONE[window.lg], "none"]];
        
        // 更新下拉菜单选项
        field.menuGenerator_ = newOptions;

        // 如果当前值不在新选项中，重置为none
        const currentValue = field.getValue();

        if (!newOptions.some(opt => opt[1] === currentValue)) {
          field.setValue("none");
        }

        field.forceRerender();
      }
    };
    return data;
  },
  getJavascript(parameters) {
    const script = function (block, generator) {
      const value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      const value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      const value_color = block.getFieldValue("colorName");

      const code = `polygen.setHighlight(${value_entity}, ${value_bool}, "${value_color}")\n`;
      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var value_entity = generator.valueToCode(
        block,
        "entity",
        generator.ORDER_NONE
      );
      var value_bool = generator.valueToCode(
        block,
        "bool",
        generator.ORDER_ATOMIC
      );
      var value_color = block.getFieldValue("colorName");
        
      var code =
        "_G.polygen.set_highlight(" + value_entity + ", " + value_bool + ", \"" + value_color + "\")\n";
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
