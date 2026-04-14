import Type from "./type";
import TextEntity from "./text_entity";
import SetText from "./set_text";
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";
import { TEXT_NAME } from "../../localization/index";

const Category = {
  kind: "category",
  name: (TEXT_NAME as Record<string, string>)[window.lg],
  colour: Type.colour,
  contents: [TextEntity.toolbox, SetText.toolbox],
};

function Register(parameters: unknown): void {
  RegisterData(TextEntity as BlockDefinition, parameters);
  RegisterData(SetText as BlockDefinition, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
