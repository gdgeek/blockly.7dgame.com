
import * as Blockly from 'blockly';
import * as Lua from 'blockly/lua';
import * as Javascript from 'blockly/javascript';

function RegisterData(data, parameters) {
  Blockly.Blocks[data.title] = data.getBlock(parameters)
  Lua.luaGenerator.forBlock[data.title] = data.getLua(parameters)
  Javascript.javascriptGenerator.forBlock[data.title] = data.getJavascript(parameters)

}
function Handler(uuid) {
  return "_G.helper.handler(index, '" + uuid + "')"
}
function InputEvent(uuid) {
  return "_G.helper.input_event(index, '" + uuid + "')"
}
function OutputEvent(uuid) {
  return "_G.helper.output_event(index, '" + uuid + "')"
}
const SetupIt = (category, register) => {
  const func = (toolbox, parameters) => {
    toolbox.contents.push(category)
    register(parameters)
  }
  return func
}

function Number(value) {
  return '_G.argument.number(' + value + ')'
}
function Boolean(value) {
  return '_G.argument.boolean(' + value + ')'
}
function String(value) {
  return '_G.argument.string(' + value + ')'
}


function Point(value) {
  return '_G.argument.point(' + value + ')'
}

function Player(type, value) {
  switch (type) {
    case 'index':
      return '_G.argument.index_player(' + value + ')'
    case 'id':
      return '_G.argument.id_player(' + value + ')'
    case 'server':
      return '_G.argument.server_player()'
    case 'random_client':
      return '_G.argument.random_player()'
  }
  return '_G.argument.server_player()'
}

function Anchor(key) {
  return "_G.argument.anchor('" + key + "')"
}
function Range(anchor, radius) {
  return '_G.argument.range(' + anchor + ', ' + radius + ')'
}


export {
  RegisterData,
  Handler,
  InputEvent,
  OutputEvent,
  SetupIt,
  Number,
  String,
  Boolean,
  Range,
  Anchor,
  Player,
  Point
}
