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
import EntityHighlight from "./entity_highlight"

const Setup = SetupIt(
  {
    kind: "category",
    // name: "实体",
    name: ENTITY_NAME[window.lg],
    colour: Type.colour,
    contents: [
      Entity.toolbox,
      //  LineExecute.toolbox,
      // TweenExecute.toolbox,
      VisualExecute.toolbox,
      EntityHighlight.toolbox,
      // EntityExplode.toolbox,
      // EntityUnxploded.toolbox
    ],
  },
  (parameters) => {
    RegisterData(Entity, parameters);
    // RegisterData(LineExecute, parameters)
    // RegisterData(TweenExecute, parameters)
    RegisterData(VisualExecute, parameters);
    RegisterData(EntityHighlight, parameters);
    //RegisterData(EntityExplode, parameters)
    // RegisterData(EntityUnxploded, parameters)
    //RegisterData(root, index, TextEntity)
  }
);

export { Setup };
