import type { JavascriptGenerator } from "blockly/javascript";
import Type from "./type";
import { quoteLuaString, quoteJavaScriptString, type BlockDefinition } from "../helper";

function definition(start: boolean): BlockDefinition {
  const type = start ? "start_parallel_loop" : "stop_parallel_loop";
  return {
    title: type, type: Type.name, colour: Type.colour,
    toolbox: { kind: "block", type, ...(start ? { inputs: {
      DELAY: { shadow: { type: "math_number", fields: { NUM: 0 } } },
    } } : {}) },
    getBlock() {
      return { init(this: { jsonInit(json: object): void }) {
        const zh = window.lg.startsWith("zh");
        this.jsonInit({
          type, colour: Type.colour, previousStatement: null, nextStatement: null, inputsInline: true,
          message0: start
            ? (zh ? "启动并行循环 %1 首次等待 %2 秒" : "start parallel loop %1 after %2 s")
            : (zh ? "停止并行循环 %1" : "stop parallel loop %1"),
          args0: [
            { type: "field_input", name: "NAME", text: zh ? "循环任务" : "loop" },
            ...(start ? [{ type: "input_value", name: "DELAY", check: "Number" }] : []),
          ],
          ...(start ? { message1: zh ? "重复执行 %1" : "repeat %1",
            args1: [{ type: "input_statement", name: "BODY" }] } : {}),
          tooltip: zh ? "循环在后台独立运行。同一实体内重复启动同名循环会沿用当前进度；停止后可以重新启动。" :
            "Runs independently. Starting an active name keeps its progress. Stop it to restart.",
        });
      } };
    },
    getLua: () => (b, g) => {
      const name = quoteLuaString(b.getFieldValue("NAME").trim());
      if (!start) return `stop_parallel_loop(${name})\n`;
      const delay = g.valueToCode(b, "DELAY", g.ORDER_NONE) || "0";
      return `start_parallel_loop(${name}, ${delay}, function()\n${g.statementToCode(b, "BODY")}end)\n`;
    },
    getJavascript: () => (b, g) => {
      const name = quoteJavaScriptString(b.getFieldValue("NAME").trim());
      if (!start) return `meta.parallelLoops?.get(${name})?.abort();\n`;
      const js = g as unknown as JavascriptGenerator;
      const helper = js.provideFunction_("startParallelLoop", [
        'function ' + js.FUNCTION_NAME_PLACEHOLDER_ + '(name, delay, body, tasks) {',
        '  if (!meta.parallelLoops) {',
        '    meta.parallelLoops = new Map();',
        '    const destroy = meta["@destroy"];',
        '    meta["@destroy"] = (...args) => {',
        '      for (const controller of meta.parallelLoops.values()) controller.abort();',
        '      return destroy?.(...args);',
        '    };',
        '  }',
        '  if (!name || meta.parallelLoops.has(name)) return;',
        '  const controller = new AbortController(), signal = controller.signal;',
        '  meta.parallelLoops.set(name, controller);',
        '  signal.onabort = () => meta.parallelLoops.delete(name);',
        '  const scoped = Object.create(tasks);',
        '  scoped.execute = async value => {',
        '    signal.throwIfAborted();',
        '    await tasks.execute(value);',
        '    signal.throwIfAborted();',
        '  };',
        '  (async () => {',
        '    if (delay > 0) await scoped.execute(tasks.sleep(delay));',
        '    while (!signal.aborted) {',
        '      const began = performance.now();',
        '      await body(signal, scoped);',
        '      if (!signal.aborted && performance.now() - began < 1) await new Promise(resolve => setTimeout(resolve, 0));',
        '    }',
        '  })().catch(error => { if (!signal.aborted) console.error(error); })',
        '    .finally(() => { if (meta.parallelLoops.get(name) === controller) meta.parallelLoops.delete(name); });',
        '}',
      ]);
      const delay = g.valueToCode(b, "DELAY", g.ORDER_NONE) || "0";
      const original = js.STATEMENT_PREFIX;
      try {
        js.STATEMENT_PREFIX = (original || "") + "loopSignal.throwIfAborted();\n";
        return `${helper}(${name}, ${delay}, async (loopSignal, task) => {\n${g.statementToCode(b, "BODY")}}, task);\n`;
      } finally { js.STATEMENT_PREFIX = original; }
    },
  };
}
export const StartParallelLoop = definition(true);
export const StopParallelLoop = definition(false);
