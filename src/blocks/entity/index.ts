import Type from "./type";
import LineExecute from "./line_execute";
import Entity from "./entity";
import { RegisterData } from "../helper";
import type { BlockDefinition, Toolbox } from "../helper";

import EntityExplode from "./entity_explode";
import EntityUnxploded from "./entity_unexploded";
import { ENTITY_NAME } from "../../localization/index";
import VisualExecute from "./visual_execute";
import NodeMotion from "./node_motion";
import PlayParticle from "./play_particle";
import VisualTooltip from "./visual_tooltip";
import VisualTooltips from "./visual_tooltips";
import EntityMovable from "./entity_movable";
import EntityAllmovable from "./entity_allmovable";
import EntityRotatable from "./entity_rotatable";
import { ROLES, type Access } from "../../utils/Access";

// Preserve unused imports for block registration side effects
void LineExecute;
void EntityExplode;
void EntityUnxploded;
void EntityMovable;
void EntityAllmovable;

const Setup = (
  toolbox: Toolbox,
  parameters: unknown,
  access: Access
): void => {
  // 根据用户角色过滤内容
  const contents = [
    Entity.toolbox,
    //  LineExecute.toolbox,
    // TweenExecute.toolbox,
    VisualExecute.toolbox,
    ...(access?.atLeast?.(ROLES.ADMIN) ? [PlayParticle.toolbox, NodeMotion.toolbox] : []),
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
    name: (ENTITY_NAME as Record<string, string>)[window.lg],
    colour: Type.colour,
    contents: contents,
  });

  RegisterData(Entity as BlockDefinition, parameters);
  RegisterData(VisualExecute as BlockDefinition, parameters);
  RegisterData(PlayParticle, parameters);
  RegisterData(NodeMotion, parameters);
  RegisterData(VisualTooltip as BlockDefinition, parameters);
  RegisterData(VisualTooltips as BlockDefinition, parameters);
  RegisterData(EntityRotatable as BlockDefinition, parameters);

  /* if (access.atLeast('manager')) {
    RegisterData(EntityMovable, parameters);
    RegisterData(EntityAllmovable, parameters);
  } */
};

export { Setup };
