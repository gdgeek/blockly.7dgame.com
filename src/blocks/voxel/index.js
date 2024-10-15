import Type from "./type";
import VoxelEntity from "./voxel_entity";
import { RegisterData, SetupIt } from "../helper";
import { VOXEL_NAME } from "../../localization/index";
const VoxelCategory = {
  kind: "category",
  // name: "体素",
  name: VOXEL_NAME[window.lg],
  colour: Type.colour,
  contents: [VoxelEntity.toolbox],
};
function VoxelRegister(parameters) {
  RegisterData(VoxelEntity, parameters);
  // RegisterData(PlayVideoCallback, parameters)
}
const Setup = SetupIt(VoxelCategory, VoxelRegister);
export { Setup };
