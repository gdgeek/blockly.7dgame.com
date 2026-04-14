import Type from "./type";
import PictureEntity from "./picture_entity";
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";
import { PICTURE_NAME } from "../../localization/index";

const Category = {
  kind: "category",
  name: (PICTURE_NAME as Record<string, string>)[window.lg],
  colour: Type.colour,
  contents: [PictureEntity.toolbox],
};

function Register(parameters: unknown): void {
  RegisterData(PictureEntity as BlockDefinition, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
