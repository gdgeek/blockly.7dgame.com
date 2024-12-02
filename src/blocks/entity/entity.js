import DataType from "./type";
import * as Blockly from "blockly";
import { Handler } from "../helper";
import { HandlerJS } from "../helperJS";
const data = {
  name: "entity",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.ENTITY_ENTITY[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Entity",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.entity) {
              const entity = resource.entity;
              entity.forEach((ent) => {
                opt.push([ent.name, ent.uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Entity",
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
    const script = function (block, generator) {
      const dropdown = block.getFieldValue("Entity");
      // const code = `HandlerJS("${dropdown}")`;
      return [HandlerJS(dropdown), generator.ORDER_NONE];
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var dropdown = block.getFieldValue("Entity");

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
