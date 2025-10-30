import Type from "./type";

import OutputSignal from "./output_signal";
import OutputSignalWithParameter from "./output_signal_with_parameter";
import InputSignal from "./input_signal";
import InitSignal from "./init_signal";
import OutputsItem from "./outputs_item";
import MultiOutputSignal from "./multi_output_signal";

import { SIGNAL_NAME } from "../../localization/index";
import { RegisterData, SetupIt } from "../helper";

const Category = {
  kind: "category",
  // name: "信号",
  name: SIGNAL_NAME[window.lg],
  colour: Type.colour,
  contents: [
    OutputSignal.toolbox,
    InputSignal.toolbox,
    OutputSignalWithParameter.toolbox,
    InitSignal.toolbox,
    OutputsItem.toolbox,
    MultiOutputSignal.toolbox,
  ],
};

function Register(parameters) {
  console.log("register signal", parameters);
  RegisterData(OutputSignal, parameters);
  RegisterData(InputSignal, parameters);
  RegisterData(OutputSignalWithParameter, parameters);
  RegisterData(InitSignal, parameters);
  RegisterData(OutputsItem, parameters);
  RegisterData(MultiOutputSignal, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
