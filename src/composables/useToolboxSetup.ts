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

function normalizeStyle(rawStyle: unknown): string {
  if (typeof rawStyle === "string") return rawStyle.toLowerCase();
  if (Array.isArray(rawStyle)) return rawStyle.join(" ").toLowerCase();
  if (rawStyle && typeof rawStyle === "object") {
    const style = (rawStyle as Record<string, unknown>).style;
    return typeof style === "string" ? style.toLowerCase() : "";
  }
  return "";
}

function hasScope(style: string): boolean {
  return (
    style.includes("base") ||
    style.includes("meta") ||
    style.includes("verse")
  );
}

function inferScopeFromParameters(parameters: unknown): "meta" | "verse" | null {
  if (!parameters || typeof parameters !== "object") return null;
  const resource = (parameters as { resource?: unknown }).resource;
  if (!resource || typeof resource !== "object") return null;

  const res = resource as Record<string, unknown>;
  const hasEntityResources =
    Array.isArray(res.entity) ||
    Array.isArray(res.polygen) ||
    Array.isArray(res.text) ||
    Array.isArray(res.picture) ||
    Array.isArray(res.video) ||
    Array.isArray(res.sound);
  if (hasEntityResources) return "meta";

  const events = res.events as { inputs?: unknown; outputs?: unknown } | undefined;
  const hasSignalEvents =
    !!events &&
    (Array.isArray(events.inputs) || Array.isArray(events.outputs));
  if (hasSignalEvents) return "verse";

  return null;
}

function resolveScopeStyle(rawStyle: unknown, parameters: unknown): string {
  const style = normalizeStyle(rawStyle);
  if (hasScope(style)) return style;

  const scopeByParams = inferScopeFromParameters(parameters);
  if (scopeByParams === "verse") return "base verse";
  if (scopeByParams === "meta") return "base meta";

  const ref = decodeURIComponent((document.referrer || "").toLowerCase());
  if (ref.includes("scene") || ref.includes("场景")) return "base verse";
  if (ref.includes("entity") || ref.includes("实体")) return "base meta";

  const pathname = window.location.pathname.toLowerCase();
  if (pathname.includes("/verse/")) return "base verse";
  if (pathname.includes("/meta/")) return "base meta";
  return "base meta";
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
    style: unknown,
    parameters: unknown,
    access: Access
  ): BlocklyOptions => {
    const toolbox = Custom.setup(resolveScopeStyle(style, parameters), parameters, access);

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
