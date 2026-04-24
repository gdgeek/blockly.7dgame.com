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
  multiDraggable?: MultiselectDraggableCompat;
}

type MultiselectWithInternals = Multiselect & {
  controls_?: MultiselectControlsInternals;
};

interface MultiselectDraggableCompat {
  id: string;
  workspace: Blockly.WorkspaceSvg;
  subDraggables: Map<unknown, unknown>;
  clearAll_: () => void;
  getBoundingRectangle: () => Blockly.utils.Rect;
  select: () => void;
  unselect: () => void;
  getFocusableElement?: () => SVGElement;
  getFocusableTree?: () => Blockly.WorkspaceSvg;
  onNodeFocus?: () => void;
  onNodeBlur?: () => void;
  canBeFocused?: () => boolean;
  showContextMenu?: (event: Event) => void;
}

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
    const disposeBlockly12FocusPatch = patchMultiselectDraggableForBlockly12(
      workspace,
      plugin
    );
    const disposeStableGestureBridge = bindStableGestureBridge(
      workspace,
      plugin
    );

    console.log("Plugin: Multiselect loaded");
    return {
      dispose: () => {
        disposeStableGestureBridge();
        disposeBlockly12FocusPatch();
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
  let isMultiselectKeyPressed = false;
  let shouldSuppressNextClick = false;

  const getControls = (): MultiselectControlsInternals | null =>
    plugin.controls_ || null;

  const isInMultipleSelectionMode = (): boolean =>
    inMultipleSelectionModeWeakMap.get(workspace) === true;

  const getSelectedBlockIds = (): Set<string> | null =>
    dragSelectionWeakMap.get(workspace) || null;

  const enableMultiselect = (includeSelectedBlock = true): void => {
    const controls = getControls();
    if (!controls || isInMultipleSelectionMode()) return;
    controls.enableMultiselect();
    if (includeSelectedBlock) {
      includeCurrentSelectedBlock(workspace, controls);
    }
  };

  const disableMultiselect = (preserveSelection = true): void => {
    const controls = getControls();
    if (!controls) return;

    if (isInMultipleSelectionMode()) {
      controls.disableMultiselect();
    }
    if (preserveSelection) {
      focusMultiselectDraggable(workspace, controls);
    }
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!isMultiselectKey(event) || event.repeat) return;

    isMultiselectKeyPressed = true;
    if (isEditableTarget(event.target)) return;
    enableMultiselect();
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

    const block = getEventBlock(workspace, event);
    const selectedBlockIds = getSelectedBlockIds();
    const hasSelection = Boolean(selectedBlockIds?.size);
    const isBlockInSelection = Boolean(block && selectedBlockIds?.has(block.id));
    const isShiftSelection = event.shiftKey || isMultiselectKeyPressed;

    if (!isShiftSelection) {
      disableMultiselect(isBlockInSelection);
      if (!block || !isBlockInSelection) {
        clearMultiselectSelection(workspace, getControls());
      }
      return;
    }

    enableMultiselect();

    if (!block) {
      return;
    }

    const controls = getControls();
    if (!controls) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    shouldSuppressNextClick = true;

    includeCurrentSelectedBlock(workspace, controls, block.id);
    controls.updateDraggables_(block);
    if (selectedBlockIds?.size) {
      focusMultiselectDraggable(workspace, controls);
    } else if (hasSelection) {
      focusWorkspace(workspace);
    }
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

  injectionDiv.addEventListener("pointerdown", onPointerDown, true);
  injectionDiv.addEventListener("click", onClick, true);
  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keyup", onKeyUp, true);
  window.addEventListener("blur", onWindowBlur);
  window.addEventListener("pointerup", onPointerUp, true);

  return () => {
    injectionDiv.removeEventListener("pointerdown", onPointerDown, true);
    injectionDiv.removeEventListener("click", onClick, true);
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("keyup", onKeyUp, true);
    window.removeEventListener("blur", onWindowBlur);
    window.removeEventListener("pointerup", onPointerUp, true);
  };
}

function patchMultiselectDraggableForBlockly12(
  workspace: Blockly.WorkspaceSvg,
  plugin: MultiselectWithInternals
): () => void {
  const multiDraggable = plugin.controls_?.multiDraggable;
  if (!multiDraggable) return () => {};

  const focusElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  focusElement.setAttribute("id", `blockly-multiselect-${workspace.id}`);
  focusElement.setAttribute("width", "1");
  focusElement.setAttribute("height", "1");
  focusElement.setAttribute("opacity", "0");
  focusElement.setAttribute("pointer-events", "none");
  focusElement.setAttribute("aria-hidden", "true");
  workspace.getCanvas().appendChild(focusElement);

  const workspaceWithLookup = workspace as unknown as {
    lookUpFocusableNode: (id: string) => unknown;
  };
  const originalLookUpFocusableNode =
    workspaceWithLookup.lookUpFocusableNode.bind(workspaceWithLookup);
  const originalSelect = multiDraggable.select.bind(multiDraggable);
  const originalUnselect = multiDraggable.unselect.bind(multiDraggable);
  const originalShowContextMenu = multiDraggable.showContextMenu;

  workspaceWithLookup.lookUpFocusableNode = (id: string): unknown => {
    if (id === focusElement.id) return multiDraggable;
    return originalLookUpFocusableNode(id);
  };

  multiDraggable.getFocusableElement = () => focusElement;
  multiDraggable.getFocusableTree = () => workspace;
  multiDraggable.canBeFocused = () =>
    (dragSelectionWeakMap.get(workspace)?.size || 0) > 0;
  multiDraggable.select = () => {
    setMultiselectVisualState(multiDraggable, true);
  };
  multiDraggable.unselect = () => {
    setMultiselectVisualState(multiDraggable, false);
  };
  multiDraggable.onNodeFocus = () => {
    multiDraggable.select();
    workspace.scrollBoundsIntoView(multiDraggable.getBoundingRectangle());
  };
  multiDraggable.onNodeBlur = () => {
    multiDraggable.unselect();
  };
  multiDraggable.showContextMenu = (event: Event) => {
    const eventBlock =
      event instanceof MouseEvent ? getEventBlock(workspace, event) : null;
    const fallbackBlock = getFirstSelectedBlock(workspace, multiDraggable);
    (eventBlock || fallbackBlock)?.showContextMenu(event);
  };

  return () => {
    workspaceWithLookup.lookUpFocusableNode = originalLookUpFocusableNode;
    multiDraggable.select = originalSelect;
    multiDraggable.unselect = originalUnselect;
    delete multiDraggable.getFocusableElement;
    delete multiDraggable.getFocusableTree;
    delete multiDraggable.onNodeFocus;
    delete multiDraggable.onNodeBlur;
    delete multiDraggable.canBeFocused;
    if (originalShowContextMenu) {
      multiDraggable.showContextMenu = originalShowContextMenu;
    } else {
      delete multiDraggable.showContextMenu;
    }
    focusElement.remove();
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
  event: MouseEvent
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

function getFirstSelectedBlock(
  workspace: Blockly.WorkspaceSvg,
  multiDraggable: MultiselectDraggableCompat
): Blockly.BlockSvg | null {
  for (const [draggable] of multiDraggable.subDraggables) {
    if (draggable instanceof Blockly.BlockSvg && draggable.workspace === workspace) {
      return draggable;
    }
  }

  return null;
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

function focusMultiselectDraggable(
  workspace: Blockly.WorkspaceSvg,
  controls: MultiselectControlsInternals
): void {
  const selectedBlocks = dragSelectionWeakMap.get(workspace);
  const multiDraggable = controls.multiDraggable;
  if (!selectedBlocks?.size || !multiDraggable) return;

  setMultiselectVisualState(multiDraggable, true);
  (Blockly.common.setSelected as unknown as (newSelection: unknown) => void)(
    multiDraggable
  );
}

function clearMultiselectSelection(
  workspace: Blockly.WorkspaceSvg,
  controls: MultiselectControlsInternals | null
): void {
  const multiDraggable = controls?.multiDraggable;
  if (multiDraggable) {
    setMultiselectVisualState(multiDraggable, false);
    multiDraggable.clearAll_();
  }

  dragSelectionWeakMap.get(workspace)?.clear();
  focusWorkspace(workspace);
}

function focusWorkspace(workspace: Blockly.WorkspaceSvg): void {
  (
    Blockly.getFocusManager as unknown as () => {
      focusNode: (node: unknown) => void;
    }
  )().focusNode(workspace);
}

function setMultiselectVisualState(
  multiDraggable: MultiselectDraggableCompat,
  selected: boolean
): void {
  for (const [draggable] of multiDraggable.subDraggables) {
    if (draggable instanceof Blockly.BlockSvg) {
      draggable.pathObject.updateSelected(selected);
      continue;
    }

    const selectable = draggable as {
      select?: () => void;
      unselect?: () => void;
    };
    if (selected) selectable.select?.();
    else selectable.unselect?.();
  }
}
