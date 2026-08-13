import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";

const componentMocks = vi.hoisted(() => ({
  applyVariableTooltipMessages: vi.fn(),
  initPlugins: vi.fn(),
  inject: vi.fn(),
  localizedContextMenu: vi.fn(),
  overrideMathRandomRangeMessages: vi.fn(),
  overrideProcedureMessages: vi.fn(),
  setLocale: vi.fn(),
  watchTheme: vi.fn(),
}));

vi.mock("blockly/core", () => ({
  Events: {
    TOOLBOX_ITEM_SELECT: "toolbox_item_select",
  },
  inject: componentMocks.inject,
  setLocale: componentMocks.setLocale,
}));
vi.mock("blockly/blocks", () => ({}));
vi.mock("blockly/msg/en", () => ({}));
vi.mock("blockly/msg/zh-hans", () => ({}));
vi.mock("blockly/msg/zh-hant", () => ({}));
vi.mock("blockly/msg/ja", () => ({}));
vi.mock("blockly/msg/th", () => ({}));
vi.mock("@/localization", () => ({
  applyVariableTooltipMessages: componentMocks.applyVariableTooltipMessages,
}));
vi.mock("@/localization/context_menu", () => ({
  localizedContextMenu: componentMocks.localizedContextMenu,
}));
vi.mock("@/localization/math_override", () => ({
  overrideMathRandomRangeMessages:
    componentMocks.overrideMathRandomRangeMessages,
}));
vi.mock("@/localization/procedure_override", () => ({
  overrideProcedureMessages: componentMocks.overrideProcedureMessages,
}));
vi.mock("@/composables/useTheme", () => ({
  useTheme: () => ({ watchTheme: componentMocks.watchTheme }),
}));
vi.mock("@/plugins", () => ({
  usePluginManager: () => ({
    initPlugins: componentMocks.initPlugins,
    minimapActions: {
      hide: vi.fn(),
      show: vi.fn(),
    },
    minimapState: {
      isEnoughSpace: false,
      isHoveringBtn: false,
      isVisible: false,
    },
  }),
}));

import BlocklyComponent from "@/components/BlocklyComponent.vue";

class MutationObserverMock {
  static instances: MutationObserverMock[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(private readonly callback: MutationCallback) {
    MutationObserverMock.instances.push(this);
  }

  emit(): void {
    this.callback([], this as unknown as MutationObserver);
  }
}

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(private readonly callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }

  emit(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

interface FlyoutHarness {
  callFlyoutHide: () => void;
  clickCategory: (id?: "category-id" | "other-category-id") => void;
  clearToolboxSelection: () => void;
  changeListener: (event: { type: string; newItem?: string | null }) => void;
  getSelectedCategoryId: () => string | null;
  isFlyoutVisible: () => boolean;
  loseToolboxSelection: () => void;
  originalFlyoutHide: ReturnType<typeof vi.fn>;
  originalToolboxClearSelection: ReturnType<typeof vi.fn>;
  workspaceRemoveChangeListener: ReturnType<typeof vi.fn>;
}

const mountComponent = (): {
  harness: FlyoutHarness;
  wrapper: VueWrapper;
} => {
  const category = {
    getId: () => "category-id",
    getName: () => "category-name",
  };
  const otherCategory = {
    getId: () => "other-category-id",
    getName: () => "other-category-name",
  };
  let selectedCategory: unknown = category;
  let flyoutVisible = true;
  let changeListener: FlyoutHarness["changeListener"] = () => {};
  const flyoutHide = vi.fn(() => {
    flyoutVisible = false;
  });
  const flyout = {
    getWidth: () => 240,
    getX: () => 160,
    getY: () => 20,
    hide: flyoutHide,
    isVisible: () => flyoutVisible,
    show: vi.fn(() => {
      flyoutVisible = true;
    }),
  };
  const toolboxSetSelectedItem = vi.fn((item: unknown) => {
    const oldItem = selectedCategory;
    if (oldItem !== null) selectedCategory = null;
    if (item !== null && item !== oldItem) selectedCategory = item;

    if (item !== null && item !== oldItem) {
      flyout.show();
    } else {
      flyout.hide();
    }
  });
  const toolboxClearSelection = vi.fn(() => {
    toolbox.setSelectedItem(null);
  });
  const toolbox = {
    clearSelection: toolboxClearSelection,
    getFlyout: () => flyout,
    getSelectedItem: () => selectedCategory,
    getToolboxItems: () => [category, otherCategory],
    setSelectedItem: toolboxSetSelectedItem,
  };
  const workspaceRemoveChangeListener = vi.fn();
  const workspace = {
    addChangeListener: vi.fn((listener: FlyoutHarness["changeListener"]) => {
      changeListener = listener;
    }),
    getToolbox: () => toolbox,
    removeChangeListener: workspaceRemoveChangeListener,
  };

  componentMocks.inject.mockImplementation((blocklyDiv: HTMLElement) => {
    const flyoutElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    flyoutElement.classList.add("blocklyFlyout");
    blocklyDiv.appendChild(flyoutElement);
    return workspace;
  });

  const wrapper = mount(BlocklyComponent);
  return {
    harness: {
      callFlyoutHide: () => flyout.hide(),
      clickCategory: (id = "category-id") =>
        toolbox.setSelectedItem(
          id === "category-id" ? category : otherCategory
        ),
      clearToolboxSelection: () => toolbox.clearSelection(),
      changeListener: (event) => changeListener(event),
      getSelectedCategoryId: () =>
        (selectedCategory as { getId?: () => string } | null)?.getId?.() ??
        null,
      isFlyoutVisible: () => flyoutVisible,
      loseToolboxSelection: () => {
        selectedCategory = null;
      },
      originalFlyoutHide: flyoutHide,
      originalToolboxClearSelection: toolboxClearSelection,
      workspaceRemoveChangeListener,
    },
    wrapper,
  };
};

describe("BlocklyComponent flyout lock synchronization", () => {
  let animationFrames: Map<number, FrameRequestCallback>;
  let nextAnimationFrameId: number;

  beforeEach(() => {
    vi.clearAllMocks();
    MutationObserverMock.instances.length = 0;
    ResizeObserverMock.instances.length = 0;
    animationFrames = new Map();
    nextAnimationFrameId = 1;

    vi.stubGlobal("MutationObserver", MutationObserverMock);
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        const id = nextAnimationFrameId++;
        animationFrames.set(id, callback);
        return id;
      })
    );
    vi.stubGlobal(
      "cancelAnimationFrame",
      vi.fn((id: number) => animationFrames.delete(id))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it("coalesces observer and event updates into one non-recurring frame", () => {
    const { harness, wrapper } = mountComponent();
    const requestFrame = vi.mocked(window.requestAnimationFrame);

    expect(requestFrame).toHaveBeenCalledOnce();
    MutationObserverMock.instances[0].emit();
    ResizeObserverMock.instances[0].emit();
    window.dispatchEvent(new Event("resize"));
    harness.changeListener({
      type: "toolbox_item_select",
      newItem: "category-name",
    });

    expect(requestFrame).toHaveBeenCalledOnce();

    const firstFrame = animationFrames.get(1);
    expect(firstFrame).toBeDefined();
    animationFrames.delete(1);
    firstFrame?.(0);

    expect(requestFrame).toHaveBeenCalledOnce();
    expect(animationFrames.size).toBe(0);

    window.dispatchEvent(new Event("resize"));
    MutationObserverMock.instances[0].emit();
    expect(requestFrame).toHaveBeenCalledTimes(2);

    wrapper.unmount();
  });

  it("preserves lock behavior and cancels a pending frame on unmount", async () => {
    const { harness, wrapper } = mountComponent();
    const initialFrame = animationFrames.get(1);
    animationFrames.delete(1);
    initialFrame?.(0);
    await nextTick();

    const lockButton = wrapper.get(".flyout-lock-btn");
    harness.changeListener({
      type: "toolbox_item_select",
      newItem: "category-name",
    });
    harness.loseToolboxSelection();
    await lockButton.trigger("pointerdown");
    expect(lockButton.classes()).toContain("locked");
    expect(harness.getSelectedCategoryId()).toBe("category-id");

    harness.callFlyoutHide();
    harness.clearToolboxSelection();
    expect(harness.originalFlyoutHide).not.toHaveBeenCalled();
    expect(harness.originalToolboxClearSelection).not.toHaveBeenCalled();

    const cancelFrame = vi.mocked(window.cancelAnimationFrame);
    wrapper.unmount();

    expect(cancelFrame).toHaveBeenCalledOnce();
    expect(MutationObserverMock.instances[0].disconnect).toHaveBeenCalledOnce();
    expect(ResizeObserverMock.instances[0].disconnect).toHaveBeenCalledOnce();
    expect(harness.workspaceRemoveChangeListener).toHaveBeenCalledOnce();
  });

  it("clears a stale unlocked category after the flyout auto-hides", () => {
    const { harness, wrapper } = mountComponent();

    expect(harness.getSelectedCategoryId()).toBe("category-id");
    harness.callFlyoutHide();
    expect(harness.isFlyoutVisible()).toBe(false);
    expect(harness.getSelectedCategoryId()).toBe("category-id");

    const syncFrame = animationFrames.get(1);
    animationFrames.delete(1);
    syncFrame?.(0);

    expect(harness.getSelectedCategoryId()).toBeNull();
    expect(harness.originalToolboxClearSelection).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it("opens a stale hidden category on the first click without breaking toggle-off", () => {
    const { harness, wrapper } = mountComponent();
    const initialFrame = animationFrames.get(1);
    animationFrames.delete(1);
    initialFrame?.(0);

    harness.callFlyoutHide();
    expect(harness.isFlyoutVisible()).toBe(false);
    expect(harness.getSelectedCategoryId()).toBe("category-id");

    harness.clickCategory();
    expect(harness.isFlyoutVisible()).toBe(true);
    expect(harness.getSelectedCategoryId()).toBe("category-id");

    harness.clickCategory();
    expect(harness.isFlyoutVisible()).toBe(false);
    expect(harness.getSelectedCategoryId()).toBeNull();
    wrapper.unmount();
  });

  it("switches directly from a stale hidden category to another category", () => {
    const { harness, wrapper } = mountComponent();
    const initialFrame = animationFrames.get(1);
    animationFrames.delete(1);
    initialFrame?.(0);

    harness.callFlyoutHide();
    harness.clickCategory("other-category-id");

    expect(harness.isFlyoutVisible()).toBe(true);
    expect(harness.getSelectedCategoryId()).toBe("other-category-id");
    wrapper.unmount();
  });
});
