import Type from "./type";
import { EVENT_NAME } from "../../localization/index";
import InputEvent from "./input_event";
import OutputEvent from "./output_event";
import { RegisterData, SetupIt } from "../helper";
import type { ToolboxCategory } from "../helper";

const Category: ToolboxCategory = {
  kind: "category",
  name: EVENT_NAME[window.lg as keyof typeof EVENT_NAME],
  colour: Type.colour,
  contents: [InputEvent.toolbox, OutputEvent.toolbox],
};

function Register(parameters: unknown): void {
  RegisterData(InputEvent, parameters);
  RegisterData(OutputEvent, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
