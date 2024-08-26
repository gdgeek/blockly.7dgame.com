
import EventType from './type'

const data = {
  name: 'input_signal'
}
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: '接收信号 %1 %2 %3',
      args0: [
        {
          type: 'field_dropdown',
          name: 'Event',
          options: function () {
            let opt = [['none', '']]

            if (resource && resource.events && resource.events.outputs) {
              const outputs = resource.events.outputs

              outputs.forEach(({ title, index, uuid }) => {
                opt.push([title, index + ':' + uuid])
              })

            }
            return opt

          }
        },
        {
          type: 'input_dummy'
        },
        {
          type: 'input_statement',
          name: 'content'
        }
      ],
      colour: EventType.colour,
      tooltip: '',
      helpUrl: ''
    }
    return json
  },
  getBlock(parameters) {
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
      var dropdown_option = block.getFieldValue('Event')
      var statements_content = generator.statementToCode(block, 'content')


      var code =
        "verse['#" + dropdown_option + "'] = function(parameter) \n\
  is_playing = true\n\
  print('" +
        dropdown_option +
        "')\n" +
        statements_content +
        '  is_playing = false\n\
end\n'

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