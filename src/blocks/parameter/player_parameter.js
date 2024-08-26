import Blockly from 'blockly'
import EventType from './type'
import Helper from '../helper'
import Argument from '../argument'
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
  getLua() {
    const lua = function (block) {
      var type = block.getFieldValue('PlayerType')

      var id = Blockly.Lua.valueToCode(
        block,
        'Player',
        Blockly.Lua.ORDER_ATOMIC
      )

      return [Argument.player(type, id), Blockly.Lua.ORDER_NONE]
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block
