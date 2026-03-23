import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";
import { PROTOTYPE_NAME } from "../../localization/index";
import PrototypeType from "./type";
import PrototypeBook from "./prototype_book";

const Category = {
  kind: "category",
  name: (PROTOTYPE_NAME as Record<string, string>)[window.lg],
  colour: PrototypeType.colour,
  contents: [PrototypeBook.toolbox],
};

function Register(parameters: unknown): void {
  RegisterData(PrototypeBook as BlockDefinition, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
