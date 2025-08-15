import Type from "./type";
import { RegisterData, SetupIt } from "../helper";
import VideoEntity from "./video_entity";
import PlayVideo from "./play_video";
import PlayVideoCallback from "./play_video_callback";
import PlayVideo2 from "./play_video2";
import PauseVideo from "./pause_video";
import StopVideo from "./stop_video";
import AutoPlay from "./autoplay_video";
import { VIDEO_NAME } from "../../localization/index";

const Setup = SetupIt(
  {
    kind: "category",
    // name: "视频",
    name: VIDEO_NAME[window.lg],
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
  },
  (parameters) => {
    RegisterData(VideoEntity, parameters);
    // RegisterData(PlayVideo, parameters);
    RegisterData(PlayVideo2, parameters);
    // RegisterData(PlayVideoCallback, parameters)
    RegisterData(PauseVideo, parameters);
    RegisterData(StopVideo, parameters);
    RegisterData(AutoPlay, parameters);
  }
);
export { Setup };
