import Type from "./type";
import { RegisterData, SetupIt } from "../helper";
import { VOICE_NAME } from "../../localization/index";
import VoiceTrigger from "./voice_trigger";

const Category = {
  kind: "category",
  name: VOICE_NAME[window.lg],
  colour: Type.colour,
  contents: [
    VoiceTrigger.toolbox,
  ],
};

function Register(parameters) {
  RegisterData(VoiceTrigger, parameters);

}
const Setup = SetupIt(Category, Register);
export { Setup };
