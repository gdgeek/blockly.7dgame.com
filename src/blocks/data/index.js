import Type from "./type";

import Vector3Data from "./vector3_data";
import TransformData from "./transform_data";

import { RegisterData, SetupIt } from "../helper";

const Setup = SetupIt(
  {
    kind: "category",
    name: "Data",
    colour: Type.colour,
    contents: [Vector3Data.toolbox, TransformData.toolbox],
  },
  (parameters) => {
    RegisterData(Vector3Data, parameters);
    RegisterData(TransformData, parameters);
  }
);
export { Setup };
