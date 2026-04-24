import {
  Multiselect,
  dragSelectionWeakMap,
  inMultipleSelectionModeWeakMap,
} from "@mit-app-inventor/blockly-plugin-workspace-multiselect";
import * as Blockly from "blockly/core";

interface DisposablePlugin {
  dispose: () => void;
}

interface MultiselectControlsInternals {
  enableMultiselect: () => void;
  disableMultiselect: () => void;
  updateDraggables_: (draggable: unknown) => void;
  multiDraggable?: unknown;
}

type MultiselectWithInternals = Multiselect & {
  controls_?: MultiselectControlsInternals;
};

const MULTI_SELECT_KEYS = ["Shift"];
const NORMALIZED_MULTI_SELECT_KEYS = MULTI_SELECT_KEYS.map((key) =>
  key.toLocaleLowerCase()
);

export function createMultiselectController(
  workspace: Blockly.WorkspaceSvg
): DisposablePlugin | null {
  try {
    const plugin = new Multiselect(workspace) as MultiselectWithInternals;
    plugin.init({
      useDoubleClick: false,
      bumpNeighbours: true,
      multiFieldUpdate: false,
      workspaceAutoFocus: false,
      multiSelectKeys: MULTI_SELECT_KEYS,
      multiselectCopyPaste: {
        crossTab: false,
        menu: true,
      },
      multiselectIcon: {
        hideIcon: true,
        weight: 3,
      },
    });

    localizeSelectAllMenu();
    const disposeStableGestureBridge = bindStableGestureBridge(
      workspace,
      plugin
    );

    console.log("Plugin: Multiselect loaded");
    return {
      dispose: () => {
        disposeStableGestureBridge();
        plugin.dispose();
      },
    };
  } catch (e) {
    console.error("Multiselect init error:", e);
    return null;
  }
}

function localizeSelectAllMenu(): void {
  const selectAllItem = Blockly.ContextMenuRegistry.registry.getItem(
    "workspaceSelectAll"
  ) as { displayText?: () => string } | null;

  if (selectAllItem) {
    selectAllItem.displayText = () =>
      Blockly.Msg["WORKSPACE_SELECT_ALL_BLOCKS"] || "Select All Blocks";
  }
}

function bindStableGestureBridge(
  workspace: Blockly.WorkspaceSvg,
  plugin: MultiselectWithInternals
): () => void {
  const injectionDiv = workspace.getInjectionDiv();
  let isPointerInsideWorkspace = false;
  let isMultiselectKeyPressed = false;
  let shouldSuppressNextClick = false;

  const getControls = (): MultiselectControlsInternals | null =>
    plugin.controls_ || null;

  const isInMultipleSelectionMode = (): boolean =>
    inMultipleSelectionModeWeakMap.get(workspace) === true;

  const enableMultiselect = (): void => {
    const controls = getControls();
    if (!controls || isInMultipleSelectionMode()) return;
    controls.enableMultiselect();
    includeCurrentSelectedBlock(workspace, controls);
  };

  const disableMultiselect = (): void => {
    const controls = getControls();
    if (!controls || !isInMultipleSelectionMode()) return;
    controls.disableMultiselect();
  };

  const onPointerEnter = (): void => {
    isPointerInsideWorkspace = true;
  };

  const onPointerLeave = (): void => {
    isPointerInsideWorkspace = false;
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!isMultiselectKey(event) || event.repeat) return;

    isMultiselectKeyPressed = true;
    if (isEditableTarget(event.target)) return;
    if (isPointerInsideWorkspace || injectionDiv.contains(document.activeElement)) {
      enableMultiselect();
    }
  };

  const onKeyUp = (event: KeyboardEvent): void => {
    if (!isMultiselectKey(event)) return;

    isMultiselectKeyPressed = false;
    disableMultiselect();
  };

  const onWindowBlur = (): void => {
    isMultiselectKeyPressed = false;
    disableMultiselect();
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;

    const isShiftSelection =
      event.shiftKey || isMultiselectKeyPressed || isInMultipleSelectionMode();

    if (!isShiftSelection) {
      disableMultiselect();
      return;
    }

    if (!event.shiftKey && !isMultiselectKeyPressed) {
      disableMultiselect();
      return;
    }

    enableMultiselect();

    const block = getEventBlock(workspace, event);
    if (!block) return;

    const controls = getControls();
    if (!controls) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    shouldSuppressNextClick = true;

    includeCurrentSelectedBlock(workspace, controls, block.id);
    controls.updateDraggables_(block);
    syncBlocklySelection(workspace, controls);
  };

  const onPointerUp = (event: PointerEvent): void => {
    if (!event.shiftKey && !isMultiselectKeyPressed) {
      disableMultiselect();
    }
  };

  const onClick = (event: MouseEvent): void => {
    if (!shouldSuppressNextClick) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    shouldSuppressNextClick = false;
  };

  injectionDiv.addEventListener("pointerenter", onPointerEnter);
  injectionDiv.addEventListener("pointerleave", onPointerLeave);
  injectionDiv.addEventListener("pointerdown", onPointerDown, true);
  injectionDiv.addEventListener("click", onClick, true);
  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keyup", onKeyUp, true);
  window.addEventListener("blur", onWindowBlur);
  window.addEventListener("pointerup", onPointerUp, true);

  return () => {
    injectionDiv.removeEventListener("pointerenter", onPointerEnter);
    injectionDiv.removeEventListener("pointerleave", onPointerLeave);
    injectionDiv.removeEventListener("pointerdown", onPointerDown, true);
    injectionDiv.removeEventListener("click", onClick, true);
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("keyup", onKeyUp, true);
    window.removeEventListener("blur", onWindowBlur);
    window.removeEventListener("pointerup", onPointerUp, true);
  };
}

function isMultiselectKey(event: KeyboardEvent): boolean {
  return NORMALIZED_MULTI_SELECT_KEYS.includes(event.key.toLocaleLowerCase());
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.classList.contains("blocklyHtmlInput")
  );
}

function getEventBlock(
  workspace: Blockly.WorkspaceSvg,
  event: PointerEvent
): Blockly.BlockSvg | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;

  const blockGroup = target.closest<SVGGElement>(
    "g.blocklyDraggable[data-id]"
  );
  if (!blockGroup || !workspace.getInjectionDiv().contains(blockGroup)) {
    return null;
  }

  const blockId = blockGroup.dataset.id;
  if (!blockId) return null;

  const block = workspace.getBlockById(blockId);
  if (!(block instanceof Blockly.BlockSvg)) return null;
  if (!canToggleBlock(block)) return null;

  return block;
}

function canToggleBlock(block: Blockly.BlockSvg): boolean {
  return (
    !block.isInFlyout &&
    !block.isInsertionMarker() &&
    !block.isShadow() &&
    (block.isMovable() || block.isDeletable())
  );
}

function includeCurrentSelectedBlock(
  workspace: Blockly.WorkspaceSvg,
  controls: MultiselectControlsInternals,
  exceptBlockId?: string
): void {
  const selected = Blockly.getSelected();
  if (!(selected instanceof Blockly.BlockSvg)) return;
  if (selected.workspace !== workspace || selected.id === exceptBlockId) return;
  if (!canToggleBlock(selected)) return;

  const selectedBlocks = dragSelectionWeakMap.get(workspace);
  if (selectedBlocks?.has(selected.id)) return;

  controls.updateDraggables_(selected);
}

function syncBlocklySelection(
  workspace: Blockly.WorkspaceSvg,
  controls: MultiselectControlsInternals
): void {
  const selectedBlocks = dragSelectionWeakMap.get(workspace);
  const nextSelection = selectedBlocks?.size ? controls.multiDraggable : null;

  (
    Blockly.common.setSelected as unknown as (
      newSelection: unknown | null
    ) => void
  )(nextSelection || null);
}
