import { onMounted, onBeforeUnmount } from 'vue'

/** Known action types received from the parent window. */
export type MessageAction = 'init' | 'user-info' | 'save'

/** Callback signature for registered action handlers. */
export type ActionHandler = (data: unknown) => void

/** Allowed origin identifiers for incoming messages. */
const ALLOWED_ORIGINS = ['script.meta.web', 'script.verse.web'] as const

/** The origin tag attached to outgoing messages. */
const MESSAGE_SOURCE = 'script.blockly' as const

/**
 * Composable that manages the postMessage bridge between the Blockly editor
 * iframe and its parent window.
 *
 * - Sends messages via `postMessage`
 * - Receives messages, filters by `from`, and dispatches to registered handlers
 * - Sets up / tears down the `message` and `keydown` (Ctrl+S) listeners
 */
export function useMessageBridge() {
  const handlers = new Map<string, ActionHandler>()

  // ── Outgoing ──────────────────────────────────────────────

  /**
   * Send a message to the parent window.
   */
  const postMessage = (action: string, data: Record<string, unknown> = {}) => {
    window.parent.postMessage({ action, data, from: MESSAGE_SOURCE }, '*')
  }

  // ── Incoming ──────────────────────────────────────────────

  /**
   * Register a handler for a specific incoming action.
   * Only one handler per action — later registrations overwrite earlier ones.
   */
  const onAction = (action: MessageAction | string, handler: ActionHandler) => {
    handlers.set(action, handler)
  }

  /**
   * Core message handler attached to `window`.
   * Filters out messages that don't match the expected shape / origin,
   * then dispatches to the registered handler (if any).
   */
  const handleMessage = async (event: MessageEvent) => {
    try {
      const message = event.data
      if (!message || !message.action || !message.from) {
        return
      }
      if (
        !(ALLOWED_ORIGINS as readonly string[]).includes(message.from)
      ) {
        return
      }

      const handler = handlers.get(message.action)
      if (handler) {
        handler(message.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // ── Ctrl+S shortcut ───────────────────────────────────────

  const handleGlobalSaveShortcut = (event: KeyboardEvent) => {
    const isSaveShortcut =
      (event.ctrlKey || event.metaKey) &&
      event.key &&
      event.key.toLowerCase() === 's'

    if (!isSaveShortcut) {
      return
    }

    event.preventDefault()

    const saveHandler = handlers.get('save')
    if (saveHandler) {
      saveHandler(undefined)
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────

  onMounted(() => {
    window.addEventListener('message', handleMessage)
    window.addEventListener('keydown', handleGlobalSaveShortcut)
    postMessage('ready')
  })

  onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage)
    window.removeEventListener('keydown', handleGlobalSaveShortcut)
  })

  return {
    postMessage,
    onAction,
  }
}
