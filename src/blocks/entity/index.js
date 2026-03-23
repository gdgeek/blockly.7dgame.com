import Type from "./type";
//import PolygenEntity from './polygen_entity'
//import PictureEntity from './picture_entity'
//import VideoEntity from './video_entity'
//import TextEntity from './text_entity'
// eslint-disable-next-line no-unused-vars -- 注册积木块需要导入
import LineExecute from "./line_execute";
import Entity from "./entity";
// eslint-disable-next-line no-unused-vars -- 保留 SetupIt 以备后续使用
import { RegisterData, SetupIt } from "../helper";

// eslint-disable-next-line no-unused-vars -- 注册积木块需要导入
import EntityExplode from "../entity/entity_explode";
// eslint-disable-next-line no-unused-vars -- 注册积木块需要导入
import EntityUnxploded from "./entity_unexploded";
import { ENTITY_NAME } from "../../localization/index";
//import TweenExecute from './tween_execute'
import VisualExecute from "./visual_execute";
import VisualTooltip from "./visual_tooltip";
import VisualTooltips from "./visual_tooltips";
// eslint-disable-next-line no-unused-vars -- 注册积木块需要导入
import EntityMovable from "./entity_movable";
// eslint-disable-next-line no-unused-vars -- 注册积木块需要导入
import EntityAllmovable from "./entity_allmovable";
import EntityRotatable from "./entity_rotatable";

const Setup = (toolbox, parameters, _access) => {
  // 根据用户角色过滤内容
  const contents = [
    Entity.toolbox,
    //  LineExecute.toolbox,
    // TweenExecute.toolbox,
    VisualExecute.toolbox,
    // EntityExplode.toolbox,
    // EntityUnxploded.toolbox
    VisualTooltip.toolbox,
    VisualTooltips.toolbox,
    // ...(access.atLeast('manager') ? [EntityMovable.toolbox, EntityAllmovable.toolbox] : []),
    EntityRotatable.toolbox,
  ];

  // 添加类别到工具箱
  toolbox.contents.push({
    kind: "category",
    name: ENTITY_NAME[window.lg],
    colour: Type.colour,
    contents: contents,
  });

  RegisterData(Entity, parameters);
  RegisterData(VisualExecute, parameters);
  RegisterData(VisualTooltip, parameters);
  RegisterData(VisualTooltips, parameters);
  RegisterData(EntityRotatable, parameters);

  /* if (access.atLeast('manager')) {
    RegisterData(EntityMovable, parameters);
    RegisterData(EntityAllmovable, parameters);
  } */
};

export { Setup };
