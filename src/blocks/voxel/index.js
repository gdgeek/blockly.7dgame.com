import Type from './type'
import VoxelEntity from './voxel_entity'
import { RegisterData, SetupIt } from '../helper'

const VoxelCategory = {
  kind: 'category',
  name: '体素',
  colour: Type.colour,
  contents: [
    VoxelEntity.toolbox,
  ]
}
function VoxelRegister(parameters) {
  RegisterData(VoxelEntity, parameters)
  // RegisterData(PlayVideoCallback, parameters)
}
const Setup = SetupIt(VoxelCategory, VoxelRegister)
export { Setup }
