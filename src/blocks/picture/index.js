import Type from "./type";
import PictureEntity from "./picture_entity";
import { RegisterData, SetupIt } from "../helper";
import { PICTURE_NAME } from "../../localization/index";
const Category = {
  kind: "category",
  // name: "图片",
  name: PICTURE_NAME[window.lg],
  colour: Type.colour,
  contents: [PictureEntity.toolbox],
};

function Register(parameters) {
  RegisterData(PictureEntity, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
