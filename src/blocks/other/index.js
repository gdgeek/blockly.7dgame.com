import Type from "./type";
import SleepEntity from "./sleep";
import { RegisterData, SetupIt } from "../helper";
import { OTHER_NAME } from "../../localization/index";
const HelperCategory = {
  kind: "category",
  // name: "其他",
  name: OTHER_NAME[window.lg],
  colour: Type.colour,
  contents: [SleepEntity.toolbox],
};

function HelperRegister(parameters) {
  RegisterData(SleepEntity, parameters);
}
const Setup = SetupIt(HelperCategory, HelperRegister);
export { Setup };
