
import DataType from './type'
const data = {
  name: 'entity_explode'
}
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    const json = {
      type: 'block_type',
      message0: '实体 %1 爆炸展开 间距 %2',
      args0: [
        {
          type: 'input_value',
          name: 'entity',
          check: 'Entity'
        },
        {
          type: 'field_number',
          name: 'distance',
          value: '0.1'
        }
      ],
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
      var number_distance = block.getFieldValue('distance')
      var value_entity = generator.valueToCode(
        block,
        'entity',
        generator.ORDER_NONE
      )

      var code =
        'CS.MLua.Point.Explode(' + value_entity + ', ' + number_distance + ')\n'
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
