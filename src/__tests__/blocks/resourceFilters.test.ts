import { describe, expect, it } from "vitest";
import {
  buildPolygenOptions,
  buildTooltipResourceOptions,
  collectTooltipParentUuids,
  type ResourceFilterIndex,
} from "@/blocks/resourceFilters";
import TaskCircle from "@/blocks/task/task_circle";

const resource: ResourceFilterIndex = {
  polygen: [
    { name: "Static", uuid: "static", animations: [] },
    {
      name: "Animated",
      uuid: "animated",
      animations: ["Idle"],
      hasTooltips: true,
    },
  ],
  entity: [
    { name: "From flag", uuid: "flagged", hasTooltips: true },
    { name: "Plain", uuid: "plain", hasTooltips: false },
  ],
  action: [
    { type: "Tooltip", parentUuid: "from-action" },
    { type: "LabelColor", parentUuid: "not-a-tooltip" },
    { type: "Tooltip", parentUuid: null },
  ],
};

describe("resource filters", () => {
  it("filters model selectors only inside animation blocks", () => {
    expect(buildPolygenOptions(resource, "play_animation")).toEqual([
      ["none", ""],
      ["Animated", "animated"],
    ]);
    expect(buildPolygenOptions(resource, "play_animation_task")).toEqual([
      ["none", ""],
      ["Animated", "animated"],
    ]);
    expect(buildPolygenOptions(resource, "polygen_highlight")).toHaveLength(3);
  });

  it("uses only canonical tooltip fields and explicit hasTooltips flags", () => {
    expect(Array.from(collectTooltipParentUuids(resource)).sort()).toEqual([
      "animated",
      "flagged",
      "from-action",
    ]);
  });

  it("returns only none when no resource carries a tooltip", () => {
    expect(
      buildTooltipResourceOptions(resource.entity, new Set<string>())
    ).toEqual([["none", ""]]);
  });

  it("preconfigures the task loop with an empty list block", () => {
    expect(TaskCircle.toolbox).toMatchObject({
      inputs: {
        TaskArray: {
          block: { type: "lists_create_with" },
        },
      },
    });
  });
});
