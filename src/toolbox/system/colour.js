export default {
  kind: 'category',
  name: 'Color',
  colour: '%{BKY_COLOUR_HUE}',
  contents: [
    {
      kind: 'block',
      type: 'colour_picker'
    },
    {
      kind: 'block',
      type: 'colour_rgb'
    },
    {
      kind: 'block',
      type: 'colour_blend'
    }
  ]
}
