
import DataType from './type'

const data = {
  name: 'sleep'
}
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson() {
    const json = {
      type: data.name,
      message0: '休眠 %1 秒',
      args0: [
        {
          type: 'field_number',
          name: 'time',
          value: 0.3,
          min: 0,
          max: 1000
        }
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: DataType.colour,
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
      var time = block.getFieldValue('time')
      return '_G.helper.sync_sleep(' + time + ')\n'
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block
