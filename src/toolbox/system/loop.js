import { LOOP_NAME } from "../../localization/index";
export default {
  kind: "category",
  name: LOOP_NAME[window.lg],
  colour: "%{BKY_LOOPS_HUE}",
  contents: [
    {
      kind: "block",
      type: "controls_repeat_ext",
      inputs: {
        TIMES: {
          shadow: {
            type: "math_number",
            fields: {
              NUM: 10,
            },
          },
        },
      },
    },
    {
      kind: "block",
      type: "controls_whileUntil",
    },
    {
      kind: "block",
      type: "controls_for",
      inputs: {
        FROM: {
          shadow: {
            type: "math_number",
            fields: {
              NUM: 1,
            },
          },
        },
        TO: {
          shadow: {
            type: "math_number",
            fields: {
              NUM: 10,
            },
          },
        },
        BY: {
          shadow: {
            type: "math_number",
            fields: {
              NUM: 1,
            },
          },
        },
      },
    },
    {
      kind: "block",
      type: "controls_forEach",
    },
    {
      kind: "block",
      type: "controls_flow_statements",
    },
  ],
};
