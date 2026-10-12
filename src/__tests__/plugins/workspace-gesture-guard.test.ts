import { afterEach, describe, expect, it, vi } from "vitest";
import type * as Blockly from "blockly/core";
import { createWorkspaceGestureGuard } from "@/plugins/workspace-gesture-guard";

const pointerEvent = (
  type: string,
  options: Partial<PointerEventInit> = {}
): PointerEvent =>
  new PointerEvent(type, {
    bubbles: true,
    pointerType: "mouse",
    pointerId: 1,
    button: 0,
    buttons: type === "pointerup" ? 0 : 1,
    ...options,
  });

const cleanups: Array<() => void> = [];

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  vi.restoreAllMocks();
});

function setup() {
  const blocklyDiv = document.createElement("div");
  blocklyDiv.innerHTML = `
    <svg><g class="blocklyWorkspace" id="main-workspace">
      <rect class="blocklyMainBackground"></rect>
      <g class="blocklyDraggable"><path></path></g>
    </g></svg>
    <svg><g class="blocklyWorkspace" id="minimap-workspace">
      <rect class="blocklyMainBackground"></rect>
    </g></svg>
    <button class="flyout-lock-btn"></button>
    <input class="blocklyHtmlInput">
  `;
  document.body.appendChild(blocklyDiv);
  const background = blocklyDiv.querySelector(".blocklyMainBackground")!;
  const gesture = { hasStarted: vi.fn(() => true) };
  let currentGesture: typeof gesture | null = null;
  let scrollX = 0;
  const coreMove = vi.fn((event: Event) => {
    if ((event as PointerEvent).pointerId !== 1) return;
    scrollX = (event as PointerEvent).clientX;
  });
  const coreEnd = vi.fn((event: Event) => {
    if ((event as PointerEvent).pointerId !== 1) return;
    scrollX = (event as PointerEvent).clientX;
    removeCoreListeners();
  });
  const removeCoreListeners = (): void => {
    document.removeEventListener("pointermove", coreMove);
    document.removeEventListener("pointerup", coreEnd);
    document.removeEventListener("pointercancel", coreEnd);
    currentGesture = null;
  };
  const workspace = {
    id: "main-workspace",
    getGesture: vi.fn(() => currentGesture),
    cancelCurrentGesture: vi.fn(removeCoreListeners),
  };
  const coreDown = (): void => {
    currentGesture = gesture;
    document.addEventListener("pointermove", coreMove);
    document.addEventListener("pointerup", coreEnd);
    document.addEventListener("pointercancel", coreEnd);
  };
  background.addEventListener("pointerdown", coreDown);
  const guard = createWorkspaceGestureGuard(
    workspace as unknown as Blockly.WorkspaceSvg,
    blocklyDiv
  );
  cleanups.push(() => {
    guard.dispose();
    removeCoreListeners();
    blocklyDiv.remove();
  });
  return {
    background,
    blocklyDiv,
    coreMove,
    coreEnd,
    gesture,
    guard,
    getScrollX: () => scrollX,
    workspace,
  };
}

describe("workspace gesture release recovery", () => {
  it("stops a lost-release pan before the first zero-button move reaches Blockly", () => {
    const context = setup();
    context.background.dispatchEvent(pointerEvent("pointerdown"));
    context.background.dispatchEvent(
      pointerEvent("pointermove", { clientX: 30 })
    );
    expect(context.getScrollX()).toBe(30);

    context.background.dispatchEvent(
      pointerEvent("pointermove", { buttons: 0, clientX: 90 })
    );

    expect(context.workspace.cancelCurrentGesture).toHaveBeenCalledOnce();
    expect(context.coreMove).toHaveBeenCalledOnce();
    expect(context.getScrollX()).toBe(30);
    expect(context.workspace.getGesture()).toBeNull();
  });

  it("also cancels before a released mouse could cross the initial drag threshold", () => {
    const context = setup();
    context.background.dispatchEvent(pointerEvent("pointerdown"));
    context.background.dispatchEvent(
      pointerEvent("pointermove", { buttons: 0, clientX: 90 })
    );

    expect(context.workspace.cancelCurrentGesture).toHaveBeenCalledOnce();
    expect(context.coreMove).not.toHaveBeenCalled();
    expect(context.getScrollX()).toBe(0);
  });

  it.each(["pointerup", "pointercancel"])(
    "leaves native %s and its final coordinates to Blockly",
    (type) => {
      const context = setup();
      context.background.dispatchEvent(pointerEvent("pointerdown"));
      context.background.dispatchEvent(
        pointerEvent("pointermove", { clientX: 30 })
      );
      context.background.dispatchEvent(pointerEvent(type, { clientX: 40 }));
      context.background.dispatchEvent(
        pointerEvent("pointermove", { buttons: 0, clientX: 90 })
      );

      expect(context.workspace.cancelCurrentGesture).not.toHaveBeenCalled();
      expect(context.coreEnd).toHaveBeenCalledOnce();
      expect(context.getScrollX()).toBe(40);
    }
  );

  it("ignores unrelated pointer IDs while recovering the tracked mouse", () => {
    const context = setup();
    context.background.dispatchEvent(pointerEvent("pointerdown"));
    context.background.dispatchEvent(
      pointerEvent("pointerup", { pointerId: 2 })
    );
    context.background.dispatchEvent(
      pointerEvent("pointermove", { pointerId: 2, buttons: 0 })
    );
    expect(context.workspace.cancelCurrentGesture).not.toHaveBeenCalled();
    context.background.dispatchEvent(
      pointerEvent("pointermove", { buttons: 0 })
    );
    expect(context.workspace.cancelCurrentGesture).toHaveBeenCalledOnce();
  });

  it("recovers on blur and does not cancel twice when zero-button movement resumes", () => {
    const context = setup();
    context.background.dispatchEvent(pointerEvent("pointerdown"));
    window.dispatchEvent(new Event("blur"));
    context.background.dispatchEvent(
      pointerEvent("pointermove", { buttons: 0 })
    );

    expect(context.workspace.cancelCurrentGesture).toHaveBeenCalledOnce();
    expect(context.coreMove).not.toHaveBeenCalled();
  });

  it("recovers only when document visibility becomes hidden", () => {
    const context = setup();
    context.background.dispatchEvent(pointerEvent("pointerdown"));
    const visibility = vi.spyOn(document, "visibilityState", "get");
    visibility.mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(context.workspace.cancelCurrentGesture).not.toHaveBeenCalled();

    visibility.mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(context.workspace.cancelCurrentGesture).toHaveBeenCalledOnce();
  });

  it.each([
    { pointerType: "touch" },
    { pointerType: "pen" },
    { shiftKey: true },
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    { button: 2, buttons: 2 },
  ])("leaves other pointer gestures alone: %j", (options) => {
    const context = setup();
    context.background.dispatchEvent(pointerEvent("pointerdown", options));
    context.background.dispatchEvent(
      pointerEvent("pointermove", { ...options, buttons: 0 })
    );
    window.dispatchEvent(new Event("blur"));
    expect(context.workspace.cancelCurrentGesture).not.toHaveBeenCalled();
  });

  it.each([
    ".blocklyDraggable path",
    ".flyout-lock-btn",
    ".blocklyHtmlInput",
    "#minimap-workspace .blocklyMainBackground",
  ])("does not own gestures on %s", (selector) => {
    const context = setup();
    const target = context.blocklyDiv.querySelector(selector)!;
    target.dispatchEvent(pointerEvent("pointerdown"));
    target.dispatchEvent(pointerEvent("pointermove", { buttons: 0 }));
    window.dispatchEvent(new Event("blur"));
    expect(context.workspace.cancelCurrentGesture).not.toHaveBeenCalled();
  });

  it("cancels a stale pan before a new press on another control", () => {
    const context = setup();
    context.background.dispatchEvent(pointerEvent("pointerdown"));
    context.blocklyDiv
      .querySelector("button")!
      .dispatchEvent(pointerEvent("pointerdown"));
    expect(context.workspace.cancelCurrentGesture).toHaveBeenCalledOnce();
    window.dispatchEvent(new Event("blur"));
    expect(context.workspace.cancelCurrentGesture).toHaveBeenCalledOnce();
  });

  it("disposes idempotently and leaves no mouse or focus listeners", () => {
    const context = setup();
    context.background.dispatchEvent(pointerEvent("pointerdown"));
    context.guard.dispose();
    context.guard.dispose();
    expect(context.workspace.cancelCurrentGesture).toHaveBeenCalledOnce();
    context.workspace.cancelCurrentGesture.mockClear();

    context.background.dispatchEvent(pointerEvent("pointerdown"));
    context.background.dispatchEvent(
      pointerEvent("pointermove", { buttons: 0 })
    );
    window.dispatchEvent(new Event("blur"));
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(context.workspace.cancelCurrentGesture).not.toHaveBeenCalled();
  });
});
