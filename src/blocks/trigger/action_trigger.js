

import TriggerType from './type'

const data = {
  name: 'action_trigger'
}
const block = {
  title: data.name,
  type: TriggerType.name,
  colour: TriggerType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: '动作 %1 %2 %3',
      args0: [
        {
          type: 'field_dropdown',
          name: 'Action',
          options: function () {
            let opt = [['none', '']]
            if (resource && resource.action) {
              const action = resource.action
              alert(JSON.stringify(action))
              action.forEach(({ name, uuid }) => {

                if (name) {
                  opt.push([name, uuid])
                }

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
      colour: TriggerType.colour,
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
      var dropdown_option = block.getFieldValue('Action')
      var statements_content = generator.statementToCode(block, 'content')


      var code =
        "meta['@" + dropdown_option + "'] = function(parameter) \n\
  is_playing = true\n\
  print('" + dropdown_option + "')\n\
" + statements_content + '\n\
  is_playing = false\n\
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
