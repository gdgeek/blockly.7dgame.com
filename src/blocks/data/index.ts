import Type from "./type";
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";
import { DATA_NAME } from "../../localization/index";
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

const Setup = SetupIt(Category, Register);
export { Setup };
