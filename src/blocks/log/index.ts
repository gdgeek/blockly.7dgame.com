import LogKeyValue from "./log_key_value";
import LogResetUuid from "./log_resetUuid";
import { RegisterData, SetupIt } from "../helper";
import type { ToolboxCategory } from "../helper";
import { LOG_NAME } from "../../localization/index";
import LogType from "./type";

const Category: ToolboxCategory = {
  kind: "category",
  name: LOG_NAME[window.lg as keyof typeof LOG_NAME],
  colour: LogType.colour,
  contents: [LogResetUuid.toolbox, LogKeyValue.toolbox],
};

function Register(parameters: unknown): void {
  RegisterData(LogResetUuid, parameters);
  RegisterData(LogKeyValue, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
