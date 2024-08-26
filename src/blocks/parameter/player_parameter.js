
import EventType from './type'
import * as Helper from '../helper'
const data = {
  name: 'player_parameter'
}
const block = {
  title: data.name,
  type: EventType.name,
  colour: EventType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: 'block_type',
      message0: '玩家 %1 ,参数 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PlayerType',
          options: [
            ['索引', 'index'],
            ['Id', 'id'],
            ['服务器', 'server'],
            ['随机客户', 'random_client']
          ]
        },
        {
          type: 'input_value',
          name: 'Player',
          check: 'Number'
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
      var type = block.getFieldValue('PlayerType')

      var id = generator.valueToCode(
        block,
        'Player',
        generator.ORDER_ATOMIC
      )

      return [Helper.Player(type, id), generator.ORDER_NONE]
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block
