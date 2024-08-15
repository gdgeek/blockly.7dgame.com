

import TriggerType from './type'
const data = {
  name: 'init_trigger'
}
const block = {
  title: data.name,
  type: TriggerType.name,
  colour: TriggerType.colour,
  getBlock(parameters) {
    const block = {
      init: function () {
        this.jsonInit({
          type: data.name,
          message0: '销毁 %1 %2',
          args0: [
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
        })
      }
    }
    return block
  },
  getJavascript(parameters) {
    const script = function (block, generator) {
      return 'temp'
    }
    return script
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var statements_content = generator.statementToCode(block, 'content')
      // TODO: Assemble Lua into code variable.
      var code =
        "meta['@init'] = function() \n\
    print('@init')\n" +
        statements_content +
        'end\n'
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
