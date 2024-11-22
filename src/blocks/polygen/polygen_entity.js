import DataType from "./type";
import { Handler } from "../helper";
import * as Blockly from "blockly";

const data = {
  name: "polygen_entity",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.POLYGEN_POLYGEN_ENTITY[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Polygen",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.polygen) {
              const polygen = resource.polygen;
              polygen.forEach((poly) => {
                opt.push([poly.name, poly.uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Polygen",
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
        console.log("PolygenJSON: ", json);
        this.jsonInit(json);

        // 监听模型切换
        this.setOnChange(function () {
          const selectedUuid = this.getFieldValue("Polygen");

          // 只有在 Polygen 的 UUID 改变时，才触发更新事件
          if (this.selectedPolygenUuid !== selectedUuid) {
            console.log("Selected Polygen UUID: ", selectedUuid);
            this.selectedPolygenUuid = selectedUuid;

            // 触发更新事件
            Blockly.Events.fire(
              new Blockly.Events.BlockChange(
                this,
                "field",
                "Polygen",
                "",
                selectedUuid
              )
            );
          }
        });
      },
    };
    return data;
  },

  // getJavascript(parameters) {
  //   return this.getLua(parameters);
  // },
  getJavascript(parameters) {
    const javascript = function (block, generator) {
      var dropdown_polygen = block.getFieldValue("Polygen");
      return [
        `handlePolygen(${JSON.stringify(dropdown_polygen)});`,
        generator.ORDER_NONE,
      ];
    };
    return javascript;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var dropdown_polygen = block.getFieldValue("Polygen");
      return [Handler(dropdown_polygen), generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
