import { describe, expect, it, vi } from "vitest";
import { parse as parseJavaScript } from "acorn";
import luaparse from "luaparse";
import type { BlocklyBlock, BlocklyGenerator } from "@/blocks/helper";
import { quoteJavaScriptString, quoteLuaString } from "@/blocks/helper";
import VisualTooltips from "@/blocks/entity/visual_tooltips";
import Entity from "@/blocks/entity/entity";
import Parameters from "@/blocks/parameter/parameters";
import OutputSignal from "@/blocks/signal/output_signal";
import OutputSignalWithParameter from "@/blocks/signal/output_signal_with_parameter";
import OutputSignalItem from "@/blocks/signal/outputs_item";

function createBlock(
  fields: Record<string, string> = {},
  extras: Record<string, unknown> = {}
): BlocklyBlock {
  return {
    getFieldValue: vi.fn((name: string) => fields[name] ?? ""),
    ...extras,
  };
}

function createGenerator(
  values: Record<string, string> = {}
): BlocklyGenerator {
  return {
    ORDER_ATOMIC: 0,
    ORDER_HIGH: 1,
    ORDER_FUNCTION_CALL: 1,
    ORDER_NONE: 99,
    statementToCode: vi.fn().mockReturnValue(""),
    valueToCode: vi.fn((_block: object, name: string) => values[name] ?? ""),
  };
}

function expectString(result: unknown): string {
  expect(typeof result).toBe("string");
  return result as string;
}

function expectTuple(result: unknown): [string, unknown] {
  expect(Array.isArray(result)).toBe(true);
  expect(result).toHaveLength(2);
  return result as [string, unknown];
}

function expectValidJavaScript(code: string): void {
  expect(() =>
    parseJavaScript(code, {
      ecmaVersion: "latest",
      sourceType: "script",
    })
  ).not.toThrow();
}

function expectValidLua(code: string): void {
  expect(() =>
    luaparse.parse(code, {
      comments: false,
      luaVersion: "5.3",
    })
  ).not.toThrow();
}

describe("custom block generator regressions", () => {
  it("generates a JavaScript array for all tooltip entities and escapes IDs", () => {
    const firstUuid = "deep-'\"\\\n\u0001-child";
    const secondUuid = "second-child";
    const block = createBlock(
      {},
      {
        tooltipsEntities: [firstUuid, secondUuid],
      }
    );
    const generator = createGenerator({ bool: "true" });

    const javascript = expectString(
      VisualTooltips.getJavascript({})(block, generator)
    );
    const lua = expectString(VisualTooltips.getLua({})(block, generator));

    expect(javascript).toMatch(/setTooltipsVisual\(\[\s*handleEntity/);
    expect(javascript).not.toMatch(/setTooltipsVisual\(\{/);
    expect(javascript).toContain(
      `handleEntity(${quoteJavaScriptString(firstUuid)})`
    );
    expect(lua).toContain(
      `_G.helper.handler(index, ${quoteLuaString(firstUuid)})`
    );
    expectValidJavaScript(javascript);
    expectValidLua(lua);
  });

  it("returns newline-free parameter value tuples with empty-list defaults", () => {
    const block = createBlock();
    const generator = createGenerator();

    const [javascript, javascriptOrder] = expectTuple(
      Parameters.getJavascript({})(block, generator)
    );
    const [lua, luaOrder] = expectTuple(
      Parameters.getLua({})(block, generator)
    );

    expect(javascript).toBe("helper.parameters([])");
    expect(lua).toBe("_G.helper.parameters({})");
    expect(javascript).not.toContain("\n");
    expect(lua).not.toContain("\n");
    expect(javascriptOrder).toBeDefined();
    expect(luaOrder).toBeDefined();
    expectValidJavaScript(`const value = ${javascript};`);
    expectValidLua(`local value = ${lua}`);
  });

  it("uses parseable defaults for a disconnected signal parameter", () => {
    const reference = {
      index: "index-'\"\\\n\u0002",
      uuid: "uuid-'\"\\\n\u0003",
    };
    const block = createBlock({ Output: JSON.stringify(reference) });
    const generator = createGenerator({ Parameter: "" });

    const javascript = expectString(
      OutputSignalWithParameter.getJavascript({})(block, generator)
    );
    const lua = expectString(
      OutputSignalWithParameter.getLua({})(block, generator)
    );

    expect(javascript).toContain(quoteJavaScriptString(reference.index));
    expect(javascript).toContain(quoteJavaScriptString(reference.uuid));
    expect(javascript).toContain(", undefined);");
    expect(lua).toContain(quoteLuaString(reference.index));
    expect(lua).toContain(quoteLuaString(reference.uuid));
    expect(lua).toContain(", nil)");
    expectValidJavaScript(javascript);
    expectValidLua(lua);
  });

  it.each(["{legacy-json", "null", '{"index": 1, "uuid": false}'])(
    "falls back to an empty signal reference for malformed data %s",
    (rawReference) => {
      const block = createBlock({ Output: rawReference });
      const generator = createGenerator();

      const javascript = expectString(
        OutputSignal.getJavascript({})(block, generator)
      );
      const lua = expectString(OutputSignal.getLua({})(block, generator));
      const [javascriptItem] = expectTuple(
        OutputSignalItem.getJavascript({})(block, generator)
      );
      const [luaItem] = expectTuple(
        OutputSignalItem.getLua({})(block, generator)
      );

      expect(javascript).toBe('event.signal("", "");\n');
      expect(lua).toBe('_G.event.signal("", "")\n');
      expect(javascriptItem).toBe('{"index":"","uuid":""}');
      expect(luaItem).toBe('{"", ""}');
      expectValidJavaScript(javascript);
      expectValidLua(lua);
      expectValidJavaScript(`const signal = ${javascriptItem};`);
      expectValidLua(`local signal = ${luaItem}`);
    }
  );

  it("keeps resource identifiers parseable in standalone value blocks", () => {
    const uuid = "entity-'\"\\\n\u0004";
    const block = createBlock({ Entity: uuid });
    const generator = createGenerator();

    const [javascript] = expectTuple(
      Entity.getJavascript({})(block, generator)
    );
    const [lua] = expectTuple(Entity.getLua({})(block, generator));

    expect(javascript).toContain(quoteJavaScriptString(uuid));
    expect(lua).toContain(quoteLuaString(uuid));
    expectValidJavaScript(`const entity = ${javascript};`);
    expectValidLua(`local entity = ${lua}`);
  });
});
