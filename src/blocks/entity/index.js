import Type from "./type";
//import PolygenEntity from './polygen_entity'
//import PictureEntity from './picture_entity'
//import VideoEntity from './video_entity'
//import TextEntity from './text_entity'
import LineExecute from "./line_execute";
import Entity from "./entity";
import { RegisterData, SetupIt } from "../helper";

import EntityExplode from "../entity/entity_explode";
import EntityUnxploded from "./entity_unexploded";
import { ENTITY_NAME } from "../../localization/index";
//import TweenExecute from './tween_execute'
import VisualExecute from "./visual_execute";
import VisualTooltip from "./visual_tooltip";
import VisualTooltips from "./visual_tooltips";
import EntityMovable from "./entity_movable";
import EntityAllmovable from "./entity_allmovable";
import EntityRotatable from "./entity_rotatable";


const Setup = (toolbox, parameters, userInfo) => {
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
    ...(userInfo && userInfo.role !== "user" ? [EntityMovable.toolbox, EntityAllmovable.toolbox] : []),
    EntityRotatable.toolbox
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
  
  if (userInfo && userInfo.role !== "user") {
    RegisterData(EntityMovable, parameters);
    RegisterData(EntityAllmovable, parameters);
  }
};

export { Setup };
