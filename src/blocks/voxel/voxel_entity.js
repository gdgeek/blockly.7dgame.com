import DataType from "./type";
import { Handler } from "../helper";
import * as Blockly from "blockly";

const data = {
  name: "voxel_entity",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.VOXEL_VOXEL[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Voxel",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.voxel) {
              const voxel = resource.voxel;
              voxel.forEach(({ name, uuid }) => {
                opt.push([name, uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Voxel",
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
      },
    };
    return data;
  },
  getJavascript(parameters) {
    return this.getLua(parameters);
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var dropdown = block.getFieldValue("Voxel");

      return [Handler(dropdown), generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
