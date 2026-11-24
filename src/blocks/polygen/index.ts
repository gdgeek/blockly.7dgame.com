import Type from "./type";
import PolygenEntity from "./polygen_entity";
import PlayAnimation from "./play_animation";
// eslint-disable-next-line no-unused-vars -- 保留 SetupIt 以备后续使用
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition, Toolbox } from "../helper";
import { POLYGEN_NAME } from "../../localization/index";
import PolygenHighlight from "./polygen_highlight";
import PolygenMovable from "./polygen_movable";
import PolygenAllMovable from "./polygen_allmovable";
import SetEmote from "./set_emote";
import SetVisemeClip from "./set_viseme_clip";

// Preserve unused import for side effects
void SetupIt;

import { Access } from "../../utils/Access";

const Setup = (toolbox: Toolbox, parameters: unknown, access: Access): void => {
  // 根据用户角色过滤内容
  const contents = [
    PolygenEntity.toolbox,
    PlayAnimation.toolbox,
    PolygenHighlight.toolbox,
    PolygenMovable.toolbox,
    PolygenAllMovable.toolbox,
    ...(access.atLeast("manager")
      ? [SetEmote.toolbox, SetVisemeClip.toolbox]
      : []),
  ];

  // 添加类别到工具箱
  toolbox.contents.push({
    kind: "category",
    name: (POLYGEN_NAME as Record<string, string>)[window.lg],
    colour: Type.colour,
    contents: contents,
  });

  RegisterData(PolygenEntity as BlockDefinition, parameters);
  RegisterData(PlayAnimation as BlockDefinition, parameters);
  RegisterData(PolygenHighlight as BlockDefinition, parameters);
  RegisterData(PolygenMovable as BlockDefinition, parameters);
  RegisterData(PolygenAllMovable as BlockDefinition, parameters);
  if (access.atLeast("manager")) {
    RegisterData(SetEmote as BlockDefinition, parameters);
    RegisterData(SetVisemeClip as BlockDefinition, parameters);
  }
};

export { Setup };
