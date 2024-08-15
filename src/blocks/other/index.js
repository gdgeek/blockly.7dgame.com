import Type from './type'
import SleepEntity from './sleep'
import { RegisterData, SetupIt } from '../helper'

const HelperCategory = {
  kind: 'category',
  name: '其他',
  colour: Type.colour,
  contents: [SleepEntity.toolbox]
}

function HelperRegister(parameters) {
  RegisterData(SleepEntity, parameters)
}
const Setup = SetupIt(HelperCategory, HelperRegister)
export { Setup }
