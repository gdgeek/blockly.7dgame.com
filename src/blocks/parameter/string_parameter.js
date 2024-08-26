
import EventType from './type'
import * as Helper from '../helper'
const data = {
  name: 'string_parameter'
}
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: 'block_type',
      message0: '字符参数 %1',
      args0: [
        {
          type: 'input_value',
          name: 'Input',
          inputsInline: true,
          check: 'String'
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
  getJavascript(parameters) {
    return this.getLua(parameters)
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var input = generator.valueToCode(
        block,
        'Input',
        generator.ORDER_NONE
      )

      return [Helper.String(input), generator.ORDER_NONE]
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block
