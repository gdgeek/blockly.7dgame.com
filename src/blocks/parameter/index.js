import Type from "./type";
import BooleanParameter from "./boolean_parameter";
import NumberParameter from "./number_parameter";
import StringParameter from "./string_parameter";
import Parameters from "./parameters";
import SystemParameter from "./system_parameter";
import PlayerParameter from "./player_parameter";
import RectangleParameter from "./rectangle_parameter";
import PointParameter from "./point_parameter";
import { RegisterData, SetupIt } from "../helper";
const Category = {
  kind: "category",
  // name: "参数",
  name: "Parameter",
  colour: Type.colour,
  contents: [
    BooleanParameter.toolbox,
    NumberParameter.toolbox,
    StringParameter.toolbox,
    Parameters.toolbox,
    SystemParameter.toolbox,
    PlayerParameter.toolbox,
    RectangleParameter.toolbox,
    PointParameter.toolbox,
  ],
};

function Register(parameters) {
  RegisterData(BooleanParameter, parameters);
  RegisterData(NumberParameter, parameters);
  RegisterData(StringParameter, parameters);
  RegisterData(Parameters, parameters);
  RegisterData(SystemParameter, parameters);
  RegisterData(PlayerParameter, parameters);
  RegisterData(RectangleParameter, parameters);
  RegisterData(PointParameter, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
