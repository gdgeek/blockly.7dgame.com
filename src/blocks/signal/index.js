import Type from "./type";

import OutputSignal from "./output_signal";
import OutputSignalWithParameter from "./output_signal_with_parameter";
import InputSignal from "./input_signal";
import InitSignal from "./init_signal";
import OutputsItem from "./outputs_item";
import MultiOutputSignal from "./multi_output_signal";
import InputSignalSystem from "./input_signal_system";
import { SIGNAL_NAME } from "../../localization/index";
import { RegisterData, SetupIt } from "../helper";

const Setup = (toolbox, parameters, access) => {

  const contents = [
    OutputSignal.toolbox,
    InputSignal.toolbox,
    OutputSignalWithParameter.toolbox,
    InitSignal.toolbox,
    MultiOutputSignal.toolbox,
    OutputsItem.toolbox,
    ...(access.atLeast('manager') ? [InputSignalSystem.toolbox] : []),
    
  ];

  toolbox.contents.push({
    kind: "category",
    name: SIGNAL_NAME[window.lg],
    colour: Type.colour,
    contents: contents,
  });

  RegisterData(OutputSignal, parameters);
  RegisterData(InputSignal, parameters);
  RegisterData(OutputSignalWithParameter, parameters);
  RegisterData(InitSignal, parameters);
  RegisterData(MultiOutputSignal, parameters);
  RegisterData(OutputsItem, parameters);
  if (access.atLeast('manager'))
  {
    RegisterData(InputSignalSystem, parameters); 
  }
};
export { Setup };
