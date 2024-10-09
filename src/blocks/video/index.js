import Type from "./type";
import { RegisterData, SetupIt } from "../helper";
import VideoEntity from "./video_entity";
import PlayVideo from "./play_video";

const Setup = SetupIt(
  {
    kind: "category",
    name: "视频",
    colour: Type.colour,
    contents: [
      VideoEntity.toolbox,
      PlayVideo.toolbox /*, PlayVideoCallback.toolbox*/,
    ],
  },
  (parameters) => {
    RegisterData(VideoEntity, parameters);
    RegisterData(PlayVideo, parameters);
    // RegisterData(PlayVideoCallback, parameters)
  }
);
export { Setup };
