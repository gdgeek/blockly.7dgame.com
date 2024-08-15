import Type from './type'
import SoundEntity from './sound_entity'
import PlaySound from './play_sound'
import { RegisterData, SetupIt } from '../helper'


const Setup = SetupIt({
  kind: 'category',
  name: '音频',
  colour: Type.colour,
  contents: [SoundEntity.toolbox, PlaySound.toolbox]
}, (parameters) => {
  RegisterData(SoundEntity, parameters)
  RegisterData(PlaySound, parameters)
})
export { Setup }
