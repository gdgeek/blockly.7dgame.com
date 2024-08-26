import Blockly from 'blockly'
import EventType from './type'
import Helper from '../helper'
const data = {
  name: 'parameters'
}
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: 'block_type',
      message0: '参数列表 %1',
      args0: [
        {
          type: 'input_value',
          name: 'ParameterArray',
          check: 'Array'
        }
      ],
      inputsInline: true,
      output: 'Parameter',
      colour: EventType.colour,
      tooltip: '',
      helpUrl: ''
    }
    return json
  },
  getBlock: function (parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters)
        this.jsonInit(json)
      }
    }
    return data
  },
  getLua() {
    const lua = function (block) {
      var array = Blockly.Lua.valueToCode(
        block,
        'ParameterArray',
        Blockly.Lua.ORDER_ATOMIC
      )

      var code = '_G.helper.parameters(' + array + ')\n'

      return [code, Blockly.Lua.ORDER_NONE]
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block
