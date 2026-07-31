import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import * as Blockly from "blockly";
import "@/localization";
import type { BlockDefinition } from "@/blocks/helper";
import Entity from "@/blocks/entity/entity";
import EntityMovable from "@/blocks/entity/entity_movable";
import EntityRotatable from "@/blocks/entity/entity_rotatable";
import VisualTooltip from "@/blocks/entity/visual_tooltip";
import PlayAnimation from "@/blocks/polygen/play_animation";
import PolygenEntity from "@/blocks/polygen/polygen_entity";
import PolygenMovable from "@/blocks/polygen/polygen_movable";
import PolygenRotatable from "@/blocks/polygen/polygen_rotatable";
import PlayAnimationTask from "@/blocks/task/play_animation_task";
import type { ResourceFilterIndex } from "@/blocks/resourceFilters";

const resource: ResourceFilterIndex = {
  entity: [
    { name: "Plain entity", uuid: "entity-plain" },
    { name: "Movable entity", uuid: "entity-movable", moved: true },
    { name: "Rotatable entity", uuid: "entity-rotatable", rotate: true },
    { name: "Tooltip entity", uuid: "entity-tooltip", hasTooltips: true },
  ],
  polygen: [
    { name: "Plain polygen", uuid: "polygen-plain", animations: [] },
    {
      name: "Movable polygen",
      uuid: "polygen-movable",
      animations: [],
      moved: true,
    },
    {
      name: "Rotatable polygen",
      uuid: "polygen-rotatable",
      animations: [],
      rotate: true,
    },
    {
      name: "Animated polygen",
      uuid: "polygen-animated",
      animations: ["Idle"],
    },
    {
      name: "Tooltip polygen",
      uuid: "polygen-tooltip",
      animations: [],
      hasTooltips: true,
    },
  ],
};

const definitions: BlockDefinition[] = [
  Entity,
  EntityMovable,
  EntityRotatable,
  VisualTooltip,
  PlayAnimation,
  PolygenEntity,
  PolygenMovable,
  PolygenRotatable,
  PlayAnimationTask,
];

const previousDefinitions = new Map<string, object | undefined>();

const allEntityValues = [
  "",
  "entity-plain",
  "entity-movable",
  "entity-rotatable",
  "entity-tooltip",
];
const allPolygenValues = [
  "",
  "polygen-plain",
  "polygen-movable",
  "polygen-rotatable",
  "polygen-animated",
  "polygen-tooltip",
];

function registerDefinition(definition: BlockDefinition): void {
  previousDefinitions.set(definition.title, Blockly.Blocks[definition.title]);
  Blockly.Blocks[definition.title] = definition.getBlock({
    resource,
  });
}

function restoreDefinitions(): void {
  definitions.forEach((definition) => {
    const previous = previousDefinitions.get(definition.title);
    if (previous) {
      Blockly.Blocks[definition.title] = previous;
    } else {
      delete Blockly.Blocks[definition.title];
    }
  });
  previousDefinitions.clear();
}

async function flushBlocklyEvents(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function getContextInputName(parentType: string): string {
  return parentType === "play_animation" || parentType === "play_animation_task"
    ? "polygen"
    : "entity";
}

function connectContextBlock(
  parent: Blockly.Block,
  child: Blockly.Block
): void {
  const parentConnection = parent.getInput(
    getContextInputName(parent.type)
  )?.connection;
  expect(parentConnection).not.toBeNull();
  expect(child.outputConnection).not.toBeNull();
  const moveEvent = new Blockly.Events.BlockMove(child);
  parentConnection!.connect(child.outputConnection!);
  moveEvent.recordNew();
  moveEvent.setReason(["connect"]);
  Blockly.Events.fire(moveEvent);
}

function disconnectContextBlock(child: Blockly.Block): void {
  expect(child.outputConnection?.isConnected()).toBe(true);
  const moveEvent = new Blockly.Events.BlockMove(child);
  child.outputConnection!.disconnect();
  moveEvent.recordNew();
  moveEvent.setReason(["disconnect"]);
  Blockly.Events.fire(moveEvent);
}

function optionValues(block: Blockly.Block, fieldName: string): string[] {
  const field = block.getField(fieldName);
  expect(field).toBeInstanceOf(Blockly.FieldDropdown);
  return (field as Blockly.FieldDropdown)
    .getOptions(false)
    .map((option) => option[1]);
}

async function createConnectedBlocks(
  workspace: Blockly.Workspace,
  parentType: string,
  childType: "entity" | "polygen_entity",
  order: "parent-first" | "child-first"
): Promise<{ parent: Blockly.Block; child: Blockly.Block }> {
  if (order === "parent-first") {
    const parent = workspace.newBlock(parentType);
    const child = workspace.newBlock(childType);
    await flushBlocklyEvents();
    connectContextBlock(parent, child);
    return { parent, child };
  }

  const child = workspace.newBlock(childType);
  const parent = workspace.newBlock(parentType);
  await flushBlocklyEvents();
  connectContextBlock(parent, child);
  return { parent, child };
}

beforeAll(() => {
  vi.stubGlobal(
    "requestAnimationFrame",
    (callback: FrameRequestCallback): number => {
      callback(0);
      return 1;
    }
  );
  vi.stubGlobal("cancelAnimationFrame", () => {});
  window.lg = "en-US";
  definitions.forEach(registerDefinition);
});

afterAll(() => {
  restoreDefinitions();
  vi.unstubAllGlobals();
});

describe("resource selectors in real Blockly workspaces", () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    workspace = new Blockly.Workspace();
  });

  afterEach(async () => {
    await flushBlocklyEvents();
    workspace.dispose();
    vi.restoreAllMocks();
  });

  const polygenCreationCases = [
    {
      parentType: "polygen_movable",
      expected: ["", "polygen-movable"],
    },
    {
      parentType: "polygen_rotatable",
      expected: ["", "polygen-rotatable"],
    },
    {
      parentType: "play_animation",
      expected: ["", "polygen-animated"],
    },
    {
      parentType: "play_animation_task",
      expected: ["", "polygen-animated"],
    },
    {
      parentType: "visual_tooltip",
      expected: ["", "polygen-tooltip"],
    },
  ].flatMap((context) =>
    (["parent-first", "child-first"] as const).map((order) => ({
      ...context,
      order,
    }))
  );

  it.each(polygenCreationCases)(
    "settles $parentType options with $order listener registration",
    async ({ parentType, expected, order }) => {
      const { child } = await createConnectedBlocks(
        workspace,
        parentType,
        "polygen_entity",
        order
      );

      await flushBlocklyEvents();

      expect(optionValues(child, "Polygen")).toEqual(expected);
    }
  );

  it.each([
    {
      parentType: "entity_movable",
      expected: ["", "entity-movable"],
    },
    {
      parentType: "entity_rotatable",
      expected: ["", "entity-rotatable"],
    },
    {
      parentType: "visual_tooltip",
      expected: ["", "entity-tooltip"],
    },
  ])(
    "restores every entity option after disconnecting from $parentType",
    async ({ parentType, expected }) => {
      const { child } = await createConnectedBlocks(
        workspace,
        parentType,
        "entity",
        "parent-first"
      );
      await flushBlocklyEvents();
      expect(optionValues(child, "Entity")).toEqual(expected);

      disconnectContextBlock(child);
      await flushBlocklyEvents();

      expect(optionValues(child, "Entity")).toEqual(allEntityValues);
    }
  );

  it("uses the current entity connection when contexts switch", async () => {
    const child = workspace.newBlock("entity");
    const movable = workspace.newBlock("entity_movable");
    const rotatable = workspace.newBlock("entity_rotatable");
    const tooltip = workspace.newBlock("visual_tooltip");
    await flushBlocklyEvents();

    connectContextBlock(movable, child);
    await flushBlocklyEvents();
    expect(optionValues(child, "Entity")).toEqual(["", "entity-movable"]);

    disconnectContextBlock(child);
    connectContextBlock(rotatable, child);
    await flushBlocklyEvents();
    expect(optionValues(child, "Entity")).toEqual(["", "entity-rotatable"]);

    disconnectContextBlock(child);
    connectContextBlock(tooltip, child);
    await flushBlocklyEvents();
    expect(optionValues(child, "Entity")).toEqual(["", "entity-tooltip"]);

    disconnectContextBlock(child);
    await flushBlocklyEvents();
    expect(optionValues(child, "Entity")).toEqual(allEntityValues);
  });

  it("restores polygen options after switching and disconnecting", async () => {
    const child = workspace.newBlock("polygen_entity");
    const animation = workspace.newBlock("play_animation");
    const tooltip = workspace.newBlock("visual_tooltip");
    await flushBlocklyEvents();

    connectContextBlock(animation, child);
    await flushBlocklyEvents();
    expect(optionValues(child, "Polygen")).toEqual(["", "polygen-animated"]);

    disconnectContextBlock(child);
    connectContextBlock(tooltip, child);
    await flushBlocklyEvents();
    expect(optionValues(child, "Polygen")).toEqual(["", "polygen-tooltip"]);

    disconnectContextBlock(child);
    await flushBlocklyEvents();
    expect(optionValues(child, "Polygen")).toEqual(allPolygenValues);
  });

  it.each([
    {
      parentType: "polygen_rotatable",
      childType: "polygen_entity" as const,
      fieldName: "Polygen",
      expected: ["", "polygen-rotatable"],
    },
    {
      parentType: "visual_tooltip",
      childType: "entity" as const,
      fieldName: "Entity",
      expected: ["", "entity-tooltip"],
    },
  ])(
    "settles $parentType options after JSON workspace loading",
    async ({ parentType, childType, fieldName, expected }) => {
      Blockly.serialization.workspaces.load(
        {
          blocks: {
            languageVersion: 0,
            blocks: [
              {
                type: parentType,
                inputs: {
                  entity: {
                    block: {
                      type: childType,
                    },
                  },
                },
              },
            ],
          },
        },
        workspace
      );

      await flushBlocklyEvents();

      const child = workspace
        .getAllBlocks(false)
        .find((block) => block.type === childType);
      expect(child).toBeDefined();
      expect(optionValues(child!, fieldName)).toEqual(expected);
    }
  );

  it("coalesces parent and child notifications into one option write", async () => {
    const child = workspace.newBlock("polygen_entity");
    const parent = workspace.newBlock("polygen_movable");
    await flushBlocklyEvents();
    const field = child.getField("Polygen") as Blockly.FieldDropdown;
    const setOptions = vi.spyOn(field, "setOptions");

    connectContextBlock(parent, child);
    await flushBlocklyEvents();

    expect(optionValues(child, "Polygen")).toEqual(["", "polygen-movable"]);
    expect(setOptions).toHaveBeenCalledTimes(1);

    await flushBlocklyEvents();
    expect(setOptions).toHaveBeenCalledTimes(1);
  });
});
