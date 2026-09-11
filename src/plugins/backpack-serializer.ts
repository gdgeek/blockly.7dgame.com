import * as Blockly from "blockly/core";
import type { Backpack } from "@blockly/workspace-backpack";

/** Preserve backpack data while WebMCP validates scripts in a headless workspace. */
export function registerBackpackSerializer() {
  if (Blockly.registry.hasItem(Blockly.registry.Type.SERIALIZER, "backpack"))
    return;
  const states = new WeakMap<Blockly.Workspace, object[]>();
  const backpack = (workspace: Blockly.Workspace): Backpack | undefined =>
    workspace instanceof Blockly.WorkspaceSvg
      ? (workspace.getComponentManager().getComponent("backpack") as Backpack)
      : undefined;
  const copy = (state: object[]) =>
    JSON.parse(JSON.stringify(state)) as object[];
  Blockly.serialization.registry.register("backpack", {
    priority: Blockly.serialization.priorities.BLOCKS - 10,
    save(workspace) {
      const plugin = backpack(workspace);
      return plugin
        ? plugin.getContents().map((text) => JSON.parse(text))
        : copy(states.get(workspace) ?? []);
    },
    load(state: object[], workspace) {
      states.set(workspace, copy(state));
      backpack(workspace)?.setContents(
        state.map((item) => JSON.stringify(item))
      );
    },
    clear(workspace) {
      states.delete(workspace);
      backpack(workspace)?.empty();
    },
  });
}
