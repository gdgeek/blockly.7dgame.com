import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { useMessageBridge } from "@/composables/useMessageBridge";

function withSetup(composable: () => unknown) {
  let result: unknown;
  const comp = defineComponent({
    setup() {
      result = composable();
      return () => null;
    },
  });
  const wrapper = mount(comp);
  return { result: result as ReturnType<typeof useMessageBridge>, wrapper };
}

describe("useMessageBridge", () => {
  let postMessageSpy: ReturnType<typeof vi.fn>;
  let parentMock: { postMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    postMessageSpy = vi.fn();
    parentMock = { postMessage: postMessageSpy };
    Object.defineProperty(window, "parent", {
      value: parentMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("sends PLUGIN_READY on mount", () => {
    const { wrapper } = withSetup(() => useMessageBridge());

    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "PLUGIN_READY",
        id: expect.any(String),
      }),
      "*"
    );

    wrapper.unmount();
  });

  it("retries PLUGIN_READY until the parent answers with INIT", async () => {
    vi.useFakeTimers();
    const { wrapper } = withSetup(() => useMessageBridge());

    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1500);
    expect(postMessageSpy).toHaveBeenCalledTimes(2);
    expect(postMessageSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "PLUGIN_READY" }),
      "*"
    );

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "INIT", id: "init-ready", payload: { config: {} } },
        source: parentMock as unknown as MessageEventSource,
      })
    );
    await vi.advanceTimersByTimeAsync(3000);

    expect(postMessageSpy).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });

  it("postMessage sends standard envelope with type/payload/id", () => {
    const { result, wrapper } = withSetup(() => useMessageBridge());

    result.postMessage("test-action", { key: "value" });

    expect(postMessageSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: "test-action",
        payload: { key: "value" },
        id: expect.any(String),
      }),
      "*"
    );

    wrapper.unmount();
  });

  it("postResponse sends RESPONSE and carries last requestId", async () => {
    const handler = vi.fn();
    const { result, wrapper } = withSetup(() => useMessageBridge());
    result.onMessage("REQUEST", handler);

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "REQUEST", id: "req-123", payload: { action: "save" } },
        source: parentMock as unknown as MessageEventSource,
      })
    );
    await nextTick();

    result.postResponse({ ok: true });

    expect(postMessageSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "RESPONSE",
        payload: { ok: true },
        requestId: "req-123",
        id: expect.any(String),
      }),
      "*"
    );

    wrapper.unmount();
  });

  it("does not reuse a requestId after a new INIT session", async () => {
    const { result, wrapper } = withSetup(() => useMessageBridge());

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "REQUEST", id: "req-old", payload: { action: "save" } },
        source: parentMock as unknown as MessageEventSource,
      })
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "INIT", id: "init-new", payload: { config: {} } },
        source: parentMock as unknown as MessageEventSource,
      })
    );
    await nextTick();

    result.postResponse({ ok: true });

    const response = postMessageSpy.mock.calls[
      postMessageSpy.mock.calls.length - 1
    ]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({ type: "RESPONSE", payload: { ok: true } });
    expect(response).not.toHaveProperty("requestId");
    wrapper.unmount();
  });

  it("restores request correlation when a handler rejects a stale request", async () => {
    const handler = vi
      .fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(false);
    const { result, wrapper } = withSetup(() => useMessageBridge());
    result.onMessage("REQUEST", handler);

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "REQUEST", id: "req-current", payload: {} },
        source: parentMock as unknown as MessageEventSource,
      })
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "REQUEST", id: "req-stale", payload: {} },
        source: parentMock as unknown as MessageEventSource,
      })
    );
    await nextTick();

    result.postResponse({ ok: true });

    expect(postMessageSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "RESPONSE",
        requestId: "req-current",
      }),
      "*"
    );
    wrapper.unmount();
  });

  it("dispatches incoming message by type via onMessage", async () => {
    const handler = vi.fn();
    const { result, wrapper } = withSetup(() => useMessageBridge());
    result.onMessage("INIT", handler);

    const msg = { type: "INIT", id: "m1", payload: { workspace: "{}" } };
    window.dispatchEvent(
      new MessageEvent("message", {
        data: msg,
        source: parentMock as unknown as MessageEventSource,
      })
    );
    await nextTick();

    expect(handler).toHaveBeenCalledWith({ workspace: "{}" }, msg);

    wrapper.unmount();
  });

  it("ignores message from non-parent source", async () => {
    const handler = vi.fn();
    const { result, wrapper } = withSetup(() => useMessageBridge());
    result.onMessage("INIT", handler);

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "INIT", id: "m2", payload: {} },
        source: window as unknown as MessageEventSource,
      })
    );
    await nextTick();

    expect(handler).not.toHaveBeenCalled();

    wrapper.unmount();
  });

  it("Ctrl+S triggers the internal save-shortcut handler", async () => {
    const handler = vi.fn();
    const { result, wrapper } = withSetup(() => useMessageBridge());
    result.onMessage("SAVE_SHORTCUT", handler);

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();

    expect(handler).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        type: "SAVE_SHORTCUT",
        id: expect.any(String),
      })
    );

    wrapper.unmount();
  });

  it("does not attach a stale requestId to a legacy Ctrl+S response", async () => {
    const { result, wrapper } = withSetup(() => useMessageBridge());
    result.onMessage("REQUEST", vi.fn());
    result.onMessage("SAVE_SHORTCUT", () => {
      result.postResponse({ action: "save", noChange: true });
    });

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "REQUEST", id: "req-previous", payload: {} },
        source: parentMock as unknown as MessageEventSource,
      })
    );
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();

    const response = postMessageSpy.mock.calls[
      postMessageSpy.mock.calls.length - 1
    ]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({
      type: "RESPONSE",
      payload: { action: "save", noChange: true },
    });
    expect(response).not.toHaveProperty("requestId");

    wrapper.unmount();
  });
});
