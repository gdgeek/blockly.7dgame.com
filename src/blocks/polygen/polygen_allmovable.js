import DataType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "polygen_allmovable",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: "block_type",
      message0: Blockly.Msg.POLYGEN_MOVABLE_ALL[window.lg],
      args0: [
        {
          type: "input_value",
          name: "movable",
          check: "Boolean",
        },
      ],
      inputsInline: true,
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

        // 保存可移动实体列表的属性
        this.movableEntities = [];

        // 监听块变化，以便在适当时机更新实体选项
        this.setOnChange((event) => {
          if (
            event.type === Blockly.Events.BLOCK_CHANGE ||
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.BLOCK_MOVE
          ) {
            this.updateEntityOptions(parameters.resource);
          }
        });
      },
      updateEntityOptions: function (resource) {
        if (!resource || !resource.polygen) return;

        // 筛选模型列表 - 只显示可移动的模型(moved为true)
        const filteredOptions = [["none", ""]];
        this.movableEntities = []; // 重置可移动实体列表

        resource.polygen.forEach((poly) => {
          // 只筛选 moved 属性为 true 的模型
          if (poly.moved === true) {
            filteredOptions.push([poly.name, poly.uuid]);
            this.movableEntities.push(poly.uuid);
          }
        });
      },
    };
    return data;
  },
  getJavascript(parameters) {
    const script = function (block, generator) {
      const value_movable = generator.valueToCode(
        block,
        "movable",
        generator.ORDER_ATOMIC
      );

      // 获取当前块实例上保存的可移动实体列表
      const movableEntities = block.movableEntities || [];

      let code;
      if (movableEntities.length > 0) {
        // 将每个UUID单独作为参数调用handlePolygen
        const handlerCalls = movableEntities
          .map((uuid) => `handlePolygen("${uuid}")`)
          .join(",\n    ");

        // 组合所有handler调用和value_movable参数
        code =
          `polygen.setAllMovable(` +
          "[\n" +
          handlerCalls +
          "], " +
          value_movable +
          ")\n";
      } else {
        // 如果没有可移动实体，传递空字符串
        code = `polygen.setAllMovable(handlePolygen(""), ${value_movable})\n`;
      }

      return code;
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var value_movable = generator.valueToCode(
        block,
        "movable",
        generator.ORDER_ATOMIC
      );

      // 获取当前块实例上保存的可移动实体列表
      const movableEntities = block.movableEntities || [];

      let code;
      if (movableEntities.length > 0) {
        // 将每个UUID单独作为参数调用_G.helper.handler
        const handlerCalls = movableEntities
          .map((uuid) => `_G.helper.handler(index, '${uuid}')`)
          .join(",\n  ");

        // 组合所有handler调用和value_movable参数
        code =
          "_G.polygen.set_all_movable(" +
          "{\n  " +
          handlerCalls +
          "\n}, " +
          value_movable +
          ")\n";
      } else {
        // 如果没有可移动实体，传递空字符串
        code =
          "_G.polygen.set_all_movable(_G.helper.handler(index, ''), " +
          value_movable +
          ")\n";
      }

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
