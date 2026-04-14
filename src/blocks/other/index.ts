import Type from "./type";
import SleepEntity from "./sleep";
import { RegisterData, SetupIt } from "../helper";
import type { ToolboxCategory } from "../helper";
import { OTHER_NAME } from "../../localization/index";

const HelperCategory: ToolboxCategory = {
  kind: "category",
  name: (OTHER_NAME as Record<string, string>)[window.lg],
  colour: Type.colour,
  contents: [SleepEntity.toolbox],
};

function HelperRegister(parameters: unknown): void {
  RegisterData(SleepEntity, parameters);
}

const Setup = SetupIt(HelperCategory, HelperRegister);
export { Setup };
