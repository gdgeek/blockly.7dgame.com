import Logic from "../toolbox/system/logic";
import Loop from "../toolbox/system/loop";
import Math from "../toolbox/system/math";
import Texts from "../toolbox/system/texts";
import List from "../toolbox/system/list";

import { VARIABLE_NAME } from "../localization/index";
import { PROCEDURE_NAME } from "../localization/index";

const Variable = {
  kind: "category",
  name: VARIABLE_NAME[window.lg],
  colour: "%{BKY_VARIABLES_HUE}",
  custom: "VARIABLE",
};
const Procedure = {
  kind: "category",
  name: PROCEDURE_NAME[window.lg],
  colour: "%{BKY_PROCEDURES_HUE}",
  custom: "PROCEDURE",
};
import * as Data from "../blocks/data";
import * as Meta from "../blocks/meta";
import * as Trigger from "../blocks/trigger";
import * as Event from "../blocks/event";
import * as Task from "../blocks/task";
import * as Entity from "../blocks/entity";
import * as Polygen from "../blocks/polygen";
import * as Picture from "../blocks/picture";
import * as Text from "../blocks/text";
import * as Sound from "../blocks/sound";
import * as Voxel from "../blocks/voxel";
import * as Other from "../blocks/other";
import * as Signal from "../blocks/signal";
import * as Parameter from "../blocks/parameter";

const sep = {
  kind: "sep",
};
const toolbox = {
  kind: "categoryToolbox",
  contents: [Logic, Loop, Math, Texts, List, sep],
};

const setup = (style, parameters) => {
  if (style.includes("base")) {
    Data.Setup(toolbox, parameters);
    Task.Setup(toolbox, parameters);
    Parameter.Setup(toolbox, parameters);
  }

  toolbox.contents.push(sep);
  if (style.includes("meta")) {
    Meta.Setup(toolbox, parameters);
    Trigger.Setup(toolbox, parameters);
    Event.Setup(toolbox, parameters);
    toolbox.contents.push(sep);
    Entity.Setup(toolbox, parameters);
    Polygen.Setup(toolbox, parameters);
    Picture.Setup(toolbox, parameters);
    Text.Setup(toolbox, parameters);
    Sound.Setup(toolbox, parameters);
    Voxel.Setup(toolbox, parameters);
    Other.Setup(toolbox, parameters);
  }
  if (style.includes("verse")) {
    Signal.Setup(toolbox, parameters);
    //toolbox.contents.push(DataCategory)
  }
  toolbox.contents.push(sep);
  toolbox.contents.push(Variable);
  toolbox.contents.push(Procedure);

  return toolbox;
};

export { setup };
