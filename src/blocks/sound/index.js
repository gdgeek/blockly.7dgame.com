import Type from "./type";
import SoundEntity from "./sound_entity";
import PlaySound from "./play_sound";
import { RegisterData, SetupIt } from "../helper";
import { SOUND_NAME } from "../../localization/index";
const Setup = SetupIt(
  {
    kind: "category",
    // name: "音频",
    name: SOUND_NAME[window.lg],
    colour: Type.colour,
    contents: [SoundEntity.toolbox, PlaySound.toolbox],
  },
  (parameters) => {
    RegisterData(SoundEntity, parameters);
    RegisterData(PlaySound, parameters);
  }
);
export { Setup };
