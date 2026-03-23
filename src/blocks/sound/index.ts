import Type from "./type";
import SoundEntity from "./sound_entity";
import PlaySound from "./play_sound";
import PauseSound from "./pause_sound";
import StopSound from "./stop_sound";
import AutoPlay from "./autoplay_sound";
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";
import { SOUND_NAME } from "../../localization/index";

const Category = {
  kind: "category",
  name: (SOUND_NAME as Record<string, string>)[window.lg],
  colour: Type.colour,
  contents: [
    SoundEntity.toolbox,
    PlaySound.toolbox,
    PauseSound.toolbox,
    StopSound.toolbox,
    AutoPlay.toolbox,
  ],
};

function Register(parameters: unknown): void {
  RegisterData(SoundEntity as BlockDefinition, parameters);
  RegisterData(PlaySound as BlockDefinition, parameters);
  RegisterData(PauseSound as BlockDefinition, parameters);
  RegisterData(StopSound as BlockDefinition, parameters);
  RegisterData(AutoPlay as BlockDefinition, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
