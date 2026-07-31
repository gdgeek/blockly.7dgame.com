import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Blockly from "blockly/core";
import type { GeneratedCode } from "@/composables/useCodeGenerator";
import { registerMathRandomRangeGenerators } from "@/custom/math_random_range";
import {
  clearTrackedWorkspaceValidationFeedback,
  serializeWorkspaceWarnings,
  showWorkspaceValidationWarnings,
  validateWorkspaceForSave,
} from "@/utils/workspaceValidation";

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

const createTestBlock = (
  overrides: Record<string, unknown> = {}
): Blockly.Block =>
  ({
    id: "test-block",
    type: "math_random_int",
    isEnabled: vi.fn().mockReturnValue(true),
    isInFlyout: false,
    inputList: [],
    getInputTargetBlock: vi.fn().mockReturnValue(null),
    getSvgRoot: vi.fn().mockReturnValue(null),
    select: vi.fn(),
    setWarningText: vi.fn(),
    toString: vi.fn().mockReturnValue("test block"),
    ...overrides,
  } as unknown as Blockly.Block);

const createRandomRangeBlock = (
  type: RandomRangeBlockType,
  from: Blockly.Block,
  to: Blockly.Block
): Blockly.Block =>
  createTestBlock({
    id: `${type}-test-block`,
    type,
    outputConnection: {
      isConnected: vi.fn().mockReturnValue(true),
    },
    getInputTargetBlock: vi.fn((name: string) => {
      if (name === "FROM") return from;
      if (name === "TO") return to;
      return null;
    }),
    toString: vi.fn().mockReturnValue("random range"),
  });

const createWorkspace = (...blocks: Blockly.Block[]): Blockly.Workspace =>
  ({
    getAllBlocks: vi.fn().mockReturnValue(blocks),
  } as unknown as Blockly.Workspace);

const createGenerateAll = (
  generated: GeneratedCode = {
    js: "const ok = true;",
    lua: "-- ok",
  }
) => vi.fn((): GeneratedCode => generated);

describe("workspace save validation", () => {
  beforeEach(() => {
    registerMathRandomRangeGenerators();
  });

  it.each<[RandomRangeBlockType, number, number]>([
    ["math_random_int", 10, 3],
    ["math_random_int", 5, 5],
    ["math_random_float_range", 10, 3],
    ["math_random_float_range", 5, 5],
  ])(
    "warns without blocking %s when %s is not smaller than %s",
    (type, fromValue, toValue) => {
      const block = createRandomRangeBlock(
        type,
        createNumberBlock(fromValue),
        createNumberBlock(toValue)
      );
      const generateAll = createGenerateAll();

      const result = validateWorkspaceForSave(
        createWorkspace(block),
        generateAll
      );

      expect(result.ok).toBe(true);
      expect(result.generated).toEqual({
        js: "const ok = true;",
        lua: "-- ok",
      });
      expect(result.error).toBeUndefined();
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            block,
            code: "invalid-random-range",
            severity: "warning",
          }),
        ])
      );
      expect(generateAll).toHaveBeenCalledOnce();
    }
  );

  it.each<RandomRangeBlockType>(["math_random_int", "math_random_float_range"])(
    "allows valid or dynamic %s ranges without a range warning",
    (type) => {
      const validBlock = createRandomRangeBlock(
        type,
        createNumberBlock(1),
        createNumberBlock(2)
      );
      const dynamicBlock = createRandomRangeBlock(
        type,
        createDynamicNumberBlock(),
        createNumberBlock(0)
      );
      const generateAll = createGenerateAll();

      const validResult = validateWorkspaceForSave(
        createWorkspace(validBlock),
        generateAll
      );
      const dynamicResult = validateWorkspaceForSave(
        createWorkspace(dynamicBlock),
        generateAll
      );

      expect(validResult.ok).toBe(true);
      expect(dynamicResult.ok).toBe(true);
      expect(validResult.warnings).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: "invalid-random-range" }),
        ])
      );
      expect(dynamicResult.warnings).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: "invalid-random-range" }),
        ])
      );
    }
  );

  it("collects every structural violation as a non-blocking warning", () => {
    const missingInputBlock = createTestBlock({
      id: "missing-input",
      inputList: [
        {
          name: "VALUE",
          type: Blockly.inputs.inputTypes.VALUE,
          connection: { targetBlock: vi.fn().mockReturnValue(null) },
          fieldRow: [],
        },
      ],
      outputConnection: { isConnected: vi.fn().mockReturnValue(true) },
    });
    const missingResourceBlock = createTestBlock({
      id: "missing-resource",
      inputList: [
        {
          name: "resource",
          type: Blockly.inputs.inputTypes.DUMMY,
          fieldRow: [{ name: "Entity", getValue: vi.fn().mockReturnValue("") }],
        },
      ],
    });
    const detachedStatementBlock = createTestBlock({
      id: "detached-statement",
      previousConnection: { isConnected: vi.fn().mockReturnValue(false) },
    });
    const detachedValueBlock = createTestBlock({
      id: "detached-value",
      outputConnection: { isConnected: vi.fn().mockReturnValue(false) },
    });
    const missingGeneratorBlock = createTestBlock({
      id: "missing-generator",
      type: "custom_block_without_generators",
    });
    const malformedSignalBlock = createTestBlock({
      id: "malformed-signal",
      type: "output_signal",
      getFieldValue: vi.fn((name: string) =>
        name === "Output" ? "{legacy-invalid-json" : ""
      ),
    });
    const generateAll = createGenerateAll();

    const result = validateWorkspaceForSave(
      createWorkspace(
        missingInputBlock,
        missingResourceBlock,
        detachedStatementBlock,
        detachedValueBlock,
        missingGeneratorBlock,
        malformedSignalBlock
      ),
      generateAll
    );

    const warningCodes = new Set(result.warnings.map(({ code }) => code));
    expect(result.ok).toBe(true);
    expect(result.generated).toEqual({ js: "const ok = true;", lua: "-- ok" });
    expect(warningCodes).toEqual(
      new Set([
        "missing-code-generator",
        "missing-value-input",
        "missing-resource-field",
        "malformed-signal-reference",
        "detached-statement-block",
        "detached-value-block",
      ])
    );
    expect(
      result.warnings.every(({ severity }) => severity === "warning")
    ).toBe(true);
    expect(generateAll).toHaveBeenCalledOnce();
  });

  it("reports invalid JavaScript and Lua as warnings and still returns code", () => {
    const generated = {
      js: "const = ;",
      lua: "function(",
    };

    const result = validateWorkspaceForSave(
      createWorkspace(),
      createGenerateAll(generated)
    );

    expect(result.ok).toBe(true);
    expect(result.generated).toEqual(generated);
    expect(result.error).toBeUndefined();
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-generated-javascript",
          language: "javascript",
          severity: "warning",
        }),
        expect.objectContaining({
          code: "invalid-generated-lua",
          language: "lua",
          severity: "warning",
        }),
      ])
    );
  });

  it("parses JavaScript in the host async-function context", () => {
    const result = validateWorkspaceForSave(
      createWorkspace(),
      createGenerateAll({
        js: "await task.run();\nreturn true;",
        lua: "-- ok",
      })
    );

    expect(result.ok).toBe(true);
    expect(result.warnings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid-generated-javascript" }),
      ])
    );
  });

  it("warns when a historical JavaScript generator emits Lua runtime calls", () => {
    const result = validateWorkspaceForSave(
      createWorkspace(),
      createGenerateAll({
        js: "CS.MLua.Point.Explode(undefined, 0.1);",
        lua: "-- ok",
      })
    );

    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "lua-runtime-in-javascript",
          language: "javascript",
        }),
      ])
    );
  });

  it("keeps saving when a validation check itself fails", () => {
    const workspace = {
      getAllBlocks: vi.fn(() => {
        throw new Error("legacy block inspection failed");
      }),
    } as unknown as Blockly.Workspace;
    const generateAll = createGenerateAll();

    const result = validateWorkspaceForSave(workspace, generateAll);

    expect(result.ok).toBe(true);
    expect(result.generated).toEqual({ js: "const ok = true;", lua: "-- ok" });
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "workspace-validation-failed",
          message: expect.stringContaining("legacy block inspection failed"),
        }),
      ])
    );
    expect(generateAll).toHaveBeenCalledOnce();
  });

  it("serializes warnings without retaining Blockly block objects", () => {
    const block = createRandomRangeBlock(
      "math_random_int",
      createNumberBlock(5),
      createNumberBlock(5)
    );
    const result = validateWorkspaceForSave(
      createWorkspace(block),
      createGenerateAll({ js: "const = ;", lua: "-- ok" })
    );

    const serialized = serializeWorkspaceWarnings(result.warnings);
    const roundTripped = JSON.parse(JSON.stringify(serialized)) as Array<
      Record<string, unknown>
    >;

    expect(serialized).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          blockId: block.id,
          code: "invalid-random-range",
          severity: "warning",
        }),
        expect.objectContaining({
          code: "invalid-generated-javascript",
          language: "javascript",
        }),
      ])
    );
    expect(serialized.every((item) => !("block" in item))).toBe(true);
    expect(roundTripped.every((item) => !("block" in item))).toBe(true);
    expect(roundTripped).toHaveLength(serialized.length);
    expect(roundTripped.map(({ code }) => code)).toEqual(
      serialized.map(({ code }) => code)
    );
  });

  it("clears displayed warnings on the next edit without scanning all blocks", () => {
    const classList = {
      add: vi.fn(),
      remove: vi.fn(),
    };
    const block = createTestBlock({
      getSvgRoot: vi.fn().mockReturnValue({ classList }),
    });
    const workspace = {
      getAllBlocks: vi.fn(),
      centerOnBlock: vi.fn(),
    } as unknown as Blockly.WorkspaceSvg;

    showWorkspaceValidationWarnings(workspace, [
      {
        block,
        code: "test-warning",
        severity: "warning",
        message: "warning text",
      },
    ]);
    clearTrackedWorkspaceValidationFeedback(workspace);

    expect(block.setWarningText).toHaveBeenNthCalledWith(
      1,
      "warning text",
      "save-validation"
    );
    expect(block.setWarningText).toHaveBeenNthCalledWith(
      2,
      null,
      "save-validation"
    );
    expect(classList.add).toHaveBeenCalledWith(
      "blockly-save-validation-warning"
    );
    expect(classList.remove).toHaveBeenCalledWith(
      "blockly-save-validation-warning"
    );
    expect(workspace.getAllBlocks).not.toHaveBeenCalled();
  });

  it("reserves ok:false for a technical generator failure", () => {
    const result = validateWorkspaceForSave(createWorkspace(), () => {
      throw new Error("generator crashed");
    });

    expect(result.ok).toBe(false);
    expect(result.generated).toBeUndefined();
    expect(result.error).toEqual(
      expect.objectContaining({
        code: "code-generation-failed",
        severity: "warning",
        message: expect.stringContaining("generator crashed"),
      })
    );
  });
});
