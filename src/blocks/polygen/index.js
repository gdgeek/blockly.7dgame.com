import Type from "./type";
import PolygenEntity from "./polygen_entity";
import PlayAnimation from "./play_animation";
import { RegisterData, SetupIt } from "../helper";
import { POLYGEN_NAME } from "../../localization/index";
const Category = {
  kind: "category",
  // name: "模型",
  name: POLYGEN_NAME[window.lg],
  colour: Type.colour,
  contents: [PolygenEntity.toolbox, PlayAnimation.toolbox],
};

function Register(parameters) {
  RegisterData(PolygenEntity, parameters);
  RegisterData(PlayAnimation, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
