
import EventType from './type'
const data = {
  name: 'system_task'
}
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(parameters) {
    const json = {
      type: 'block_type',
      message0: '系统方法： %1 参数 %2',
      args0: [
        {
          type: 'input_value',
          name: 'Input',
          inputsInline: true,
          check: 'String'
        },
        {
          type: 'input_value',
          name: 'Parameter',
          check: 'Parameter'
        }
      ],
      inputsInline: true,
      output: 'Task',
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
      var parameter = generator.valueToCode(
        block,
        'Parameter',
        generator.ORDER_ATOMIC
      )

      // TODO: Assemble Lua into code variable.
      var code = null
      if (parameter) {
        code = '_G.system.task(' + input + ',' + parameter + ')'
      } else {
        code = '_G.system.task(' + input + ')'
      }

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
