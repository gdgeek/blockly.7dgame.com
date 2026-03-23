import Type from "./type";
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";
import VideoEntity from "./video_entity";
// eslint-disable-next-line no-unused-vars -- 注册积木块需要导入，当前被注释掉的代码中使用
import PlayVideo from "./play_video";
// eslint-disable-next-line no-unused-vars -- 注册积木块需要导入，当前被注释掉的代码中使用
import PlayVideoCallback from "./play_video_callback";
import PlayVideo2 from "./play_video2";
import PauseVideo from "./pause_video";
import StopVideo from "./stop_video";
import AutoPlay from "./autoplay_video";
import { VIDEO_NAME } from "../../localization/index";

const Category = {
  kind: "category",
  name: (VIDEO_NAME as Record<string, string>)[window.lg],
  colour: Type.colour,
  contents: [
    VideoEntity.toolbox,
    // PlayVideo.toolbox,
    PlayVideo2.toolbox,
    // PlayVideoCallback.toolbox,
    PauseVideo.toolbox,
    StopVideo.toolbox,
    AutoPlay.toolbox,
  ],
};

function Register(parameters: unknown): void {
  RegisterData(VideoEntity as BlockDefinition, parameters);
  // RegisterData(PlayVideo as BlockDefinition, parameters);
  RegisterData(PlayVideo2 as BlockDefinition, parameters);
  // RegisterData(PlayVideoCallback as BlockDefinition, parameters);
  RegisterData(PauseVideo as BlockDefinition, parameters);
  RegisterData(StopVideo as BlockDefinition, parameters);
  RegisterData(AutoPlay as BlockDefinition, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
