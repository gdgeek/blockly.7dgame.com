import Type from "./type";
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";
import { COMMAND_NAME } from "../../localization/index";
import VoiceTrigger from "./voice_trigger";
import GestureTrigger from "./gesture_trigger";

const Category = {
  kind: "category",
  name: COMMAND_NAME[window.lg as keyof typeof COMMAND_NAME],
  colour: Type.colour,
  contents: [VoiceTrigger.toolbox, GestureTrigger.toolbox],
};

function Register(parameters: unknown): void {
  RegisterData(VoiceTrigger as BlockDefinition, parameters);
  RegisterData(GestureTrigger as BlockDefinition, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
