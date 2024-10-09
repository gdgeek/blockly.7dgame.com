import Type from "./type";
import { RegisterData, SetupIt } from "../helper";

import ActionTrigger from "./action_trigger";
import ActionExecute from "./action_execute";
import DestroyTrigger from "./destroy_trigger";
import InitTrigger from "./init_trigger";
import UpdateTrigger from "./update_trigger";

const Category = {
  kind: "category",
  name: "Trigger",
  colour: Type.colour,
  contents: [
    ActionTrigger.toolbox,
    InitTrigger.toolbox,
    DestroyTrigger.toolbox,
    UpdateTrigger.toolbox,
    ActionExecute.toolbox,
  ],
};

function Register(parameters) {
  RegisterData(ActionTrigger, parameters);
  RegisterData(InitTrigger, parameters);
  RegisterData(DestroyTrigger, parameters);
  RegisterData(UpdateTrigger, parameters);
  RegisterData(ActionExecute, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
