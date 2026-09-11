import * as Blockly from "blockly";

type WorkspaceState = Record<string, unknown>;
const copy = (state: WorkspaceState): WorkspaceState =>
  JSON.parse(JSON.stringify(state));

/** Load a complete snapshot without leaking partial block events or undo entries. */
const restore = (workspace: Blockly.Workspace, state: WorkspaceState): void => {
  Blockly.Events.disable();
  try {
    Blockly.serialization.workspaces.load(copy(state), workspace);
  } finally {
    Blockly.Events.enable();
  }
};

/** Project adapter: one semantic edit using Blockly's public undo event API. */
class WorkspaceReplacementEvent extends Blockly.Events.Abstract {
  isBlank = false;
  type = "webmcp_workspace_replace";

  constructor(
    workspace: Blockly.Workspace,
    private readonly before: WorkspaceState,
    private readonly after: WorkspaceState
  ) {
    super();
    this.workspaceId = workspace.id;
    this.group = Blockly.utils.idGenerator.genUid();
    this.recordUndo = true;
  }

  override run(forward: boolean): void {
    const workspace = this.getEventWorkspace_();
    restore(workspace, forward ? this.after : this.before);
    // Undo/redo must also invalidate the host's cached script and dirty state.
    const notification: Blockly.Events.Abstract =
      new Blockly.Events.FinishedLoading(workspace);
    notification.type = "webmcp_workspace_restored";
    Blockly.Events.fire(notification);
  }
}

/**
 * The live SVG serializer can fail after headless validation passed. Restore
 * from the captured state directly; queued undo events cannot prove rollback.
 * Existing undo/redo history is untouched until the entire load succeeds.
 */
export function replaceWorkspaceTransaction(
  workspace: Blockly.Workspace,
  candidate: WorkspaceState,
  save: (workspace: Blockly.Workspace) => WorkspaceState
): void {
  const before = copy(save(workspace));
  let after: WorkspaceState;
  try {
    restore(workspace, candidate);
    after = copy(save(workspace));
  } catch (error) {
    try {
      restore(workspace, before);
    } catch (rollbackError) {
      const failure = new Error(
        `Workspace replacement and recovery failed: ${String(error)}; ${String(rollbackError)}`
      );
      Object.assign(failure, { cause: error, rollbackError });
      throw failure;
    }
    throw error;
  }
  Blockly.Events.fire(new WorkspaceReplacementEvent(workspace, before, after));
}
