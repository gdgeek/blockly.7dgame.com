import EventType from "./type";
import * as Blockly from "blockly";
import type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
} from "../helper";

const data = {
  name: "output_mult_signal",
} as const;

const block: BlockDefinition = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,

  getBlockJson(_parameters: unknown): object {
    return {
      type: data.name,
      message0: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["SIGNAL_OUTPUT_MULT_SIGNAL"]?.[window.lg],
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
      tooltip: (
        Blockly.Msg as unknown as Record<string, Record<string, string>>
      )["SIGNAL_OUTPUT_MULT_SIGNAL_TOOLTIP"]?.[window.lg],
      helpUrl: "",
    };
  },

  getBlock(parameters: unknown): object {
    const rootBlockDef = this as BlockDefinition; // 引用外部定义对象
    return {
      init(this: { jsonInit: (json: object) => void }) {
        this.jsonInit(rootBlockDef.getBlockJson!(parameters));
      },

      // 核心逻辑：当块被拖入工作区时自动执行
      onchange(
        this: {
          id: string;
          isInFlyout: boolean;
          workspace: Blockly.Workspace;
          getInput: (name: string) => Blockly.Input | null;
        },
        event: Blockly.Events.Abstract
      ) {
        // 仅在"创建块"事件、针对当前块、且不在左侧菜单预览时触发
        if (
          event.type === Blockly.Events.BLOCK_CREATE &&
          (event as Blockly.Events.BlockCreate).blockId === this.id &&
          !this.isInFlyout
        ) {
          const workspace = this.workspace;
          const listInput = this.getInput("LIST");

          // 确保输入口没有接东西，防止重复创建
          if (listInput && !listInput.connection?.targetBlock()) {
            Blockly.Events.disable(); // 暂停事件追踪，将创建动作合并为一个原子操作
            try {
              // 1. 创建"列表块"
              const listBlock = workspace.newBlock(
                "lists_create_with"
              ) as Blockly.BlockSvg;
              // 设置为 2 个插槽
              if (
                (
                  listBlock as unknown as {
                    loadExtraState?: (state: object) => void;
                  }
                ).loadExtraState
              ) {
                (
                  listBlock as unknown as {
                    loadExtraState: (state: object) => void;
                  }
                ).loadExtraState({ itemCount: 2 });
              } else if (
                (
                  listBlock as unknown as {
                    updateShape_?: (count: number) => void;
                  }
                ).updateShape_
              ) {
                (
                  listBlock as unknown as {
                    updateShape_: (count: number) => void;
                  }
                ).updateShape_(2);
              }
              listBlock.initSvg();
              listBlock.render();

              // 连接到主块
              listInput.connection!.connect(listBlock.outputConnection!);

              // 2. 在第一个插槽 (ADD0) 创建一个阴影信号项
              const shadowBlock = workspace.newBlock(
                "output_signal_item"
              ) as Blockly.BlockSvg;
              shadowBlock.setShadow(true);
              shadowBlock.initSvg();
              shadowBlock.render();

              const add0Input = listBlock.getInput("ADD0");
              if (add0Input) {
                add0Input.connection!.connect(shadowBlock.outputConnection!);
              }
            } finally {
              Blockly.Events.enable(); // 恢复事件追踪
            }
          }
        }
      },
    };
  },

  getJavascript(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const listCode =
        generator.valueToCode(block, "LIST", generator.ORDER_ATOMIC) || "[]";
      return `event.signal_array (${listCode});\n`;
    };
  },

  getLua(
    _parameters: unknown
  ): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    return function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const listCode =
        generator.valueToCode(block, "LIST", generator.ORDER_ATOMIC) || "{}";
      return `_G.event.signal_array (${listCode})\n`;
    };
  },

  toolbox: {
    kind: "block",
    type: data.name, // 菜单里保持简洁，只显示一个块
  },
};

export default block;
