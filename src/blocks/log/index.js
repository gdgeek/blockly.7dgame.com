import LogKeyValue from "./log_key_value";
import { RegisterData, SetupIt } from "../helper";
import { LOG_NAME } from "../../localization/index";
import LogType from "./type";

const Category = {
    kind: "category",
    name: LOG_NAME[window.lg],
    colour: LogType.colour,
    contents: [LogKeyValue.toolbox],
};

function Register(parameters) {
    RegisterData(LogKeyValue, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
