import { LOGIC_NAME } from "../../localization/index";
export default {
  kind: "category",
  name: LOGIC_NAME[window.lg],
  colour: "%{BKY_LOGIC_HUE}",
  contents: [
    {
      kind: "block",
      type: "controls_if",
    },
    {
      kind: "block",
      type: "logic_compare",
    },
    {
      kind: "block",
      type: "logic_operation",
    },
    {
      kind: "block",
      type: "logic_negate",
    },
    {
      kind: "block",
      type: "logic_boolean",
    },
    {
      kind: "block",
      type: "logic_null",
    },
    {
      kind: "block",
      type: "logic_ternary",
    },
  ],
};
