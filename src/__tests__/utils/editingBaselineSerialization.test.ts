import { describe, expect, it } from "vitest";
import * as Blockly from "blockly";
import "blockly/blocks";
import { upgradeTweenData } from "@/utils/dataUpgrade";
import {
  cloneWorkspaceValue,
  hasWorkspaceChanges,
} from "@/utils/saveCoordinator";

describe("normalized editing baseline serialization", () => {
  it("retains migrated shadow IDs when a rebuilt workspace uses cached C", () => {
    const previousDefinition = Blockly.Blocks["task-tween"];
    Blockly.Blocks["task-tween"] = {
      init(this: Blockly.Block) {
        this.appendValueInput("Time").setCheck("Number");
        this.setOutput(true, "Task");
      },
    };
    const workspace = new Blockly.Workspace();
    const persistedData = {
      blocks: {
        languageVersion: 0,
        blocks: [
          { type: "task-tween", id: "legacy-tween", fields: { Time: 1.5 } },
        ],
      },
    };
    try {
      Blockly.serialization.workspaces.load(
        upgradeTweenData(cloneWorkspaceValue(persistedData)) as Record<
          string,
          unknown
        >,
        workspace
      );
      const cachedBaseline = Blockly.serialization.workspaces.save(workspace);
      expect(hasWorkspaceChanges(cachedBaseline, persistedData)).toBe(true);

      // Independently migrating raw P assigns a fresh ID, so it cannot recover C.
      Blockly.serialization.workspaces.load(
        upgradeTweenData(cloneWorkspaceValue(persistedData)) as Record<
          string,
          unknown
        >,
        workspace
      );
      const independentlyNormalized =
        Blockly.serialization.workspaces.save(workspace);
      expect(hasWorkspaceChanges(independentlyNormalized, cachedBaseline)).toBe(
        true
      );

      Blockly.serialization.workspaces.load(
        cloneWorkspaceValue(cachedBaseline),
        workspace
      );
      const rebuilt = Blockly.serialization.workspaces.save(workspace);
      expect(hasWorkspaceChanges(rebuilt, cachedBaseline)).toBe(false);
    } finally {
      workspace.dispose();
      if (previousDefinition === undefined) delete Blockly.Blocks["task-tween"];
      else Blockly.Blocks["task-tween"] = previousDefinition;
    }
  });
});
