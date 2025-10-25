import Type from "./type";
import PolygenEntity from "./polygen_entity";
import PlayAnimation from "./play_animation";
import { RegisterData, SetupIt } from "../helper";
import { POLYGEN_NAME } from "../../localization/index";
import PolygenHighlight from "./polygen_highlight";
import PolygenMovable from "./polygen_movable";
import PolygenAllMovable from "./polygen_allmovable";
import PolygenRotatable from "./polygen_rotatable";

const Category = {
  kind: "category",
  // name: "模型",
  name: POLYGEN_NAME[window.lg],
  colour: Type.colour,
  contents: [
    PolygenEntity.toolbox,
    PlayAnimation.toolbox,
    PolygenHighlight.toolbox,
     PolygenMovable.toolbox,
     PolygenAllMovable.toolbox,
    // PolygenRotatable.toolbox,
  ],
};

function Register(parameters) {
  RegisterData(PolygenEntity, parameters);
  RegisterData(PlayAnimation, parameters);
  RegisterData(PolygenHighlight, parameters);
   RegisterData(PolygenMovable, parameters);
   RegisterData(PolygenAllMovable, parameters);
  // RegisterData(PolygenRotatable, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
