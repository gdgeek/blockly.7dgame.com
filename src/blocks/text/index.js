import Type from "./type";
import TextEntity from "./text_entity";
import SetText from "./set_text";
import { RegisterData, SetupIt } from "../helper";

const Category = {
  kind: "category",
  // name: "文字",
  name: "Text",
  colour: Type.colour,
  contents: [TextEntity.toolbox, SetText.toolbox],
};

function Register(parameters) {
  RegisterData(TextEntity, parameters);
  RegisterData(SetText, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
