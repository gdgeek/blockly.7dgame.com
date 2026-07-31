import { afterEach, describe, expect, it, vi } from "vitest";
import * as Blockly from "blockly";
import {
  applyResourceDropdownOptions,
  isCreateOrMoveEventForBlocks,
  rememberResourceDropdownOptions,
  type ResourceDropdownField,
  type ResourceDropdownOption,
} from "@/blocks/resourceDropdownOptions";

interface FakeDropdownField extends ResourceDropdownField {
  currentOptions: ResourceDropdownOption[];
  currentValue: string;
  emittedChanges: Array<[string, string]>;
  setOptions: ReturnType<typeof vi.fn>;
  setValue: ReturnType<typeof vi.fn>;
  forceRerender: ReturnType<typeof vi.fn>;
}

function createField(
  options: ResourceDropdownOption[],
  currentValue: string
): FakeDropdownField {
  const field = {
    currentOptions: options.map(([label, value]) => [label, value]),
    currentValue,
    emittedChanges: [],
    getOptions: () => field.currentOptions,
    getValue: () => field.currentValue,
    setOptions: vi.fn(),
    setValue: vi.fn(),
    forceRerender: vi.fn(),
  } as FakeDropdownField;

  field.setValue.mockImplementation((value: string) => {
    const oldValue = field.currentValue;
    field.currentValue = value;
    if (oldValue !== value && Blockly.Events.isEnabled()) {
      field.emittedChanges.push([oldValue, value]);
    }
  });
  field.setOptions.mockImplementation(
    (nextOptions: ResourceDropdownOption[]) => {
      field.currentOptions = nextOptions.map(([label, value]) => [
        label,
        value,
      ]);
      field.setValue(nextOptions[0][1]);
    }
  );

  return field;
}

afterEach(() => {
  while (!Blockly.Events.isEnabled()) {
    Blockly.Events.enable();
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("resource dropdown option updates", () => {
  it("matches Blockly's real field-change semantics without feedback events", async () => {
    vi.stubGlobal(
      "requestAnimationFrame",
      (callback: FrameRequestCallback): number => {
        callback(0);
        return 1;
      }
    );
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock("controls_if");
    const field = new Blockly.FieldDropdown([
      ["none", ""],
      ["Current", "current"],
    ]);
    block.appendDummyInput("resource-test").appendField(field, "RESOURCE");
    field.setValue("current");

    const changes: Array<{ oldValue?: unknown; newValue?: unknown }> = [];
    workspace.addChangeListener((event) => {
      if (
        event.type === Blockly.Events.BLOCK_CHANGE &&
        "element" in event &&
        event.element === "field"
      ) {
        changes.push(
          event as unknown as { oldValue?: unknown; newValue?: unknown }
        );
      }
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      changes.length = 0;
      rememberResourceDropdownOptions(field, [
        ["none", ""],
        ["Current", "current"],
      ]);

      applyResourceDropdownOptions(field, [
        ["none", ""],
        ["Renamed current", "current"],
      ]);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(field.getValue()).toBe("current");
      expect(changes).toEqual([]);

      applyResourceDropdownOptions(field, [
        ["none", ""],
        ["Other", "other"],
      ]);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(field.getValue()).toBe("");
      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({
        oldValue: "current",
        newValue: "",
      });

      applyResourceDropdownOptions(field, [
        ["none", ""],
        ["Other", "other"],
      ]);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(changes).toHaveLength(1);
    } finally {
      workspace.dispose();
    }
  });

  it("does nothing when a newly allocated option list is semantically equal", () => {
    const options: ResourceDropdownOption[] = [
      ["none", ""],
      ["Entity", "entity-1"],
    ];
    const field = createField(options, "entity-1");
    rememberResourceDropdownOptions(field, options);

    expect(
      applyResourceDropdownOptions(field, [
        ["none", ""],
        ["Entity", "entity-1"],
      ])
    ).toBe(false);
    expect(field.setOptions).not.toHaveBeenCalled();
    expect(field.setValue).not.toHaveBeenCalled();
    expect(field.forceRerender).not.toHaveBeenCalled();
  });

  it("silently restores a current value that remains valid", () => {
    const initialOptions: ResourceDropdownOption[] = [
      ["none", ""],
      ["First", "first"],
      ["Current", "current"],
    ];
    const field = createField(initialOptions, "current");
    rememberResourceDropdownOptions(field, initialOptions);
    const disable = vi.spyOn(Blockly.Events, "disable");
    const enable = vi.spyOn(Blockly.Events, "enable");

    expect(
      applyResourceDropdownOptions(field, [
        ["none", ""],
        ["Renamed current", "current"],
      ])
    ).toBe(true);
    expect(field.currentValue).toBe("current");
    expect(field.emittedChanges).toEqual([]);
    expect(disable).toHaveBeenCalledTimes(1);
    expect(enable).toHaveBeenCalledTimes(1);
    expect(field.setOptions).toHaveBeenCalledTimes(1);
    expect(field.forceRerender).toHaveBeenCalledTimes(1);
    expect(Blockly.Events.isEnabled()).toBe(true);
  });

  it("lets Blockly emit one real change when the old value is unavailable", () => {
    const initialOptions: ResourceDropdownOption[] = [
      ["none", ""],
      ["Current", "current"],
    ];
    const field = createField(initialOptions, "current");
    rememberResourceDropdownOptions(field, initialOptions);
    const disable = vi.spyOn(Blockly.Events, "disable");

    expect(
      applyResourceDropdownOptions(field, [
        ["none", ""],
        ["Other", "other"],
      ])
    ).toBe(true);
    expect(field.currentValue).toBe("");
    expect(field.emittedChanges).toEqual([["current", ""]]);
    expect(disable).not.toHaveBeenCalled();
    expect(field.setValue).toHaveBeenCalledTimes(1);
    expect(field.forceRerender).toHaveBeenCalledTimes(1);

    // The resulting Blockly change event may re-enter the surrounding
    // onchange handlers. Reapplying the same filter must stop there.
    expect(
      applyResourceDropdownOptions(field, [
        ["none", ""],
        ["Other", "other"],
      ])
    ).toBe(false);
    expect(field.emittedChanges).toEqual([["current", ""]]);
    expect(field.setOptions).toHaveBeenCalledTimes(1);
    expect(field.forceRerender).toHaveBeenCalledTimes(1);
  });

  it("recognizes only create and move events that reference relevant blocks", () => {
    expect(
      isCreateOrMoveEventForBlocks(
        { type: Blockly.Events.BLOCK_MOVE, blockId: "child" },
        ["parent", "child"]
      )
    ).toBe(true);
    expect(
      isCreateOrMoveEventForBlocks(
        { type: Blockly.Events.BLOCK_CREATE, ids: ["parent", "child"] },
        ["child"]
      )
    ).toBe(true);
    expect(
      isCreateOrMoveEventForBlocks(
        { type: Blockly.Events.BLOCK_MOVE, blockId: "unrelated" },
        ["parent", "child"]
      )
    ).toBe(false);
    expect(
      isCreateOrMoveEventForBlocks(
        { type: Blockly.Events.BLOCK_CHANGE, blockId: "child" },
        ["child"]
      )
    ).toBe(false);
  });
});
