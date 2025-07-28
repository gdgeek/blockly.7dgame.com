import Type from "./type";
import SoundEntity from "./sound_entity";
import PlaySound from "./play_sound";
import PauseSound from "./pause_sound";
import StopSound from "./stop_sound";
import { RegisterData, SetupIt } from "../helper";
import { SOUND_NAME } from "../../localization/index";
const Setup = SetupIt(
  {
    kind: "category",
    // name: "音频",
    name: SOUND_NAME[window.lg],
    colour: Type.colour,
    contents: [SoundEntity.toolbox, PlaySound.toolbox, PauseSound.toolbox, StopSound.toolbox],
  },
  (parameters) => {
    RegisterData(SoundEntity, parameters);
    RegisterData(PlaySound, parameters);
    RegisterData(PauseSound, parameters);
    RegisterData(StopSound, parameters);
  }
);
export { Setup };
