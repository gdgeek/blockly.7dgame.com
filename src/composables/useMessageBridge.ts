import { onMounted, onBeforeUnmount } from "vue";

/** Standard message envelope for iframe communication. */
export interface StandardMessage {
  type: string;
  id: string;
  payload?: Record<string, unknown>;
  requestId?: string;
}

/** Callback signature for registered message handlers. */
export type MessageHandler = (
  payload: unknown,
  msg: StandardMessage
) => boolean | Promise<boolean | void> | void;

/** Generate a unique message ID. */
function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Composable that manages the postMessage bridge between the Blockly editor
 * iframe and its parent window using the standard envelope format.
 *
 * - Sends messages via `{ type, id, payload, requestId? }`
 * - Receives messages filtered by `event.source === window.parent`
 * - Routes by `message.type`
 * - Requires explicit request IDs for asynchronous REQUEST/RESPONSE pairing
 */
export function useMessageBridge() {
  const handlers = new Map<string, MessageHandler>();
  const readyRetryIntervalMs = 1500;
  const hostSessionId =
    new URLSearchParams(window.location.search).get("hostSessionId") ||
    undefined;
  const readyPayload = hostSessionId ? { hostSessionId } : undefined;

  let parentOrigin: string | undefined;
  let readyRetryTimer: ReturnType<typeof setInterval> | undefined;

  const stopReadyRetry = () => {
    if (readyRetryTimer === undefined) return;
    clearInterval(readyRetryTimer);
    readyRetryTimer = undefined;
  };

  // ── Outgoing ──────────────────────────────────────────────

  /**
   * Send a message to the parent window using the standard envelope format.
   */
  const postMessage = (type: string, payload?: Record<string, unknown>) => {
    const msg: StandardMessage = { type, id: genId() };
    if (payload !== undefined) {
      msg.payload = payload;
    }
    window.parent.postMessage(msg, parentOrigin || "*");
  };

  /** Send a response with the originating request ID, captured by the caller. */
  const postResponse = (
    payload: Record<string, unknown>,
    requestId?: string | null
  ) => {
    const msg: StandardMessage = { type: "RESPONSE", id: genId(), payload };
    if (typeof requestId === "string") {
      msg.requestId = requestId;
    }
    window.parent.postMessage(msg, parentOrigin || "*");
  };

  // ── Incoming ──────────────────────────────────────────────

  /**
   * Register a handler for a specific incoming message type.
   * Only one handler per type — later registrations overwrite earlier ones.
   */
  const onMessage = (type: string, handler: MessageHandler) => {
    handlers.set(type, handler);
  };

  /**
   * Core message handler attached to `window`.
   * Filters by `event.source === window.parent`, routes by `msg.type`.
   */
  const handleMessage = (event: MessageEvent) => {
    try {
      if (event.source !== window.parent) return;
      if (parentOrigin && event.origin !== parentOrigin) return;

      const msg = event.data as StandardMessage;
      if (!msg || typeof msg.type !== "string") return;

      if (msg.type === "INIT") {
        if (event.origin && event.origin !== "null")
          parentOrigin = event.origin;
        stopReadyRetry();
      }

      const handler = handlers.get(msg.type);
      if (handler) {
        const result = handler(msg.payload, msg);
        if (result instanceof Promise)
          void result.catch((error) => console.error(error));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Ctrl+S shortcut ───────────────────────────────────────

  const handleGlobalSaveShortcut = (event: KeyboardEvent) => {
    const isSaveShortcut =
      (event.ctrlKey || event.metaKey) &&
      event.key &&
      event.key.toLowerCase() === "s";

    if (!isSaveShortcut) return;

    event.preventDefault();

    const handler = handlers.get("SAVE_SHORTCUT");
    if (handler) {
      handler(undefined, { type: "SAVE_SHORTCUT", id: genId() });
    }
  };

  // ── Lifecycle ─────────────────────────────────────────────

  onMounted(() => {
    window.addEventListener("message", handleMessage);
    window.addEventListener("keydown", handleGlobalSaveShortcut);
    postMessage("PLUGIN_READY", readyPayload);
    readyRetryTimer = setInterval(() => {
      postMessage("PLUGIN_READY", readyPayload);
    }, readyRetryIntervalMs);
  });

  onBeforeUnmount(() => {
    stopReadyRetry();
    window.removeEventListener("message", handleMessage);
    window.removeEventListener("keydown", handleGlobalSaveShortcut);
  });

  return {
    postMessage,
    postResponse,
    onMessage,
  };
}
