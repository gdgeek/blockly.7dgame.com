import Type from "./type";
import * as Blockly from "blockly";
import Vector3Data from "./vector3_data";
import TransformData from "./transform_data";
import { DATA_NAME } from "../../localization/index";
import { RegisterData, SetupIt } from "../helper";

const Setup = SetupIt(
  {
    kind: "category",
    name: DATA_NAME[window.lg],
    colour: Type.colour,
    contents: [Vector3Data.toolbox, TransformData.toolbox],
  },
  (parameters) => {
    RegisterData(Vector3Data, parameters);
    RegisterData(TransformData, parameters);
  }
);
export { Setup };
