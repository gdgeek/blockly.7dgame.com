
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
export {
  RegisterData,
  Handler,
  InputEvent,
  OutputEvent,
  SetupIt
}
