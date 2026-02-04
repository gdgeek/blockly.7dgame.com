
import { RegisterData, SetupIt } from "../helper";
import { PROTOTYPE_NAME } from "../../localization/index";
import PrototypeType from "./type";
import PrototypeBook from "./prototype_book";

const Category = {
    kind: "category",
    name: PROTOTYPE_NAME[window.lg],
    colour: PrototypeType.colour,
    contents: [PrototypeBook.toolbox],
};

function Register(parameters) {
    RegisterData(PrototypeBook, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
