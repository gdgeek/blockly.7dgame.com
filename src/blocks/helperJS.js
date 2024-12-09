import * as Blockly from "blockly";
import * as Lua from "blockly/lua";
import * as Javascript from "blockly/javascript";

function RegisterData(data, parameters) {
  Blockly.Blocks[data.title] = data.getBlock(parameters);
  Lua.luaGenerator.forBlock[data.title] = data.getLua(parameters);
  Javascript.javascriptGenerator.forBlock[data.title] =
    data.getJavascript(parameters);
}

function HandlerJS(uuid) {
  return `helper.handler(index, '${uuid}')`;
}

function InputEventJS(uuid) {
  return `helper.inputEvent(index, '${uuid}')`;
}

function OutputEventJS(uuid) {
  return `helper.outputEvent(index, '${uuid}')`;
}

function NumberJS(value) {
  return `argument.number(${value})`;
}

function BooleanJS(value) {
  return `argument.boolean(${value})`;
}

function StringJS(value) {
  return `argument.string(${value})`;
}

function PointJS(value) {
  return `argument.point(${value})`;
}

function PlayerJS(type, value) {
  switch (type) {
    case "index":
      return `argument.index_player(${value})`;
    case "id":
      return `argument.id_player(${value})`;
    case "server":
      return `argument.server_player()`;
    case "random_client":
      return `argument.random_player()`;
    default:
      return `argument.server_player()`;
  }
}

function AnchorJS(key) {
  return `argument.anchor('${key}')`;
}

function RangeJS(anchor, radius) {
  return `argument.range(${anchor}, ${radius})`;
}

export {
  RegisterData,
  HandlerJS,
  InputEventJS,
  OutputEventJS,
  NumberJS,
  StringJS,
  BooleanJS,
  RangeJS,
  AnchorJS,
  PlayerJS,
  PointJS,
};
