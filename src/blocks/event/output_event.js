
import EventType from './type'

const data = {
  name: 'output_event'
}
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: 'block_type',
      message0: '输出事件 %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'Output',
          options: function () {
            let opt = [['none', '']]

            if (resource && resource.events && resource.output.inputs) {
              const output = resource.events.output

              output.forEach(({ title, uuid }) => {
                opt.push([title, uuid])
              })
            }
            return opt
          }
        }
      ],
      previousStatement: null,
      nextStatement: null,
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
      var output_event = block.getFieldValue('Output')

      // TODO: Assemble Lua into code variable.
      var code =
        "_G.event.trigger(index,'" + output_event + "')\n"

      return code
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block
