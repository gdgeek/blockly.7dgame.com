import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("blockly/javascript", () => ({
  javascriptGenerator: {
    workspaceToCode: vi.fn(),
  },
}));
vi.mock("blockly/lua", () => ({
  luaGenerator: {
    workspaceToCode: vi.fn(),
  },
}));
vi.mock("blockly", () => ({
  default: {},
}));

import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import { useCodeGenerator } from "@/composables/useCodeGenerator";

describe("useCodeGenerator", () => {
  const fakeWorkspace = { id: "test-workspace" } as any;

  beforeEach(() => {
    vi.mocked(javascriptGenerator.workspaceToCode).mockReset();
    vi.mocked(luaGenerator.workspaceToCode).mockReset();
  });

  describe("generateJavaScript", () => {
    it("calls javascriptGenerator.workspaceToCode with the workspace and returns the result", () => {
      vi.mocked(javascriptGenerator.workspaceToCode).mockReturnValue(
        "var x = 1;"
      );
      const { generateJavaScript } = useCodeGenerator();

      const result = generateJavaScript(fakeWorkspace);

      expect(javascriptGenerator.workspaceToCode).toHaveBeenCalledWith(
        fakeWorkspace
      );
      expect(result).toBe("var x = 1;");
    });
  });

  describe("generateLua", () => {
    it("calls luaGenerator.workspaceToCode with the workspace and returns the result", () => {
      vi.mocked(luaGenerator.workspaceToCode).mockReturnValue("local x = 1");
      const { generateLua } = useCodeGenerator();

      const result = generateLua(fakeWorkspace);

      expect(luaGenerator.workspaceToCode).toHaveBeenCalledWith(fakeWorkspace);
      expect(result).toBe("local x = 1");
    });
  });

  describe("generateAll", () => {
    it("returns both js and lua code strings", () => {
      vi.mocked(javascriptGenerator.workspaceToCode).mockReturnValue(
        'console.log("hi");'
      );
      vi.mocked(luaGenerator.workspaceToCode).mockReturnValue('print("hi")');
      const { generateAll } = useCodeGenerator();

      const result = generateAll(fakeWorkspace);

      expect(result).toEqual({
        js: 'console.log("hi");',
        lua: 'print("hi")',
      });
    });

    it("passes the workspace argument through to both generators", () => {
      vi.mocked(javascriptGenerator.workspaceToCode).mockReturnValue("");
      vi.mocked(luaGenerator.workspaceToCode).mockReturnValue("");
      const { generateAll } = useCodeGenerator();

      generateAll(fakeWorkspace);

      expect(javascriptGenerator.workspaceToCode).toHaveBeenCalledWith(
        fakeWorkspace
      );
      expect(luaGenerator.workspaceToCode).toHaveBeenCalledWith(fakeWorkspace);
    });
  });

  describe("generateAllSafely", () => {
    it("returns both newly generated languages when neither generator fails", () => {
      vi.mocked(javascriptGenerator.workspaceToCode).mockReturnValue(
        "const ready = true;"
      );
      vi.mocked(luaGenerator.workspaceToCode).mockReturnValue("ready = true");
      const { generateAllSafely } = useCodeGenerator();

      const result = generateAllSafely(fakeWorkspace, {
        js: "previous js",
        lua: "previous lua",
      });

      expect(result).toEqual({
        generated: {
          js: "const ready = true;",
          lua: "ready = true",
        },
        warnings: [],
      });
    });

    it("keeps the JavaScript fallback while still updating Lua", () => {
      vi.mocked(javascriptGenerator.workspaceToCode).mockImplementation(() => {
        throw new Error("broken JavaScript block");
      });
      vi.mocked(luaGenerator.workspaceToCode).mockReturnValue("fresh_lua()");
      const fallback = { js: "last valid js", lua: "last valid lua" };
      const { generateAllSafely } = useCodeGenerator();

      const result = generateAllSafely(fakeWorkspace, fallback);

      expect(result.generated).toEqual({
        js: "last valid js",
        lua: "fresh_lua()",
      });
      expect(result.warnings).toEqual([
        {
          code: "code-generation-failed",
          language: "javascript",
          message: expect.stringContaining("broken JavaScript block"),
        },
      ]);
      expect(luaGenerator.workspaceToCode).toHaveBeenCalledWith(fakeWorkspace);
      expect(fallback).toEqual({ js: "last valid js", lua: "last valid lua" });
    });

    it("keeps the Lua fallback while still updating JavaScript", () => {
      vi.mocked(javascriptGenerator.workspaceToCode).mockReturnValue(
        "freshJavaScript();"
      );
      vi.mocked(luaGenerator.workspaceToCode).mockImplementation(() => {
        throw "broken Lua block";
      });
      const { generateAllSafely } = useCodeGenerator();

      const result = generateAllSafely(fakeWorkspace, {
        js: "last valid js",
        lua: "last valid lua",
      });

      expect(result.generated).toEqual({
        js: "freshJavaScript();",
        lua: "last valid lua",
      });
      expect(result.warnings).toEqual([
        {
          code: "code-generation-failed",
          language: "lua",
          message: expect.stringContaining("broken Lua block"),
        },
      ]);
      expect(javascriptGenerator.workspaceToCode).toHaveBeenCalledWith(
        fakeWorkspace
      );
    });

    it("uses empty fallbacks and reports both failures when both generators fail", () => {
      vi.mocked(javascriptGenerator.workspaceToCode).mockImplementation(() => {
        throw new Error("js failed");
      });
      vi.mocked(luaGenerator.workspaceToCode).mockImplementation(() => {
        throw new Error("lua failed");
      });
      const { generateAllSafely } = useCodeGenerator();

      const result = generateAllSafely(fakeWorkspace);

      expect(result.generated).toEqual({ js: "", lua: "" });
      expect(result.warnings).toEqual([
        expect.objectContaining({ language: "javascript" }),
        expect.objectContaining({ language: "lua" }),
      ]);
    });
  });
});
