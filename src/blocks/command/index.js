import Type from "./type";
import { RegisterData, SetupIt } from "../helper";
import { COMMAND_NAME } from "../../localization/index";
import VoiceTrigger from "./voice_trigger";
import GestureTrigger from "./gesture_trigger";

const Category = {
  kind: "category",
  name: COMMAND_NAME[window.lg],
  colour: Type.colour,
  contents: [
    VoiceTrigger.toolbox,
    GestureTrigger.toolbox,
  ],
};

function Register(parameters) {
  RegisterData(VoiceTrigger, parameters);
  RegisterData(GestureTrigger, parameters);

}
const Setup = SetupIt(Category, Register);
export { Setup };
