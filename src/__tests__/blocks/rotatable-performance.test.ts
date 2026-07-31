import { describe, expect, it, vi } from "vitest";
import * as Blockly from "blockly";
import entityBlock from "@/blocks/entity/entity";
import entityRotatableBlock from "@/blocks/entity/entity_rotatable";
import polygenEntityBlock from "@/blocks/polygen/polygen_entity";
import polygenRotatableBlock from "@/blocks/polygen/polygen_rotatable";

describe("rotatable block event handling", () => {
  it.each([
    ["entity", entityRotatableBlock],
    ["polygen", polygenRotatableBlock],
  ])(
    "ignores unrelated workspace events for %s blocks",
    (_name, definition) => {
      const methods = definition.getBlock!({}) as {
        shouldUpdateEntityOptions: (
          this: {
            id: string;
            getInputTargetBlock: () => { id: string };
          },
          event: { type: string; blockId?: string }
        ) => boolean;
      };
      const context = {
        id: "rotatable-block",
        getInputTargetBlock: () => ({ id: "entity-input" }),
      };

      expect(
        methods.shouldUpdateEntityOptions.call(context, {
          type: Blockly.Events.BLOCK_CHANGE,
          blockId: "unrelated-block",
        })
      ).toBe(false);
      expect(
        methods.shouldUpdateEntityOptions.call(context, {
          type: Blockly.Events.BLOCK_CHANGE,
          blockId: "entity-input",
        })
      ).toBe(true);
    }
  );
});

describe("filtered entity dropdown rendering", () => {
  it.each([
    ["entity", entityBlock, "Entity"],
    ["polygen", polygenEntityBlock, "Polygen"],
  ])(
    "does not rerender unchanged %s options",
    (_name, definition, fieldName) => {
      const methods = definition.getBlock!({}) as {
        updateDropdownOptions: (
          this: {
            filteredByParentBlockId?: string | null;
            getField: () => {
              menuGenerator_: [string, string][] | (() => [string, string][]);
              getValue: () => string;
              setValue: ReturnType<typeof vi.fn>;
              forceRerender: ReturnType<typeof vi.fn>;
            };
          },
          options: [string, string][]
        ) => void;
      };
      const field = {
        menuGenerator_: [
          ["none", ""],
          ["模型", "model-id"],
        ] as [string, string][],
        getValue: () => "model-id",
        setValue: vi.fn(),
        forceRerender: vi.fn(),
      };
      const context = {
        filteredByParentBlockId: null,
        getField: (name?: string) => {
          expect(name).toBe(fieldName);
          return field;
        },
      };

      methods.updateDropdownOptions.call(context, [
        ["none", ""],
        ["模型", "model-id"],
      ]);

      expect(field.setValue).not.toHaveBeenCalled();
      expect(field.forceRerender).not.toHaveBeenCalled();
    }
  );

  it.each([
    ["entity", entityBlock],
    ["polygen", polygenEntityBlock],
  ])(
    "replaces the initial dynamic %s option generator once",
    (_name, definition) => {
      const methods = definition.getBlock!({}) as {
        updateDropdownOptions: (
          this: {
            getField: () => {
              menuGenerator_: [string, string][] | (() => [string, string][]);
              getValue: () => string;
              setValue: ReturnType<typeof vi.fn>;
              forceRerender: ReturnType<typeof vi.fn>;
            };
          },
          options: [string, string][]
        ) => void;
      };
      const field = {
        menuGenerator_: () => [["none", ""]] as [string, string][],
        getValue: () => "",
        setValue: vi.fn(),
        forceRerender: vi.fn(),
      };

      methods.updateDropdownOptions.call(
        {
          getField: () => field,
        },
        [["none", ""]]
      );

      expect(field.menuGenerator_).toEqual([["none", ""]]);
      expect(field.forceRerender).toHaveBeenCalledOnce();
    }
  );
});
