import Type from "./type";
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";
import { DATA_NAME } from "../../localization/index";
import ReadTransform from "./module_to_transform_data";
import type { Toolbox } from "../helper";
import Vector3Data from "./vector3_data";
import TransformData from "./transform_data";

const Category = {
  kind: "category",
  name: DATA_NAME[window.lg as keyof typeof DATA_NAME],
  colour: Type.colour,
  contents: [Vector3Data.toolbox, TransformData.toolbox],
};

function Register(parameters: unknown): void {
  RegisterData(Vector3Data as BlockDefinition, parameters);
  RegisterData(TransformData as BlockDefinition, parameters);
}

function Setup(toolbox: Toolbox, parameters: unknown) {
  const { tourismAuthoring } = parameters as { tourismAuthoring?: boolean };
  SetupIt({ ...Category, contents: tourismAuthoring ? [...Category.contents, ReadTransform.toolbox] : Category.contents }, Register)(toolbox, parameters);
  RegisterData(ReadTransform, parameters);
}
export { Setup };
