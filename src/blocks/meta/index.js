import Type from './type'

import { RegisterData, SetupIt } from '../helper'
import MetaAction from './meta_action.js'
import RunTask from './run_task'

const Category = {
  kind: 'category',
  name: 'Meta',
  colour: Type.colour,
  contents: [
    MetaAction.toolbox,
    RunTask.toolbox,
  ]
}


function Register(parameters) {
  RegisterData(MetaAction, parameters)
  RegisterData(RunTask, parameters)
}
const Setup = SetupIt(Category, Register)
export { Setup }
