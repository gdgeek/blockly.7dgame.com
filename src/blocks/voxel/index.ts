import Type from "./type";
import VoxelEntity from "./voxel_entity";
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";
import { VOXEL_NAME } from "../../localization/index";

const VoxelCategory = {
  kind: "category",
  name: (VOXEL_NAME as Record<string, string>)[window.lg],
  colour: Type.colour,
  contents: [VoxelEntity.toolbox],
};

function VoxelRegister(parameters: unknown): void {
  RegisterData(VoxelEntity as BlockDefinition, parameters);
}

const Setup = SetupIt(VoxelCategory, VoxelRegister);
export { Setup };
