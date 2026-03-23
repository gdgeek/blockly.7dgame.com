import { describe, it, expect } from "vitest";
import {
  upgradeTweenData,
  upgradeTweenJson,
} from "@/utils/dataUpgrade";

describe("upgradeTweenData", () => {
  describe("auto-detection", () => {
    it("returns null as-is", () => {
      expect(upgradeTweenData(null)).toBeNull();
    });

    it("returns undefined as-is", () => {
      expect(upgradeTweenData(undefined)).toBeUndefined();
    });

    it("returns non-object primitives as-is", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(upgradeTweenData(42 as any)).toBe(42);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(upgradeTweenData(true as any)).toBe(true);
    });

    it("delegates object input to JSON upgrade path", () => {
      const data = { blocks: { blocks: [] } };
      const result = upgradeTweenData(data);
      expect(result).toEqual({ blocks: { blocks: [] } });
    });

    it("delegates string input to XML upgrade path", () => {
      const xml = '<xml><block type="some-block"></block></xml>';
      const result = upgradeTweenData(xml);
      expect(typeof result).toBe("string");
    });
  });
});

describe("upgradeTweenJson", () => {
  describe("fields.Time to inputs.Time conversion", () => {
    it("converts old fields.Time to inputs.Time with shadow math_number block", () => {
      const data = {
        blocks: {
          blocks: [
            {
              type: "task-tween",
              id: "block1",
              fields: { Time: 1.5 },
            },
          ],
        },
      };

      const result = upgradeTweenJson(data);
      const block = result.blocks!.blocks![0];

      // fields.Time should be removed
      expect(block.fields!.Time).toBeUndefined();

      // inputs.Time should have shadow block
      expect(block.inputs!.Time).toEqual({
        shadow: {
          type: "math_number",
          fields: { NUM: 1.5 },
        },
      });
    });

    it("converts task-tween-to-data blocks the same way", () => {
      const data = {
        blocks: {
          blocks: [
            {
              type: "task-tween-to-data",
              id: "block2",
              fields: { Time: 0.5 },
            },
          ],
        },
      };

      const result = upgradeTweenJson(data);
      const block = result.blocks!.blocks![0];

      expect(block.fields!.Time).toBeUndefined();
      expect(block.inputs!.Time.shadow).toEqual({
        type: "math_number",
        fields: { NUM: 0.5 },
      });
    });
  });

  describe("blocks that don't need upgrading", () => {
    it("does not modify blocks without task-tween type", () => {
      const data = {
        blocks: {
          blocks: [
            {
              type: "some-other-block",
              id: "block3",
              fields: { Time: 2.0 },
            },
          ],
        },
      };

      const result = upgradeTweenJson(data);
      const block = result.blocks!.blocks![0];

      // fields.Time should remain untouched
      expect(block.fields!.Time).toBe(2.0);
      expect(block.inputs).toBeUndefined();
    });

    it("does not modify blocks that already have inputs.Time", () => {
      const existingInput = {
        shadow: {
          type: "math_number",
          fields: { NUM: 0.8 },
        },
      };
      const data = {
        blocks: {
          blocks: [
            {
              type: "task-tween",
              id: "block4",
              inputs: { Time: existingInput },
            },
          ],
        },
      };

      const result = upgradeTweenJson(data);
      const block = result.blocks!.blocks![0];

      // inputs.Time should remain exactly as it was
      expect(block.inputs!.Time).toEqual(existingInput);
    });
  });

  describe("default Time for tween blocks missing both fields and inputs", () => {
    it("adds default inputs.Time with NUM: 0.03 when neither fields.Time nor inputs.Time exist", () => {
      const data = {
        blocks: {
          blocks: [
            {
              type: "task-tween",
              id: "block5",
            },
          ],
        },
      };

      const result = upgradeTweenJson(data);
      const block = result.blocks!.blocks![0];

      expect(block.inputs!.Time).toEqual({
        shadow: {
          type: "math_number",
          fields: { NUM: 0.03 },
        },
      });
    });
  });

  describe("nested blocks are recursively upgraded", () => {
    it("upgrades tween blocks nested inside inputs", () => {
      const data = {
        blocks: {
          blocks: [
            {
              type: "some-parent",
              id: "parent",
              inputs: {
                CHILD: {
                  block: {
                    type: "task-tween",
                    id: "nested1",
                    fields: { Time: 3.0 },
                  },
                },
              },
            },
          ],
        },
      };

      const result = upgradeTweenJson(data);
      const nested = result.blocks!.blocks![0].inputs!.CHILD.block!;

      expect(nested.fields!.Time).toBeUndefined();
      expect(nested.inputs!.Time.shadow!.fields!.NUM).toBe(3.0);
    });

    it("upgrades tween blocks in next chain", () => {
      const data = {
        blocks: {
          blocks: [
            {
              type: "some-block",
              id: "first",
              next: {
                block: {
                  type: "task-tween-to-data",
                  id: "second",
                  fields: { Time: 0.1 },
                },
              },
            },
          ],
        },
      };

      const result = upgradeTweenJson(data);
      const nextBlock = result.blocks!.blocks![0].next!.block;

      expect(nextBlock.fields!.Time).toBeUndefined();
      expect(nextBlock.inputs!.Time.shadow!.fields!.NUM).toBe(0.1);
    });
  });

  describe("empty / edge-case JSON data", () => {
    it("handles JSON with no blocks property gracefully", () => {
      const data = {};
      const result = upgradeTweenJson(data);
      expect(result).toEqual({});
    });

    it("handles JSON with empty blocks.blocks array", () => {
      const data = { blocks: { blocks: [] } };
      const result = upgradeTweenJson(data);
      expect(result).toEqual({ blocks: { blocks: [] } });
    });

    it("handles JSON with blocks but no blocks.blocks", () => {
      const data = { blocks: {} };
      const result = upgradeTweenJson(data);
      expect(result).toEqual({ blocks: {} });
    });
  });
});
