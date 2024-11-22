import * as Blockly from "blockly";
import * as Lua from "blockly/lua";
import * as Javascript from "blockly/javascript";

// Register Data function for registering blocks and generators
function RegisterData(data, parameters) {
  Blockly.Blocks[data.title] = data.getBlock(parameters);
  Lua.luaGenerator.forBlock[data.title] = data.getLua(parameters);
  Javascript.javascriptGenerator.forBlock[data.title] =
    data.getJavascript(parameters);
}

// Helper function to generate code for different events and handlers
function HandlerJS(uuid) {
  return `helperJS.handlerJS(index, '${uuid}')`; // JavaScript style
}

function InputEventJS(uuid) {
  return `helperJS.inputEventJS(index, '${uuid}')`;
}

function OutputEventJS(uuid) {
  return `helperJS.outputEventJS(index, '${uuid}')`;
}

// Number function to generate argument code
function NumberJS(value) {
  return `argument.number(${value})`; // JavaScript style
}

// Boolean function to generate argument code
function BooleanJS(value) {
  return `argument.boolean(${value})`;
}

// String function to generate argument code
function StringJS(value) {
  return `argument.string(${value})`;
}

// Point function to generate argument code
function PointJS(value) {
  return `argument.point(${value})`;
}

// Player function to generate player argument code based on type
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

// Anchor function to generate anchor argument code
function AnchorJS(key) {
  return `argument.anchor('${key}')`;
}

// Range function to generate range argument code
function RangeJS(anchor, radius) {
  return `argument.range(${anchor}, ${radius})`;
}

// Export all functions
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
