import Blockly from 'blockly'
import EventType from './type'
const data = {
  name: 'system_parameter'
}
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: 'block_type',
      message0: '系统参数： %1',
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
  getLua() {
    const lua = function (block) {
      var input = Blockly.Lua.valueToCode(
        block,
        'Input',
        Blockly.Lua.ORDER_NONE
      )

      // TODO: Assemble Lua into code variable.
      var code = null

      code = '_G.system.parameter(' + input + ')'

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
