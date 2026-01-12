import Logic from "../toolbox/system/logic";
import Loop from "../toolbox/system/loop";
import Math from "../toolbox/system/math";
import Texts from "../toolbox/system/texts";
import List from "../toolbox/system/list";
import * as Blockly from "blockly";
import { VARIABLE_NAME } from "../localization/index";
import { PROCEDURE_NAME } from "../localization/index";
import { javascriptGenerator } from "blockly/javascript";

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
//import *  as Meta from '../blocks/meta'
import * as Trigger from "../blocks/trigger";
import * as Event from "../blocks/event";
import * as Task from "../blocks/task";
import * as Entity from "../blocks/entity";
import * as Polygen from "../blocks/polygen";
import * as Picture from "../blocks/picture";
import * as Text from "../blocks/text";
import * as Sound from "../blocks/sound";
import * as Voxel from "../blocks/voxel";
import * as Command from "../blocks/command";
import * as Video from "../blocks/video";
// import *  as Other from '../blocks/other'
import * as Signal from "../blocks/signal";
import * as Manager from "../blocks/manager";
import * as Parameter from "../blocks/parameter";

const sep = {
  kind: "sep",
};
const toolbox = {
  kind: "categoryToolbox",
  contents: [Logic, Loop, Math, Texts, List, sep],
};

// 重写Procedure生成器
// const originalProceduresDefreturn =
//   javascriptGenerator.forBlock["procedures_defreturn"];
// const originalProceduresDefnoreturn =
//   javascriptGenerator.forBlock["procedures_defnoreturn"];

// 带返回值的异步函数生成器
javascriptGenerator.forBlock["procedures_defreturn"] = function (block) {
  const funcName = javascriptGenerator.nameDB_.getName(
    block.getFieldValue("NAME"),
    Blockly.Names.NameType.PROCEDURE
  );

  const args = [];
  for (let i = 0; i < block.arguments_.length; i++) {
    args[i] = javascriptGenerator.nameDB_.getName(
      block.arguments_[i],
      Blockly.Names.NameType.VARIABLE
    );
  }

  const branch = javascriptGenerator.statementToCode(block, "STACK");
  const returnValue =
    javascriptGenerator.valueToCode(
      block,
      "RETURN",
      javascriptGenerator.ORDER_NONE
    ) || "";
  let code = "";

  code +=
    "async function " + funcName + "(" + args.join(", ") + ") {\n" + branch;

  if (returnValue) {
    code += "  return " + returnValue + ";\n";
  }
  code += "}";

  javascriptGenerator.definitions_["%" + funcName] = code;
  return null;
};

// 不带返回值的异步函数生成器
javascriptGenerator.forBlock["procedures_defnoreturn"] = function (block) {
  const funcName = javascriptGenerator.nameDB_.getName(
    block.getFieldValue("NAME"),
    Blockly.Names.NameType.PROCEDURE
  );

  const args = [];
  for (let i = 0; i < block.arguments_.length; i++) {
    args[i] = javascriptGenerator.nameDB_.getName(
      block.arguments_[i],
      Blockly.Names.NameType.VARIABLE
    );
  }

  const branch = javascriptGenerator.statementToCode(block, "STACK");

  const code =
    "async function " +
    funcName +
    "(" +
    args.join(", ") +
    ") {\n" +
    branch +
    "}";

  javascriptGenerator.definitions_["%" + funcName] = code;
  return null;
};

const setup = (style, parameters, access) => {
  if (style.includes("base")) {
    Data.Setup(toolbox, parameters);
    Task.Setup(toolbox, parameters);
    Parameter.Setup(toolbox, parameters);
  }

  toolbox.contents.push(sep);
  if (style.includes("meta")) {
    Trigger.Setup(toolbox, parameters);
    Command.Setup(toolbox, parameters);
    Event.Setup(toolbox, parameters);
    toolbox.contents.push(sep);
    Entity.Setup(toolbox, parameters, access);
    Text.Setup(toolbox, parameters);
    Polygen.Setup(toolbox, parameters, access);
    Picture.Setup(toolbox, parameters);
    Video.Setup(toolbox, parameters);
    Sound.Setup(toolbox, parameters);
    // Voxel.Setup(toolbox, parameters);
    // Other.Setup(toolbox, parameters)
  }
  if (style.includes("verse")) {
    Signal.Setup(toolbox, parameters, access);
    Manager.Setup(toolbox, parameters);
    //toolbox.contents.push(DataCategory)
  }
  toolbox.contents.push(sep);
  toolbox.contents.push(Variable);
  toolbox.contents.push(Procedure);

  return toolbox;
};

export { setup };
