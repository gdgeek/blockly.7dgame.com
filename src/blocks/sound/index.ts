import Type from "./type";
import SoundEnded from "./sound_ended";
import type { Toolbox } from "../helper";
import SoundEntity from "./sound_entity";
import PlaySound from "./play_sound";
import PauseSound from "./pause_sound";
import StopSound from "./stop_sound";
import AutoPlay from "./autoplay_sound";
import { RegisterData } from "../helper";
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

function Setup(toolbox: Toolbox, parameters: unknown): void {
  const { tourismAuthoring } = parameters as { tourismAuthoring?: boolean };
  toolbox.contents.push({
    ...Category,
    contents: tourismAuthoring ? [...Category.contents, SoundEnded.toolbox] : Category.contents,
  });
  Register(parameters);
  RegisterData(SoundEnded, parameters);
}
export { Setup };
