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
 * - Tracks `lastRequestId` for REQUEST/RESPONSE pairing
 */
export function useMessageBridge() {
  const handlers = new Map<string, MessageHandler>();
  const readyRetryIntervalMs = 1500;
  const hostSessionId =
    new URLSearchParams(window.location.search).get("hostSessionId") ||
    undefined;
  const readyPayload = hostSessionId ? { hostSessionId } : undefined;

  /** The id of the last received REQUEST, used for RESPONSE pairing. */
  let lastRequestId: string | undefined;
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
    window.parent.postMessage(msg, "*");
  };

  /**
   * Send a RESPONSE message, auto-attaching `lastRequestId` as `requestId`.
   * Session-aware Ctrl+S asks the host to send a real REQUEST, so every save
   * RESPONSE keeps the same request-correlation path. App keeps a legacy
   * direct-save fallback while old hosts are still deployed.
   */
  const postResponse = (payload: Record<string, unknown>) => {
    const msg: StandardMessage = { type: "RESPONSE", id: genId(), payload };
    if (lastRequestId !== undefined) {
      msg.requestId = lastRequestId;
    }
    window.parent.postMessage(msg, "*");
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

      const msg = event.data as StandardMessage;
      if (!msg || typeof msg.type !== "string") return;

      const previousRequestId = lastRequestId;

      // Track REQUEST id before dispatch because save may answer synchronously.
      if (msg.type === "REQUEST") {
        lastRequestId = msg.id;
      } else if (msg.type === "INIT") {
        // PLUGIN_READY is intentionally retried until the host answers. This
        // prevents a fast, cached iframe from losing its one-shot ready signal
        // before the parent has installed its message listener.
        stopReadyRetry();
        // A new editor session must not inherit a request correlation from the
        // previous session when the host reuses this iframe.
        lastRequestId = undefined;
      }

      const handler = handlers.get(msg.type);
      if (handler) {
        const result = handler(msg.payload, msg);
        if (result instanceof Promise) {
          void result.then((accepted) => {
            if (msg.type === "REQUEST" && accepted === false) {
              lastRequestId = previousRequestId;
            }
          });
        } else if (msg.type === "REQUEST" && result === false) {
          lastRequestId = previousRequestId;
        }
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

    // A shortcut is not itself correlated to an earlier host REQUEST. Legacy
    // hosts still let Blockly save directly here, so carrying a stale request
    // id would make them associate this RESPONSE with the previous save.
    // Session-aware hosts will send a fresh REQUEST immediately afterwards.
    lastRequestId = undefined;

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
