import Type from "./type";
import * as Blockly from "blockly";
import { RegisterData, SetupIt } from "../helper";

import TweenToData from "./tween_to_data";
import TweenToObject from "./tween_to_object";
import TaskArray from "./task_array";
import TaskCricle from "./task_circle";
import TaskPlaySound from "./play_sound_task";
import RunTask from "./run_task";
import SleepTask from "./sleep_task";
import "../../localization/index";

// const urlParams = new URLSearchParams(window.location.search);
// let lg = urlParams.get("language");
// if (lg === "zh-cn") {
//   lg = "zh"; // 将 'zh-cn' 转换为 'zh'
// }

const Category = {
  kind: "category",
  // name: "任务",
  name: "Task",
  colour: Type.colour,
  contents: [
    TweenToData.toolbox,
    TweenToObject.toolbox,
    TaskArray.toolbox,
    TaskCricle.toolbox,
    RunTask.toolbox,
    SleepTask.toolbox,
    TaskPlaySound.toolbox,
  ],
};

function Register(parameters) {
  RegisterData(TweenToData, parameters);
  RegisterData(TweenToObject, parameters);
  RegisterData(TaskArray, parameters);
  RegisterData(TaskCricle, parameters);
  RegisterData(RunTask, parameters);
  RegisterData(SleepTask, parameters);
  RegisterData(TaskPlaySound, parameters);
}
const Setup = SetupIt(Category, Register);
export { Setup };
