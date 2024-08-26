import Blockly from 'blockly'
import EventType from './type'
import Helper from '../helper'
import Argument from '../argument'
const data = {
  name: 'point_parameter'
}
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: 'block_type',
      message0: '位置参数 %1',
      args0: [
        {
          type: 'input_value',
          name: 'Input',
          inputsInline: true,
          check: 'Vector3'
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
      var input = Blockly.Lua.valueToCode(
        block,
        'Input',
        Blockly.Lua.ORDER_NONE
      )
      return [Argument.point(input), Blockly.Lua.ORDER_NONE]
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block
