
import DataType from './type'
import { Handler } from '../helper'
const data = {
  name: 'polygen_entity'
}
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: '模型 %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'Polygen',
          options: function () {
            let opt = [['none', '']]
            if (resource && resource.polygen) {
              const polygen = resource.polygen
              polygen.forEach(poly => {
                opt.push([poly.name, poly.uuid])
              })
            }
            return opt
          }
        }
      ],
      output: 'Polygen',
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
      var dropdown_polygen = block.getFieldValue('Polygen')
      return [Handler(dropdown_polygen), generator.ORDER_NONE]
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block
