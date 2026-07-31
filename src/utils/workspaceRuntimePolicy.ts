import * as Blockly from "blockly";

export interface WorkspaceRuntimeEvent {
  type?: string;
  element?: string;
  isUiEvent?: boolean;
}

/**
 * Returns the editor workspace only after the current INIT has made that exact
 * instance active. This prevents save requests from reading a stale, partially
 * loaded, or disposed workspace during lifecycle transitions.
 */
export function resolveActiveWorkspace<T extends object>(
  editorWorkspace: T | null | undefined,
  activeWorkspace: T | null
): T | null {
  return editorWorkspace && editorWorkspace === activeWorkspace
    ? editorWorkspace
    : null;
}

/**
 * Blockly queues FINISHED_LOADING asynchronously. INIT publishes its loaded
 * snapshot explicitly, so processing that queued marker would duplicate the
 * initial update. Later content events remain eligible for coalescing.
 */
export function shouldQueueWorkspaceUpdate(
  event: WorkspaceRuntimeEvent
): boolean {
  return (
    !event.isUiEvent &&
    event.element !== "warning" &&
    event.type !== Blockly.Events.FINISHED_LOADING
  );
}
