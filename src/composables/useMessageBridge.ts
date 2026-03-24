import { onMounted, onBeforeUnmount } from 'vue'

/** Standard message envelope for iframe communication. */
export interface StandardMessage {
  type: string
  id: string
  payload?: Record<string, unknown>
  requestId?: string
}

/** Callback signature for registered message handlers. */
export type MessageHandler = (payload: unknown, msg: StandardMessage) => void

/** Generate a unique message ID. */
function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Composable that manages the postMessage bridge between the Blockly editor
 * iframe and its parent window using the standard envelope format.
 *
 * - Sends messages via `{ type, id, payload, requestId? }`
 * - Receives messages filtered by `event.source === window.parent`
 * - Routes by `message.type`
 * - Tracks `lastRequestId` for REQUEST/RESPONSE pairing
 */
export function useMessageBridge() {
  const handlers = new Map<string, MessageHandler>()

  /** The id of the last received REQUEST, used for RESPONSE pairing. */
  let lastRequestId: string | undefined

  // ── Outgoing ──────────────────────────────────────────────

  /**
   * Send a message to the parent window using the standard envelope format.
   */
  const postMessage = (type: string, payload?: Record<string, unknown>) => {
    const msg: StandardMessage = { type, id: genId() }
    if (payload !== undefined) {
      msg.payload = payload
    }
    window.parent.postMessage(msg, '*')
  }

  /**
   * Send a RESPONSE message, auto-attaching `lastRequestId` as `requestId`.
   * When Ctrl+S triggers save, `lastRequestId` is undefined so RESPONSE
   * won't carry `requestId`.
   */
  const postResponse = (payload: Record<string, unknown>) => {
    const msg: StandardMessage = { type: 'RESPONSE', id: genId(), payload }
    if (lastRequestId !== undefined) {
      msg.requestId = lastRequestId
    }
    window.parent.postMessage(msg, '*')
  }

  // ── Incoming ──────────────────────────────────────────────

  /**
   * Register a handler for a specific incoming message type.
   * Only one handler per type — later registrations overwrite earlier ones.
   */
  const onMessage = (type: string, handler: MessageHandler) => {
    handlers.set(type, handler)
  }

  /**
   * Core message handler attached to `window`.
   * Filters by `event.source === window.parent`, routes by `msg.type`.
   */
  const handleMessage = (event: MessageEvent) => {
    try {
      if (event.source !== window.parent) return

      const msg = event.data as StandardMessage
      if (!msg || typeof msg.type !== 'string') return

      // Track REQUEST id for RESPONSE pairing
      if (msg.type === 'REQUEST') {
        lastRequestId = msg.id
      }

      const handler = handlers.get(msg.type)
      if (handler) {
        handler(msg.payload, msg)
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

    if (!isSaveShortcut) return

    event.preventDefault()

    // Ctrl+S has no requestId
    lastRequestId = undefined

    const handler = handlers.get('REQUEST')
    if (handler) {
      handler(
        { action: 'save' },
        { type: 'REQUEST', id: genId(), payload: { action: 'save' } },
      )
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────

  onMounted(() => {
    window.addEventListener('message', handleMessage)
    window.addEventListener('keydown', handleGlobalSaveShortcut)
    postMessage('PLUGIN_READY')
  })

  onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage)
    window.removeEventListener('keydown', handleGlobalSaveShortcut)
  })

  return {
    postMessage,
    postResponse,
    onMessage,
  }
}
