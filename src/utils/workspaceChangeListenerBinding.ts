import type * as Blockly from "blockly";

type WorkspaceChangeListener = (event: Blockly.Events.Abstract) => void;
type WorkspaceChangeListenerHost = Pick<
  Blockly.Workspace,
  "addChangeListener" | "removeChangeListener"
>;

/** Owns exactly one workspace/listener attachment and makes teardown idempotent. */
export function createWorkspaceChangeListenerBinding(
  listener: WorkspaceChangeListener
) {
  let current: WorkspaceChangeListenerHost | null = null;

  const detach = (): void => {
    if (!current) return;
    current.removeChangeListener(listener);
    current = null;
  };

  const attach = (workspace: WorkspaceChangeListenerHost): void => {
    if (current === workspace) return;
    detach();
    workspace.addChangeListener(listener);
    current = workspace;
  };

  return {
    attach,
    detach,
    get current(): WorkspaceChangeListenerHost | null {
      return current;
    },
  };
}
