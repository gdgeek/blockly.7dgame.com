import Type from "./type";
import * as Blockly from "blockly"; // eslint-disable-line no-unused-vars -- 注册积木块需要 Blockly 全局可用
import { RegisterData, SetupIt } from "../helper";
import type { BlockDefinition } from "../helper";

import TweenToData from "./tween_to_data";
import TweenToObject from "./tween_to_object";
import TaskArray from "./task_array";
import TaskCricle from "./task_circle";
import TaskPlaySound from "./play_sound_task";
import TaskPlayVideo from "./play_video_task";
import TaskPlayAnimation from "./play_animation_task";
import RunTask from "./run_task";
import SleepTask from "./sleep_task";
import "../../localization/index";
import { TASK_NAME } from "../../localization/index";

const Category = {
  kind: "category",
  name: (TASK_NAME as Record<string, string>)[window.lg],
  colour: Type.colour,
  contents: [
    TweenToData.toolbox,
    TweenToObject.toolbox,
    TaskArray.toolbox,
    TaskCricle.toolbox,
    RunTask.toolbox,
    SleepTask.toolbox,
    TaskPlaySound.toolbox,
    TaskPlayVideo.toolbox,
    TaskPlayAnimation.toolbox,
  ],
};

function Register(parameters: unknown): void {
  RegisterData(TweenToData as BlockDefinition, parameters);
  RegisterData(TweenToObject as BlockDefinition, parameters);
  RegisterData(TaskArray as BlockDefinition, parameters);
  RegisterData(TaskCricle as BlockDefinition, parameters);
  RegisterData(RunTask as BlockDefinition, parameters);
  RegisterData(SleepTask as BlockDefinition, parameters);
  RegisterData(TaskPlaySound as BlockDefinition, parameters);
  RegisterData(TaskPlayVideo as BlockDefinition, parameters);
  RegisterData(TaskPlayAnimation as BlockDefinition, parameters);
}

const Setup = SetupIt(Category, Register);
export { Setup };
