
import EventType from './type'
const data = {
  name: 'sleep_task'
}
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson(parameters) {
    const json = {
      type: 'block_type',
      message0: '休眠： %1 秒',
      args0: [
        {
          type: 'input_value',
          name: 'Time',
          check: 'Number'
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
      var time = generator.valueToCode(block, 'Time', generator.ORDER_NONE)

      // TODO: Assemble Lua into code variable.
      var code = null
      code = '_G.task.sleep(' + time + ')'
      return [code, generator.ORDER_NONE]
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block