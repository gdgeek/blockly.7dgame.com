import { describe, expect, it, vi } from "vitest";
import { createWebMcpRequestDispatcher } from "@/utils/webMcpRequestDispatcher";

describe("WebMCP request lifecycle", () => {
  it("correlates overlapping responses even when they settle out of order", async () => {
    let finish!: (value: unknown) => void;
    const respond = vi.fn();
    const workspace = {};
    const dispatch = createWebMcpRequestDispatcher({
      handlers: {
        slow: () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
        read: () => ({ ok: true }),
      },
      getSession: () => ({
        generation: 1,
        hostSessionId: "session",
        workspace,
      }),
      respond,
    });
    const slow = dispatch(
      { action: "slow", hostSessionId: "session" },
      "request-a"
    );
    await dispatch({ action: "read", hostSessionId: "session" }, "request-b");
    finish({ ok: true });
    await slow;
    expect(respond.mock.calls.map((call) => call[1])).toEqual([
      "request-b",
      "request-a",
    ]);
    expect(respond.mock.calls[1][0]).toMatchObject({
      hostSessionId: "session",
      action: "slow",
    });
  });

  it.each(["INIT", "DESTROY"])(
    "discards pending results after %s changes the generation",
    async () => {
      let finish!: (value: unknown) => void;
      let generation = 1;
      const respond = vi.fn();
      const dispatch = createWebMcpRequestDispatcher({
        handlers: {
          complete: () =>
            new Promise((resolve) => {
              finish = resolve;
            }),
        },
        getSession: () => ({ generation, workspace: null }),
        respond,
      });
      const request = dispatch({ action: "complete" }, "old");
      generation += 1;
      finish({ ok: true });
      await request;
      expect(respond).not.toHaveBeenCalled();
    }
  );

  it("rejects another host session before executing and ignores prototype action names", async () => {
    const read = vi.fn();
    const dispatch = createWebMcpRequestDispatcher({
      handlers: { read },
      getSession: () => ({
        generation: 1,
        hostSessionId: "current",
        workspace: null,
      }),
      respond: vi.fn(),
    });
    expect(
      await dispatch({ action: "read", hostSessionId: "stale" }, "wrong")
    ).toBe(false);
    expect(
      await dispatch(
        { action: "toString", hostSessionId: "current" },
        "prototype"
      )
    ).toBe(false);
    expect(read).not.toHaveBeenCalled();
  });
});
