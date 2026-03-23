import Type from "./type";
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";
import { TRIGGER_NAME } from "../../localization/index";
import ActionTrigger from "./action_trigger";
//import ActionExecute from "./action_execute";
import InitTrigger from "./init_trigger";

const Category = {
  kind: "category",
  name: (TRIGGER_NAME as Record<string, string>)[window.lg],
  colour: Type.colour,
  contents: [
    ActionTrigger.toolbox,
    InitTrigger.toolbox,

    // ActionExecute.toolbox,
  ],
};

function Register(parameters: unknown): void {
  RegisterData(ActionTrigger as BlockDefinition, parameters);
  RegisterData(InitTrigger as BlockDefinition, parameters);
  // RegisterData(DestroyTrigger, parameters);
  // RegisterData(UpdateTrigger, parameters);
  // RegisterData(ActionExecute, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
