import { LIST_NAME } from "../../localization/index";
import type { ToolboxCategory } from "../types";

const list: ToolboxCategory = {
  kind: "category",
  name: LIST_NAME[window.lg],
  colour: "%{BKY_LISTS_HUE}",
  contents: [
    {
      kind: "block",
      type: "lists_create_empty",
    },
    {
      kind: "block",
      type: "lists_create_with",
    },
    {
      kind: "block",
      type: "lists_repeat",
      inputs: {
        NUM: {
          shadow: {
            type: "math_number",
            fields: {
              NUM: "5",
            },
          },
        },
      },
    },
    {
      kind: "block",
      type: "lists_length",
    },
    {
      kind: "block",
      type: "lists_isEmpty",
    },
    {
      kind: "block",
      type: "lists_indexOf",
      inputs: {
        VALUE: {
          block: {
            type: "variables_get",
            fields: {
              VAR: "{listVariable}",
            },
          },
        },
      },
    },
    {
      kind: "block",
      type: "lists_getIndex",
      inputs: {
        VALUE: {
          block: {
            type: "variables_get",
            fields: {
              VAR: "{listVariable}",
            },
          },
        },
      },
    },
    {
      kind: "block",
      type: "lists_setIndex",
      inputs: {
        LIST: {
          block: {
            type: "variables_get",
            fields: {
              VAR: "{listVariable}",
            },
          },
        },
      },
    },
    {
      kind: "block",
      type: "lists_getSublist",
      inputs: {
        LIST: {
          block: {
            type: "variables_get",
            fields: {
              VAR: "{listVariable}",
            },
          },
        },
      },
    },
    {
      kind: "block",
      type: "lists_split",
      inputs: {
        DELIM: {
          shadow: {
            type: "text",
            fields: {
              TEXT: ",",
            },
          },
        },
      },
    },
  ],
};

export default list;
