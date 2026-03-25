import * as Custom from "../custom";
import type { Access } from "../utils/Access";
import { useTheme } from "./useTheme";

/** Default grid configuration for the Blockly workspace. */
const DEFAULT_GRID = {
  spacing: 20,
  length: 3,
  colour: "#ccc",
  snap: true,
} as const;

/** Default move / scrollbar configuration. */
const DEFAULT_MOVE = {
  scrollbars: {
    horizontal: true,
    vertical: true,
  },
  drag: true,
  wheel: false,
} as const;

/** Default zoom configuration. */
const DEFAULT_ZOOM = {
  startScale: 1.0,
  maxScale: 3,
  minScale: 0.3,
  controls: true,
  wheel: true,
  pinch: true,
} as const;

/** Shape of the options object passed to the BlocklyComponent. */
export interface BlocklyOptions {
  media: string;
  renderer?: string;
  theme?: unknown;
  grid: typeof DEFAULT_GRID;
  toolbox: unknown;
  move: typeof DEFAULT_MOVE;
  zoom: typeof DEFAULT_ZOOM;
}

/**
 * Composable that encapsulates toolbox construction and default Blockly
 * workspace options.
 *
 * Keeps the `Custom.setup` call and the grid / move / zoom defaults in one
 * place so App.vue doesn't need to know about them.
 */
export function useToolboxSetup() {
  const { getTheme } = useTheme();

  /**
   * Build the full Blockly options object for a given style, parameter set,
   * and access level.
   */
  const buildOptions = (
    style: string,
    parameters: unknown,
    access: Access
  ): BlocklyOptions => {
    const toolbox = Custom.setup(style, parameters, access);

    return {
      media: "media/",
      renderer: "thrasos",
      theme: getTheme(),
      grid: { ...DEFAULT_GRID },
      toolbox,
      move: {
        ...DEFAULT_MOVE,
        scrollbars: { ...DEFAULT_MOVE.scrollbars },
      },
      zoom: { ...DEFAULT_ZOOM },
    };
  };

  return {
    buildOptions,
  };
}
