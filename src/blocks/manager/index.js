import Type from "./type";

import GameAddScore from "./game_add_score";
import GameReset from "./game_reset";
import GameCountdown from "./game_countdown";
import { MANAGER_NAME, SIGNAL_NAME } from "../../localization/index";
import { RegisterData, SetupIt } from "../helper";

const Category = {
  kind: "category",
  // name: "信号",
  name: MANAGER_NAME[window.lg],
  colour: Type.colour,
  contents: [
    GameAddScore.toolbox,
    GameReset.toolbox,
    GameCountdown.toolbox,
  ],
};

function Register(parameters) {
 
  RegisterData(GameAddScore, parameters);
  RegisterData(GameReset, parameters);
  RegisterData(GameCountdown, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
