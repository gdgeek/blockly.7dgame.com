import { describe, expect, it } from "vitest";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import { RegisterData } from "@/blocks/helper";
import { StartParallelLoop, StopParallelLoop } from "@/blocks/task/parallel_loop";
import "@/localization";

describe("named parallel loop", () => {
  it("serializes the name, yields independently and drops old callbacks after stop and restart", async () => {
    RegisterData(StartParallelLoop, {});
    RegisterData(StopParallelLoop, {});
    const w = new Blockly.Workspace();
    try {
      const start = w.newBlock("start_parallel_loop");
      start.setFieldValue("播放提示", "NAME");
      const seconds = w.newBlock("math_number");
      seconds.setFieldValue(15, "NUM");
      start.getInput("DELAY")!.connection!.connect(seconds.outputConnection!);
      const saved = Blockly.serialization.workspaces.save(w);
      w.clear();
      Blockly.serialization.workspaces.load(saved, w);
      expect(luaGenerator.workspaceToCode(w)).toContain('start_parallel_loop("播放提示", 15,');
      const startCode = javascriptGenerator.workspaceToCode(w);
      w.clear();
      w.newBlock("stop_parallel_loop").setFieldValue("播放提示", "NAME");
      const stopCode = javascriptGenerator.workspaceToCode(w);
      const callbacks: (() => void)[] = [];
      const meta = { parallelLoops: undefined as Map<string, AbortController> | undefined };
      const task = { sleep: (t: number) => t, execute: () => new Promise<void>(resolve => callbacks.push(resolve)) };
      const run = new Function("meta", "task", startCode);
      const stop = new Function("meta", stopCode);
      run(meta, task);
      run(meta, task);
      expect(callbacks).toHaveLength(1);
      stop(meta);
      run(meta, task);
      const replacement = meta.parallelLoops!.get("播放提示");
      callbacks.shift()!();
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(meta.parallelLoops!.get("播放提示")).toBe(replacement);
      stop(meta);
      callbacks.shift()!();
      expect(meta.parallelLoops!.size).toBe(0);
    } finally { w.dispose(); }
  });
});
