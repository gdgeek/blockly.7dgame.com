import Type from "./type";
import PolygenEntity from "./polygen_entity";
import PlayAnimation from "./play_animation";
import { RegisterData, SetupIt } from "../helper";
import { POLYGEN_NAME } from "../../localization/index";
import PolygenHighlight from "./polygen_highlight";
const Category = {
  kind: "category",
  // name: "模型",
  name: POLYGEN_NAME[window.lg],
  colour: Type.colour,
  contents: [PolygenEntity.toolbox, PlayAnimation.toolbox, PolygenHighlight.toolbox],
};

function Register(parameters) {
  RegisterData(PolygenEntity, parameters);
  RegisterData(PlayAnimation, parameters);
  RegisterData(PolygenHighlight, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
