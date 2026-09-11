import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import * as Blockly from "blockly";
import "blockly/blocks";
import { replaceWorkspaceTransaction } from "@/utils/webMcpWorkspaceTransaction";
import { registerBackpackSerializer } from "@/plugins/backpack-serializer";

const save = (workspace: Blockly.Workspace) =>
  Blockly.serialization.workspaces.save(workspace) as Record<string, unknown>;
const flush = () =>
  new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
const state = (id: string) => ({
  blocks: {
    languageVersion: 0,
    blocks: [{ type: "math_number", id, fields: { NUM: 7 } }],
  },
});
let workspace: Blockly.WorkspaceSvg | undefined;
let container: HTMLDivElement | undefined;

beforeAll(() => {
  registerBackpackSerializer();
  // jsdom supplies no SVG layout, but the workspace and serializers are real.
  Object.defineProperty(SVGElement.prototype, "getBBox", {
    configurable: true,
    value: () => ({ x: 0, y: 0, width: 100, height: 40 }),
  });
  Object.defineProperty(SVGElement.prototype, "getComputedTextLength", {
    configurable: true,
    value: () => 20,
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    measureText: () => ({ width: 20 }),
  } as unknown as CanvasRenderingContext2D);
});
afterEach(() => {
  workspace?.dispose();
  workspace = undefined;
  container?.remove();
});
const createWorkspace = () => {
  container = document.createElement("div");
  document.body.append(container);
  workspace = Blockly.inject(container, {
    toolbox: undefined,
    sounds: false,
    scrollbars: false,
  });
  return workspace;
};

describe("WebMCP snapshot transaction on a real WorkspaceSvg", () => {
  it("restores blocks, variables, comments and backpack after an SVG-only serializer failure without losing undo history", async () => {
    const live = createWorkspace();
    Blockly.serialization.workspaces.load(
      {
        ...state("old"),
        variables: [{ id: "var-old", name: "score" }],
        backpack: [{ type: "math_number", fields: { NUM: 10 } }],
        comments: [
          {
            id: "comment-old",
            text: "Keep me",
            x: 1,
            y: 2,
            width: 100,
            height: 50,
            minimized: false,
          },
        ],
      },
      live
    );
    await flush();
    live.clearUndo();
    live.getBlockById("old")!.setFieldValue(9, "NUM");
    await vi.waitFor(() => expect(live.getUndoStack()).toHaveLength(1));
    const before = save(live);
    const oldUndoCount = live.getUndoStack().length;
    Blockly.serialization.registry.register("webmcp-test-svg-failure", {
      priority: -100,
      save: () => null,
      clear: () => {},
      load: (_state, target) => {
        if (target instanceof Blockly.WorkspaceSvg)
          throw new Error("SVG serializer failed after blocks loaded");
      },
    });
    try {
      expect(() =>
        replaceWorkspaceTransaction(
          live,
          { ...state("partial"), "webmcp-test-svg-failure": true },
          save
        )
      ).toThrow("SVG serializer failed");
      await flush();
      expect(save(live)).toEqual(before);
      expect(live.getUndoStack()).toHaveLength(oldUndoCount);
      live.undo(false);
      expect(live.getBlockById("old")!.getFieldValue("NUM")).toBe(7);
    } finally {
      Blockly.serialization.registry.unregister("webmcp-test-svg-failure");
    }
  });

  it("commits exactly one undo entry, restores the whole state and supports redo", async () => {
    const live = createWorkspace();
    Blockly.serialization.workspaces.load(state("old"), live);
    await flush();
    live.clearUndo();
    const before = save(live);
    replaceWorkspaceTransaction(live, state("new"), save);
    await flush();
    const after = save(live);
    expect(live.getUndoStack()).toHaveLength(1);
    live.undo(false);
    expect(save(live)).toEqual(before);
    await flush();
    live.undo(true);
    expect(save(live)).toEqual(after);
  });
});
