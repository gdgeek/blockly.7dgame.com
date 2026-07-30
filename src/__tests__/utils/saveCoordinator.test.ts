import { describe, expect, it } from "vitest";
import { upgradeTweenData, type BlocklyJsonData } from "@/utils/dataUpgrade";
import {
  hasPersistedChanges,
  prepareWorkspaceInitData,
  SaveCoordinator,
} from "@/utils/saveCoordinator";

describe("prepareWorkspaceInitData", () => {
  it("keeps the persisted baseline independent from an in-place upgrade", () => {
    const source: BlocklyJsonData = {
      blocks: {
        blocks: [
          {
            type: "task-tween",
            id: "legacy-tween",
            fields: { Time: 1.5 },
          },
        ],
      },
    };

    const { baseline, loadData } = prepareWorkspaceInitData<BlocklyJsonData>(
      source,
      (data) => upgradeTweenData(data)
    );

    expect(baseline).not.toBe(source);
    expect(loadData).not.toBe(source);
    expect(baseline.blocks!.blocks![0].fields!.Time).toBe(1.5);
    expect(baseline.blocks!.blocks![0].inputs).toBeUndefined();
    expect(loadData.blocks!.blocks![0].fields!.Time).toBeUndefined();
    expect(loadData.blocks!.blocks![0].inputs!.Time).toEqual({
      shadow: {
        type: "math_number",
        fields: { NUM: 1.5 },
      },
    });
    expect(source.blocks!.blocks![0].fields!.Time).toBe(1.5);
    expect(
      hasPersistedChanges(loadData, { js: "same", lua: "same" }, baseline, {
        js: "same",
        lua: "same",
      })
    ).toBe(true);
    expect(
      hasPersistedChanges(baseline, { js: "same", lua: "same" }, baseline, {
        js: "same",
        lua: "same",
      })
    ).toBe(false);
  });
});

describe("SaveCoordinator", () => {
  it("coalesces repeated saves while one snapshot is pending", () => {
    const coordinator = new SaveCoordinator<{
      saveId: string;
      value: string;
    }>();
    const first = { saveId: "save-1", value: "first" };

    expect(coordinator.begin(first)).toBe(true);
    expect(coordinator.queueIfPending()).toBe(true);
    expect(coordinator.queueIfPending()).toBe(true);
    expect(coordinator.begin({ saveId: "save-2", value: "second" })).toBe(
      false
    );
    expect(coordinator.pending).toBe(first);
    expect(coordinator.hasQueuedSave).toBe(true);

    const settlement = coordinator.settle("save-1");
    expect(settlement).toEqual({
      matched: true,
      snapshot: first,
      hadQueuedSave: true,
    });
    expect(coordinator.hasPending).toBe(false);
    expect(coordinator.hasQueuedSave).toBe(false);
  });

  it("ignores stale ACK/NACK/timeout ids without disturbing the active save", () => {
    const coordinator = new SaveCoordinator<{
      saveId: string;
      value: string;
    }>();
    const active = { saveId: "save-current", value: "current" };

    coordinator.begin(active);
    coordinator.queueIfPending();

    expect(coordinator.settle("save-stale")).toEqual({
      matched: false,
      snapshot: null,
      hadQueuedSave: false,
    });
    expect(coordinator.pending).toBe(active);
    expect(coordinator.hasQueuedSave).toBe(true);
  });

  it("allows exactly one follow-up save after ACK, NACK, or timeout settlement", () => {
    const coordinator = new SaveCoordinator<{ saveId: string }>();

    coordinator.begin({ saveId: "save-1" });
    coordinator.queueIfPending();
    const firstSettlement = coordinator.settle("save-1");
    expect(firstSettlement.hadQueuedSave).toBe(true);

    expect(coordinator.begin({ saveId: "save-2" })).toBe(true);
    expect(coordinator.hasQueuedSave).toBe(false);
    expect(coordinator.settle("save-1").matched).toBe(false);
    expect(coordinator.pending?.saveId).toBe("save-2");
  });
});
