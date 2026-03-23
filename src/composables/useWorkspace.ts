import { watch, onBeforeUnmount, type Ref, type ShallowRef } from 'vue'
import * as Blockly from 'blockly'

/** Shape of the editor component ref (BlocklyComponent exposes `workspace`). */
interface EditorRef {
  workspace: Blockly.WorkspaceSvg | null
}

/** Timeout (ms) before giving up on workspace readiness. */
const WORKSPACE_READY_TIMEOUT = 5_000

/**
 * Composable that wraps Blockly workspace serialization / deserialization
 * and provides a reactive, event-driven workspace-ready watcher.
 */
export function useWorkspace() {
  /** Active timeout id so we can clean up on unmount. */
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  /** Stop handle returned by `watch` so we can clean up on unmount. */
  let stopWatcher: (() => void) | null = null

  // ── Serialization ───────────────────────────────────────

  /**
   * Serialize the current state of a Blockly workspace.
   */
  const saveWorkspace = (workspace: Blockly.Workspace): Record<string, unknown> => {
    return Blockly.serialization.workspaces.save(workspace) as Record<string, unknown>
  }

  /**
   * Deserialize data into a Blockly workspace.
   */
  const loadWorkspace = (data: object, workspace: Blockly.Workspace): void => {
    Blockly.serialization.workspaces.load(data, workspace)
  }

  // ── Workspace-ready watcher ─────────────────────────────

  /**
   * Watch the editor ref until its workspace becomes available, then load
   * the provided data and invoke the `onReady` callback.
   *
   * Uses Vue `watch` instead of setTimeout polling.  A 5-second timeout
   * protects against the workspace never appearing.
   *
   * @param editorRef - Template ref pointing at the BlocklyComponent
   * @param data      - Serialized workspace data to load
   * @param onReady   - Called once the workspace has been loaded successfully
   */
  const watchWorkspaceReady = (
    editorRef: Ref<EditorRef | undefined> | ShallowRef<EditorRef | undefined>,
    data: object,
    onReady: (workspace: Blockly.WorkspaceSvg) => void,
    onTimeout?: () => void,
  ): void => {
    // If the workspace is already available, load immediately.
    if (editorRef.value?.workspace) {
      try {
        loadWorkspace(data, editorRef.value.workspace)
      } catch (e) {
        console.error('[useWorkspace] Error loading workspace data:', e)
      }
      onReady(editorRef.value.workspace)
      return
    }

    // Set up a timeout guard.
    timeoutId = setTimeout(() => {
      if (stopWatcher) {
        stopWatcher()
        stopWatcher = null
      }
      console.error('[useWorkspace] Workspace did not become ready within 5 seconds.')
      if (onTimeout) onTimeout()
    }, WORKSPACE_READY_TIMEOUT)

    // Watch the editor ref for workspace availability.
    stopWatcher = watch(
      () => editorRef.value?.workspace,
      (workspace) => {
        if (!workspace) return

        // Workspace is ready — clean up watcher & timeout.
        if (stopWatcher) {
          stopWatcher()
          stopWatcher = null
        }
        if (timeoutId !== null) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        try {
          loadWorkspace(data, workspace)
        } catch (e) {
          console.error('[useWorkspace] Error loading workspace data:', e)
        }
        onReady(workspace)
      },
      { immediate: true },
    )
  }

  // ── Lifecycle cleanup ───────────────────────────────────

  onBeforeUnmount(() => {
    if (stopWatcher) {
      stopWatcher()
      stopWatcher = null
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  })

  return {
    saveWorkspace,
    loadWorkspace,
    watchWorkspaceReady,
  }
}
