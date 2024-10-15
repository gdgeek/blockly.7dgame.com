import Type from "./type";
import TextEntity from "./text_entity";
import SetText from "./set_text";
import { RegisterData, SetupIt } from "../helper";
import { TEXT_NAME } from "../../localization/index";
const Category = {
  kind: "category",
  // name: "文字",
  name: TEXT_NAME[window.lg],
  colour: Type.colour,
  contents: [TextEntity.toolbox, SetText.toolbox],
};

function Register(parameters) {
  RegisterData(TextEntity, parameters);
  RegisterData(SetText, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
