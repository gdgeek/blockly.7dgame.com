export interface FrameScheduler {
  request(callback: FrameRequestCallback): number;
  cancel(handle: number): void;
}

const browserFrameScheduler: FrameScheduler = {
  request: (callback) => window.requestAnimationFrame(callback),
  cancel: (handle) => window.cancelAnimationFrame(handle),
};

/**
 * Coalesces repeated work so it runs at most once in the next animation frame.
 * `flush` is used by synchronous boundaries (such as save) that must observe
 * the latest queued state before continuing.
 */
export function createFrameCoalescer(
  task: () => void,
  scheduler: FrameScheduler = browserFrameScheduler
) {
  let frameHandle: number | null = null;
  let pending = false;
  let generation = 0;

  const schedule = (): void => {
    pending = true;
    if (frameHandle !== null) return;

    const scheduledGeneration = generation;
    frameHandle = scheduler.request(() => {
      if (scheduledGeneration !== generation) return;
      frameHandle = null;
      if (!pending) return;
      pending = false;
      task();
    });
  };

  const flush = (): boolean => {
    if (!pending) return false;

    generation += 1;
    if (frameHandle !== null) {
      scheduler.cancel(frameHandle);
      frameHandle = null;
    }
    pending = false;
    task();
    return true;
  };

  const cancel = (): void => {
    generation += 1;
    if (frameHandle !== null) {
      scheduler.cancel(frameHandle);
      frameHandle = null;
    }
    pending = false;
  };

  return {
    schedule,
    flush,
    cancel,
    get pending(): boolean {
      return pending;
    },
  };
}
