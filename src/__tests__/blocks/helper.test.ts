import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("blockly", () => ({
  default: { Blocks: {} },
  Blocks: {},
}));
vi.mock("blockly/lua", () => ({
  luaGenerator: { forBlock: {} },
}));
vi.mock("blockly/javascript", () => ({
  javascriptGenerator: { forBlock: {} },
}));

import * as Blockly from "blockly";
import { luaGenerator } from "blockly/lua";
import { javascriptGenerator } from "blockly/javascript";
import {
  RegisterData,
  Handler,
  InputEvent,
  OutputEvent,
  Number,
  Boolean,
  String,
  Point,
  Player,
  Anchor,
  Range,
} from "@/blocks/helper";

describe("helper", () => {
  describe("RegisterData", () => {
    beforeEach(() => {
      // Clear registrations between tests
      for (const key of Object.keys(Blockly.Blocks)) {
        delete Blockly.Blocks[key];
      }
      for (const key of Object.keys(luaGenerator.forBlock)) {
        delete luaGenerator.forBlock[key];
      }
      for (const key of Object.keys(javascriptGenerator.forBlock)) {
        delete javascriptGenerator.forBlock[key];
      }
    });

    it("registers block definition to Blockly.Blocks", () => {
      const blockDef = { init() {} };
      const data = {
        title: "test_block",
        getBlock: vi.fn().mockReturnValue(blockDef),
        getLua: vi.fn().mockReturnValue(() => ""),
        getJavascript: vi.fn().mockReturnValue(() => ""),
      };

      RegisterData(data, { some: "params" });

      expect(Blockly.Blocks["test_block"]).toBe(blockDef);
      expect(data.getBlock).toHaveBeenCalledWith({ some: "params" });
    });

    it("registers lua generator function", () => {
      const luaFn = vi.fn();
      const data = {
        title: "lua_block",
        getBlock: vi.fn().mockReturnValue({}),
        getLua: vi.fn().mockReturnValue(luaFn),
        getJavascript: vi.fn().mockReturnValue(() => ""),
      };

      RegisterData(data, {});

      expect(luaGenerator.forBlock["lua_block"]).toBe(luaFn);
      expect(data.getLua).toHaveBeenCalledWith({});
    });

    it("registers javascript generator function", () => {
      const jsFn = vi.fn();
      const data = {
        title: "js_block",
        getBlock: vi.fn().mockReturnValue({}),
        getLua: vi.fn().mockReturnValue(() => ""),
        getJavascript: vi.fn().mockReturnValue(jsFn),
      };

      RegisterData(data, {});

      expect(javascriptGenerator.forBlock["js_block"]).toBe(jsFn);
      expect(data.getJavascript).toHaveBeenCalledWith({});
    });
  });

  describe("Handler", () => {
    it("returns correct format with uuid", () => {
      expect(Handler("abc-123")).toBe(
        "_G.helper.handler(index, 'abc-123')"
      );
    });
  });

  describe("InputEvent", () => {
    it("returns correct format with uuid", () => {
      expect(InputEvent("evt-456")).toBe(
        "_G.helper.input_event(index, 'evt-456')"
      );
    });
  });

  describe("OutputEvent", () => {
    it("returns correct format with uuid", () => {
      expect(OutputEvent("out-789")).toBe(
        "_G.helper.output_event(index, 'out-789')"
      );
    });
  });

  describe("Number", () => {
    it("returns correct format", () => {
      expect(Number(42)).toBe("_G.argument.number(42)");
    });

    it("handles string value", () => {
      expect(Number("someVar")).toBe("_G.argument.number(someVar)");
    });
  });

  describe("Boolean", () => {
    it("returns correct format", () => {
      expect(Boolean(true)).toBe("_G.argument.boolean(true)");
      expect(Boolean(false)).toBe("_G.argument.boolean(false)");
    });

    it("handles string value", () => {
      expect(Boolean("myBool")).toBe("_G.argument.boolean(myBool)");
    });
  });

  describe("String", () => {
    it("returns correct format", () => {
      expect(String("hello")).toBe("_G.argument.string(hello)");
    });
  });

  describe("Point", () => {
    it("returns correct format", () => {
      expect(Point("myPoint")).toBe("_G.argument.point(myPoint)");
    });
  });

  describe("Player", () => {
    it("returns index player format", () => {
      expect(Player("index", "5")).toBe("_G.argument.index_player(5)");
    });

    it("returns id player format", () => {
      expect(Player("id", "player-1")).toBe(
        "_G.argument.id_player(player-1)"
      );
    });

    it("returns server player format", () => {
      expect(Player("server")).toBe("_G.argument.server_player()");
    });

    it("returns random client player format", () => {
      expect(Player("random_client")).toBe("_G.argument.random_player()");
    });

    it("defaults to server player for unknown type", () => {
      expect(Player("unknown_type")).toBe("_G.argument.server_player()");
    });
  });

  describe("Anchor", () => {
    it("returns correct format with key", () => {
      expect(Anchor("spawn_point")).toBe(
        "_G.argument.anchor('spawn_point')"
      );
    });
  });

  describe("Range", () => {
    it("returns correct format with anchor and radius", () => {
      expect(Range("myAnchor", 10)).toBe(
        "_G.argument.range(myAnchor, 10)"
      );
    });

    it("handles string radius", () => {
      expect(Range("a", "r")).toBe("_G.argument.range(a, r)");
    });
  });
});
