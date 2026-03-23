import Type from "./type";

import GameAddScore from "./game_add_score";
import GameReset from "./game_reset";
import GameCountdown from "./game_countdown";
import { MANAGER_NAME } from "../../localization/index"; // eslint-disable-line no-unused-vars -- SIGNAL_NAME 保留以备后续使用
import { RegisterData, SetupIt } from "../helper";

const Category = {
  kind: "category",
  // name: "信号",
  name: MANAGER_NAME[window.lg],
  colour: Type.colour,
  contents: [GameAddScore.toolbox, GameReset.toolbox, GameCountdown.toolbox],
};

function Register(parameters) {
  RegisterData(GameAddScore, parameters);
  RegisterData(GameReset, parameters);
  RegisterData(GameCountdown, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
