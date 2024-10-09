import Type from "./type";
import PictureEntity from "./picture_entity";
import { RegisterData, SetupIt } from "../helper";
const Category = {
  kind: "category",
  // name: "图片",
  name: "Picture",
  colour: Type.colour,
  contents: [PictureEntity.toolbox],
};

function Register(parameters) {
  RegisterData(PictureEntity, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
