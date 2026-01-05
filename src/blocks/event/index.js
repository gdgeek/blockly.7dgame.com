import Type from "./type";
import { EVENT_NAME } from "../../localization/index";
import InputEvent from "./input_event.js";
import OutputEvent from "./output_event.js";
import { RegisterData, SetupIt } from "../helper";
const Category = {
  kind: "category",
  name: EVENT_NAME[window.lg],
  colour: Type.colour,
  contents: [InputEvent.toolbox, OutputEvent.toolbox],
};

function Register(parameters) {
  RegisterData(InputEvent, parameters);
  RegisterData(OutputEvent, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
