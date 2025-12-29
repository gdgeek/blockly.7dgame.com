import EventType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "output_mult_signal",
};

const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,

  getBlockJson({ resource }) {
    return {
      type: data.name,
      // 第一行：标题和输入口
      message0: (Blockly.Msg.SIGNAL_OUTPUT_MULT_SIGNAL?.[window.lg]),
      args0: [
        {
          type: "input_value",
          name: "LIST",
          check: "Array",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: EventType.colour,
      tooltip: "触发多个实体输入信号（传入一个信号列表）",
      helpUrl: "",
    };
  },

  getBlock(parameters) {
    const rootBlockDef = this; // 引用外部定义对象
    return {
      init() {
        this.jsonInit(rootBlockDef.getBlockJson(parameters));
      },

      // 核心逻辑：当块被拖入工作区时自动执行
      onchange(event) {
        // 仅在“创建块”事件、针对当前块、且不在左侧菜单预览时触发
        if (
          event.type === Blockly.Events.BLOCK_CREATE &&
          event.blockId === this.id &&
          !this.isInFlyout
        ) {
          const workspace = this.workspace;
          const listInput = this.getInput("LIST");

          // 确保输入口没有接东西，防止重复创建
          if (listInput && !listInput.connection.targetBlock()) {
            Blockly.Events.disable(); // 暂停事件追踪，将创建动作合并为一个原子操作
            try {
              // 1. 创建“列表块”
              const listBlock = workspace.newBlock("lists_create_with");
              // 设置为 2 个插槽
              if (listBlock.loadExtraState) {
                listBlock.loadExtraState({ itemCount: 2 });
              } else if (listBlock.updateShape_) {
                listBlock.updateShape_(2);
              }
              listBlock.initSvg();
              listBlock.render();

              // 连接到主块
              listInput.connection.connect(listBlock.outputConnection);

              // 2. 在第一个插槽 (ADD0) 创建一个阴影信号项
              const shadowBlock = workspace.newBlock("output_signal_item");
              shadowBlock.setShadow(true);
              shadowBlock.initSvg();
              shadowBlock.render();

              const add0Input = listBlock.getInput("ADD0");
              if (add0Input) {
                add0Input.connection.connect(shadowBlock.outputConnection);
              }

              // 如果需要第二个插槽也填入，可以取消下面代码的注释
              /*
              const shadowBlock2 = workspace.newBlock("output_signal_item");
              shadowBlock2.setShadow(true);
              shadowBlock2.initSvg();
              shadowBlock2.render();
              listBlock.getInput("ADD1").connection.connect(shadowBlock2.outputConnection);
              */

            } finally {
              Blockly.Events.enable(); // 恢复事件追踪
            }
          }
        }
      },
    };
  },

  getJavascript() {
    return function (block, generator) {
      const listCode = generator.valueToCode(block, "LIST", generator.ORDER_ATOMIC) || "[]";
      return `event.signal_array (${listCode});\n`;
    };
  },

  getLua() {
    return function (block, generator) {
      const listCode = generator.valueToCode(block, "LIST", generator.ORDER_ATOMIC) || "{}";
      return `_G.event.signal_array (${listCode})\n`;
    };
  },

  toolbox: {
    kind: "block",
    type: data.name, // 菜单里保持简洁，只显示一个块
  },
};

export default block;