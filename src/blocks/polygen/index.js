import Type from "./type";
import PolygenEntity from "./polygen_entity";
import PlayAnimation from "./play_animation";
import { RegisterData, SetupIt } from "../helper";
import { POLYGEN_NAME } from "../../localization/index";
import PolygenHighlight from "./polygen_highlight";
import PolygenMovable from "./polygen_movable";
import PolygenAllMovable from "./polygen_allmovable";
import SetEmote from "./set_emote";
import SetVisemeClip from "./set_viseme_clip";

const Setup = (toolbox, parameters, access) => {
  // 根据用户角色过滤内容
  const contents = [
    PolygenEntity.toolbox,
    PlayAnimation.toolbox,
    PolygenHighlight.toolbox,
    PolygenMovable.toolbox,
    PolygenAllMovable.toolbox,
    ...(access.atLeast('manager') ? [SetEmote.toolbox, SetVisemeClip.toolbox] : []),
    
  ];

  // 添加类别到工具箱
  toolbox.contents.push({
    kind: "category",
    name: POLYGEN_NAME[window.lg],
    colour: Type.colour,
    contents: contents,
  });

  RegisterData(PolygenEntity, parameters);
  RegisterData(PlayAnimation, parameters);
  RegisterData(PolygenHighlight, parameters);
  RegisterData(PolygenMovable, parameters);
  RegisterData(PolygenAllMovable, parameters);
  if (access.atLeast('manager')) {
    RegisterData(SetEmote, parameters);
    RegisterData(SetVisemeClip, parameters);
  }
};

export { Setup };
