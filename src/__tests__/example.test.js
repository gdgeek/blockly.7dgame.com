import { describe, it, expect } from "vitest";

describe("Example Test Suite", () => {
  it("should pass a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle arrays", () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it("should handle objects", () => {
    const obj = { name: "blockly", version: "11.2.2" };
    expect(obj).toHaveProperty("name");
    expect(obj.name).toBe("blockly");
  });
});

describe("Async Test Example", () => {
  it("should handle async operations", async () => {
    const promise = Promise.resolve("success");
    await expect(promise).resolves.toBe("success");
  });
});
