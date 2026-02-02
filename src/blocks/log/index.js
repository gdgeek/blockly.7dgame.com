import LogKeyValue from "./log_key_value";
import LogResetUuid from "./log_resetUuid";
import { RegisterData, SetupIt } from "../helper";
import { LOG_NAME } from "../../localization/index";
import LogType from "./type";

const Category = {
    kind: "category",
    name: LOG_NAME[window.lg],
    colour: LogType.colour,
    contents: [LogResetUuid.toolbox, LogKeyValue.toolbox],
};

function Register(parameters) {
    RegisterData(LogResetUuid, parameters);
    RegisterData(LogKeyValue, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
