import Type from './type'

import InputEvent from './input_event.js'
import OutputEvent from './output_event.js'
import { RegisterData, SetupIt } from '../helper'
const Category = {
  kind: 'category',
  name: 'Event',
  colour: Type.colour,
  contents: [InputEvent.toolbox, OutputEvent.toolbox]
}


function Register(parameters) {
  RegisterData(InputEvent, parameters)
  RegisterData(OutputEvent, parameters)
}
const Setup = SetupIt(Category, Register)
export { Setup }
