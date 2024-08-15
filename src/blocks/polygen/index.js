import Type from './type'
import PolygenEntity from './polygen_entity'
import PlayAnimation from './play_animation'
import { RegisterData, SetupIt } from '../helper'
const Category = {
  kind: 'category',
  name: '模型',
  colour: Type.colour,
  contents: [PolygenEntity.toolbox,
  PlayAnimation.toolbox]
}

function Register(parameters) {
  RegisterData(PolygenEntity, parameters)
  RegisterData(PlayAnimation, parameters)
}
const Setup = SetupIt(Category, Register)
export { Setup }
