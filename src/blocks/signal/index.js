import Type from "./type";

import OutputSignal from "./output_signal";
import OutputSignalWithParameter from "./output_signal_with_parameter";
import InputSignal from "./input_signal";
import InitSignal from "./init_signal";

import { RegisterData, SetupIt } from "../helper";

const Category = {
  kind: "category",
  // name: "信号",
  name: "Signal",
  colour: Type.colour,
  contents: [
    OutputSignal.toolbox,
    InputSignal.toolbox,
    OutputSignalWithParameter.toolbox,
    InitSignal.toolbox,
  ],
};

function Register(parameters) {
  RegisterData(OutputSignal, parameters);
  RegisterData(InputSignal, parameters);
  RegisterData(OutputSignalWithParameter, parameters);
  RegisterData(InitSignal, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
