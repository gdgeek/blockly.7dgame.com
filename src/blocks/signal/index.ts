import Type from "./type";

import OutputSignal from "./output_signal";
import OutputSignalWithParameter from "./output_signal_with_parameter";
import InputSignal from "./input_signal";
import InitSignal from "./init_signal";
import OutputsItem from "./outputs_item";
import MultiOutputSignal from "./multi_output_signal";
import InputSignalSystem from "./input_signal_system";
import { SIGNAL_NAME } from "../../localization/index";
// eslint-disable-next-line no-unused-vars -- 保留 SetupIt 以备后续使用
import { RegisterData, SetupIt } from "../helper";
import type { Toolbox } from "../helper";

import { Access } from "../../utils/Access";

const Setup = (toolbox: Toolbox, parameters: unknown, access: Access): void => {
  const contents = [
    InitSignal.toolbox,
    OutputSignal.toolbox,
    InputSignal.toolbox,
    MultiOutputSignal.toolbox,
    OutputsItem.toolbox,
    ...(access.atLeast("manager")
      ? [OutputSignalWithParameter.toolbox, InputSignalSystem.toolbox]
      : []),
  ];

  toolbox.contents.push({
    kind: "category",
    name: (SIGNAL_NAME as Record<string, string>)[window.lg],
    colour: Type.colour,
    contents: contents,
  });

  RegisterData(InitSignal, parameters);
  RegisterData(OutputSignal, parameters);
  RegisterData(InputSignal, parameters);
  RegisterData(MultiOutputSignal, parameters);
  RegisterData(OutputsItem, parameters);
  if (access.atLeast("manager")) {
    RegisterData(OutputSignalWithParameter, parameters);
    RegisterData(InputSignalSystem, parameters);
  }
};
export { Setup };
