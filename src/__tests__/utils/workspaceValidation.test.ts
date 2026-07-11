import { describe, expect, it, vi, beforeEach } from "vitest";
import type * as Blockly from "blockly/core";
import type { GeneratedCode } from "@/composables/useCodeGenerator";
import { registerMathRandomRangeGenerators } from "@/custom/math_random_range";
import { validateWorkspaceForSave } from "@/utils/workspaceValidation";

type RandomRangeBlockType = "math_random_int" | "math_random_float_range";

const createNumberBlock = (
  value: number,
  type = "math_number"
): Blockly.Block =>
  ({
    type,
    getFieldValue: vi.fn().mockReturnValue(String(value)),
  } as unknown as Blockly.Block);

const createDynamicNumberBlock = (): Blockly.Block =>
  ({
    type: "math_arithmetic",
  } as unknown as Blockly.Block);

const createRandomRangeBlock = (
  type: RandomRangeBlockType,
  from: Blockly.Block,
  to: Blockly.Block
): Blockly.Block =>
  ({
    id: `${type}-test-block`,
    type,
    isEnabled: vi.fn().mockReturnValue(true),
    isInFlyout: false,
    getSvgRoot: vi.fn().mockReturnValue(null),
    outputConnection: {
      isConnected: vi.fn().mockReturnValue(true),
    },
    getInputTargetBlock: vi.fn((name: string) => {
      if (name === "FROM") return from;
      if (name === "TO") return to;
      return null;
    }),
    select: vi.fn(),
    setWarningText: vi.fn(),
    toString: vi.fn().mockReturnValue("random range"),
  } as unknown as Blockly.Block);

const createWorkspace = (block: Blockly.Block): Blockly.Workspace =>
  ({
    getAllBlocks: vi.fn().mockReturnValue([block]),
  } as unknown as Blockly.Workspace);

const createGenerateAll = () =>
  vi.fn(
    (): GeneratedCode => ({
      js: "const ok = true;",
      lua: "-- ok",
    })
  );

describe("workspace random range validation", () => {
  beforeEach(() => {
    registerMathRandomRangeGenerators();
  });

  it.each<[
    RandomRangeBlockType,
    number,
    number
  ]>([
    ["math_random_int", 10, 3],
    ["math_random_int", 5, 5],
    ["math_random_float_range", 10, 3],
    ["math_random_float_range", 5, 5],
  ])("rejects %s when from value %s is not smaller than to value %s", (
    type,
    fromValue,
    toValue
  ) => {
    const block = createRandomRangeBlock(
      type,
      createNumberBlock(fromValue),
      createNumberBlock(toValue)
    );
    const generateAll = createGenerateAll();

    const result = validateWorkspaceForSave(createWorkspace(block), generateAll);

    expect(result.ok).toBe(false);
    expect(result.issue?.block).toBe(block);
    expect(result.issue?.message).toContain("左侧数值必须小于右侧数值");
    expect(generateAll).not.toHaveBeenCalled();
  });

  it.each<RandomRangeBlockType>([
    "math_random_int",
    "math_random_float_range",
  ])("allows %s when from value is smaller than to value", (type) => {
    const block = createRandomRangeBlock(
      type,
      createNumberBlock(1),
      createNumberBlock(2)
    );
    const generateAll = createGenerateAll();

    const result = validateWorkspaceForSave(createWorkspace(block), generateAll);

    expect(result.ok).toBe(true);
    expect(result.generated).toEqual({ js: "const ok = true;", lua: "-- ok" });
    expect(generateAll).toHaveBeenCalledOnce();
  });

  it.each<RandomRangeBlockType>([
    "math_random_int",
    "math_random_float_range",
  ])("does not reject %s when either side is dynamic", (type) => {
    const block = createRandomRangeBlock(
      type,
      createDynamicNumberBlock(),
      createNumberBlock(0)
    );
    const generateAll = createGenerateAll();

    const result = validateWorkspaceForSave(createWorkspace(block), generateAll);

    expect(result.ok).toBe(true);
    expect(generateAll).toHaveBeenCalledOnce();
  });
});
