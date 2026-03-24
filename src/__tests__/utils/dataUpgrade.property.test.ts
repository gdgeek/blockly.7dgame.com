import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { upgradeTweenData } from "@/utils/dataUpgrade";

// Generate arbitrary block types (including tween types that trigger upgrade)
const blockTypeArb = fc.constantFrom(
  "task-tween",
  "task-tween-to-data",
  "some-other-block",
  "math_number",
  "logic_boolean"
);

// Generate a simple block with optional fields.Time
interface TestBlock {
  type: string;
  id: string;
  fields?: { Time: number };
}

const blockArb: fc.Arbitrary<TestBlock> = fc.record({
  type: blockTypeArb,
  id: fc.string({ minLength: 1, maxLength: 10 }),
  fields: fc.option(
    fc.record({ Time: fc.float({ min: 0, max: 100, noNaN: true }) }),
    { nil: undefined }
  ),
});

// Generate Blockly JSON data structure
const blocklyDataArb = fc.record({
  blocks: fc.record({
    blocks: fc.array(blockArb, { minLength: 0, maxLength: 5 }),
  }),
});

describe("dataUpgrade property-based tests", () => {
  /**
   * **Validates: Requirements 2.1**
   * Idempotency — Applying upgradeTweenData twice produces the same result
   * as applying it once, for any valid Blockly JSON data.
   */
  it("upgradeTweenData is idempotent: applying twice equals applying once", () => {
    fc.assert(
      fc.property(blocklyDataArb, (data) => {
        // Deep clone to avoid mutation issues
        const data1 = JSON.parse(JSON.stringify(data));
        const data2 = JSON.parse(JSON.stringify(data));

        const once = upgradeTweenData(data1);
        const twice = upgradeTweenData(upgradeTweenData(data2));

        expect(twice).toEqual(once);
      })
    );
  });
});
