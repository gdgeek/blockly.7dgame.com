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

  it("Ctrl+S triggers REQUEST handler with save action", async () => {
    const handler = vi.fn();
    const { result, wrapper } = withSetup(() => useMessageBridge());
    result.onMessage("REQUEST", handler);

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      { action: "save" },
      expect.objectContaining({
        type: "REQUEST",
        payload: { action: "save" },
        id: expect.any(String),
      })
    );

    wrapper.unmount();
  });
});
