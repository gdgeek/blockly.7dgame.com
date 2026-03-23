import Type from "./type";
import { META_NAME } from "../../localization/index";
import { RegisterData, SetupIt } from "../helper";
import type { ToolboxCategory, Toolbox } from "../helper";
import MetaAction from "./meta_action";
import RunTask from "./run_task";

const Category: ToolboxCategory = {
  kind: "category",
  name: (META_NAME as Record<string, string>)[window.lg],
  colour: Type.colour,
  contents: [MetaAction.toolbox, RunTask.toolbox],
};

function Register(parameters: unknown): void {
  RegisterData(MetaAction, parameters);
  RegisterData(RunTask, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
