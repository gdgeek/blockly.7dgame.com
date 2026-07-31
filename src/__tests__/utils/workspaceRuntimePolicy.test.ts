import { describe, expect, it } from "vitest";
import * as Blockly from "blockly";
import {
  resolveActiveWorkspace,
  shouldQueueWorkspaceUpdate,
} from "@/utils/workspaceRuntimePolicy";

describe("workspace runtime policy", () => {
  it("allows save access only to the active editor workspace", () => {
    const activeWorkspace = { id: "active" };
    const staleWorkspace = { id: "stale" };

    expect(resolveActiveWorkspace(activeWorkspace, activeWorkspace)).toBe(
      activeWorkspace
    );
    expect(resolveActiveWorkspace(staleWorkspace, activeWorkspace)).toBeNull();
    expect(resolveActiveWorkspace(null, activeWorkspace)).toBeNull();
    expect(resolveActiveWorkspace(activeWorkspace, null)).toBeNull();
  });

  it("suppresses the queued load marker after the explicit INIT update", () => {
    const initUpdateCount =
      1 +
      [
        {
          type: Blockly.Events.FINISHED_LOADING,
        },
      ].filter(shouldQueueWorkspaceUpdate).length;

    expect(initUpdateCount).toBe(1);
  });

  it("keeps later real workspace changes while ignoring feedback-only events", () => {
    expect(
      shouldQueueWorkspaceUpdate({
        type: Blockly.Events.BLOCK_CHANGE,
        element: "field",
      })
    ).toBe(true);
    expect(
      shouldQueueWorkspaceUpdate({
        type: Blockly.Events.BLOCK_MOVE,
      })
    ).toBe(true);
    expect(
      shouldQueueWorkspaceUpdate({
        type: Blockly.Events.BLOCK_CHANGE,
        element: "warning",
      })
    ).toBe(false);
    expect(
      shouldQueueWorkspaceUpdate({
        type: Blockly.Events.SELECTED,
        isUiEvent: true,
      })
    ).toBe(false);
  });
});
