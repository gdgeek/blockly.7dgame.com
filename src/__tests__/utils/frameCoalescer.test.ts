import { describe, expect, it, vi } from "vitest";
import {
  createFrameCoalescer,
  type FrameScheduler,
} from "@/utils/frameCoalescer";

function createScheduler() {
  let nextHandle = 1;
  const callbacks = new Map<number, FrameRequestCallback>();
  const scheduler: FrameScheduler = {
    request: vi.fn((callback: FrameRequestCallback) => {
      const handle = nextHandle++;
      callbacks.set(handle, callback);
      return handle;
    }),
    cancel: vi.fn((handle: number) => {
      callbacks.delete(handle);
    }),
  };

  const runNextFrame = (): void => {
    const pendingCallbacks = [...callbacks.values()];
    callbacks.clear();
    pendingCallbacks.forEach((callback) => callback(0));
  };

  return { scheduler, runNextFrame };
}

describe("createFrameCoalescer", () => {
  it("runs repeated schedules once in the next frame", () => {
    const task = vi.fn();
    const { scheduler, runNextFrame } = createScheduler();
    const coalescer = createFrameCoalescer(task, scheduler);

    coalescer.schedule();
    coalescer.schedule();
    coalescer.schedule();

    expect(scheduler.request).toHaveBeenCalledOnce();
    expect(task).not.toHaveBeenCalled();

    runNextFrame();

    expect(task).toHaveBeenCalledOnce();
    expect(coalescer.pending).toBe(false);
  });

  it("flushes queued work synchronously and invalidates its frame", () => {
    const task = vi.fn();
    const { scheduler, runNextFrame } = createScheduler();
    const coalescer = createFrameCoalescer(task, scheduler);

    coalescer.schedule();

    expect(coalescer.flush()).toBe(true);
    expect(task).toHaveBeenCalledOnce();
    expect(scheduler.cancel).toHaveBeenCalledOnce();

    runNextFrame();

    expect(task).toHaveBeenCalledOnce();
    expect(coalescer.flush()).toBe(false);
  });

  it("cancels queued work during teardown", () => {
    const task = vi.fn();
    const { runNextFrame, scheduler } = createScheduler();
    const coalescer = createFrameCoalescer(task, scheduler);

    coalescer.schedule();
    coalescer.cancel();
    runNextFrame();

    expect(scheduler.cancel).toHaveBeenCalledOnce();
    expect(task).not.toHaveBeenCalled();
    expect(coalescer.pending).toBe(false);
  });
});
