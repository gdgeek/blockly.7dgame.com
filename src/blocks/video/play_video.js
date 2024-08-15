import DataType from './type'

const data = {
  name: 'play_video'
}
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson(parameters) {
    const json = {
      type: 'block_type',
      message0: '播放视频 %1 同步 %2 独占 %3',
      args0: [
        {
          type: 'input_value',
          name: 'video',
          check: 'Video'
        },
        {
          type: 'field_checkbox',
          name: 'sync',
          checked: true
        },
        {
          type: 'field_checkbox',
          name: 'occupy',
          checked: true
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
      var video = generator.valueToCode(
        block,
        'video',
        generator.ORDER_NONE
      )
      var sync = block.getFieldValue('sync') === 'TRUE'
      var occupy = block.getFieldValue('occupy') === 'TRUE'

      var parameter = video + ', ' + JSON.stringify(occupy)

      if (sync) {
        return '_G.video.sync_play(' + parameter + ')\n'
      } else {
        return '_G.video.play(' + parameter + ')\n'
      }
    }
    return lua
  },
  toolbox: {
    kind: 'block',
    type: data.name
  }
}
export default block
