
import DataType from './type'

import { Handler } from '../helper'
const data = {
  name: 'entity'
}
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: '实体 %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'Entity',
          options: function () {
            let opt = [['none', '']]
            if (resource && resource.entity) {
              const entity = resource.entity
              entity.forEach(ent => {
                opt.push([ent.name, ent.uuid])
              })
            }
            return opt
          }
        }
      ],
      output: 'Entity',
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
      var dropdown = block.getFieldValue('Entity')

      return [Handler(dropdown), generator.ORDER_NONE]
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block