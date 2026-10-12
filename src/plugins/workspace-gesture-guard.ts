import type * as Blockly from "blockly/core";

interface DisposablePlugin {
  dispose: () => void;
}

/** Recover a canvas pan when its mouse release never reaches this iframe. */
export function createWorkspaceGestureGuard(
  workspace: Blockly.WorkspaceSvg,
  blocklyDiv: HTMLElement
): DisposablePlugin {
  const ownerDocument = blocklyDiv.ownerDocument;
  const ownerWindow = ownerDocument.defaultView;
  if (!ownerWindow) return { dispose: () => {} };

  let activePointerId: number | null = null;
  let disposed = false;

  const cancelTrackedGesture = (): void => {
    if (activePointerId === null) return;
    activePointerId = null;
    if (workspace.getGesture()?.hasStarted()) {
      workspace.cancelCurrentGesture();
    }
  };

  const onPointerDown = (event: PointerEvent): void => {
    // A later press also recovers a previous pan whose release was lost.
    cancelTrackedGesture();
    const target = event.target;
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      event.shiftKey ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      !(target instanceof Element) ||
      !blocklyDiv.contains(target) ||
      !target.classList.contains("blocklyMainBackground") ||
      target.closest(".blocklyWorkspace")?.id !== workspace.id
    ) {
      return;
    }
    activePointerId = event.pointerId;
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (
      event.pointerType === "mouse" &&
      event.pointerId === activePointerId &&
      event.buttons === 0
    ) {
      // Capture runs before Blockly's document bubble listener. Cancel even
      // before the drag threshold is crossed so this move cannot start a pan.
      cancelTrackedGesture();
    }
  };

  const onPointerEnd = (event: PointerEvent): void => {
    if (event.pointerId === activePointerId) activePointerId = null;
    // Leave native up/cancel handling and its final coordinates to Blockly.
  };

  const onVisibilityChange = (): void => {
    if (ownerDocument.visibilityState === "hidden") cancelTrackedGesture();
  };

  ownerWindow.addEventListener("pointerdown", onPointerDown, true);
  ownerWindow.addEventListener("pointermove", onPointerMove, true);
  ownerWindow.addEventListener("pointerup", onPointerEnd, true);
  ownerWindow.addEventListener("pointercancel", onPointerEnd, true);
  ownerWindow.addEventListener("blur", cancelTrackedGesture);
  ownerDocument.addEventListener("visibilitychange", onVisibilityChange);

  return {
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      ownerWindow.removeEventListener("pointerdown", onPointerDown, true);
      ownerWindow.removeEventListener("pointermove", onPointerMove, true);
      ownerWindow.removeEventListener("pointerup", onPointerEnd, true);
      ownerWindow.removeEventListener("pointercancel", onPointerEnd, true);
      ownerWindow.removeEventListener("blur", cancelTrackedGesture);
      ownerDocument.removeEventListener("visibilitychange", onVisibilityChange);
      cancelTrackedGesture();
    },
  };
}
