import Type from "./type";

import ManagerCall from "./manager_call";
import OutputSignalWithParameter from "./output_signal_with_parameter";
import InputSignal from "./input_signal";
import InitSignal from "./init_signal";
import { MANAGER_NAME, SIGNAL_NAME } from "../../localization/index";
import { RegisterData, SetupIt } from "../helper";

const Category = {
  kind: "category",
  // name: "信号",
  name: MANAGER_NAME[window.lg],
  colour: Type.colour,
  contents: [
    ManagerCall.toolbox,
   // InputSignal.toolbox,
  //  OutputSignalWithParameter.toolbox,
  //  InitSignal.toolbox,
  ],
};

function Register(parameters) {
 
  RegisterData(ManagerCall, parameters);
 // RegisterData(InputSignal, parameters);
 // RegisterData(OutputSignalWithParameter, parameters);
 // RegisterData(InitSignal, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
