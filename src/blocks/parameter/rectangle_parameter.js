import Blockly from 'blockly'
import EventType from './type'
import Helper from '../helper'
import Argument from '../argument'
const data = {
  name: 'rectangle_parameter'
}
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: 'block_type',
      message0: '范围随机点 %1 中点 %2 半径 %3 ',
      args0: [
        {
          type: 'input_dummy'
        },
        {
          type: 'input_value',
          name: 'Anchor',
          check: 'Parameter'
        },
        {
          type: 'field_number',
          name: 'Radius',
          value: 0.2,
          precision: 0.01
        }
      ],
      inputsInline: true,
      output: 'Parameter',
      colour: 230,
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
  getLua({ index }) {
    const lua = function (block, generator) {
      var value_anchor = Blockly.Lua.valueToCode(
        block,
        'Anchor',
        Blockly.Lua.ORDER_ATOMIC
      )

      // TODO: Assemble javascript into code variable.

      var number_radius = block.getFieldValue('Radius')
      var code = Argument.range(value_anchor, number_radius)
      // TODO: Change ORDER_NONE to the correct strength.

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
