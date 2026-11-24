import Type from "./type";
import { RegisterData } from "../helper";
import type { BlockDefinition, Toolbox } from "../helper";
import { COMMAND_NAME } from "../../localization/index";
import VoiceTrigger, { ConditionalVoiceTrigger } from "./voice_trigger";
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

function Setup(toolbox: Toolbox, parameters: unknown): void {
  const admin = (parameters as { tourismAuthoring?: boolean }).tourismAuthoring;
  toolbox.contents.push({ ...Category, contents: admin ? [...Category.contents, ConditionalVoiceTrigger.toolbox] : Category.contents });
  Register(parameters);
  RegisterData(ConditionalVoiceTrigger, parameters);
}
export { Setup };
