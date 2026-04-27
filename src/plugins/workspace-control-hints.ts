import * as Blockly from "blockly/core";

interface DisposablePlugin {
  dispose: () => void;
}

type SupportedLanguage = "zh-CN" | "zh-TW" | "en-US" | "ja-JP" | "th-TH";

type TooltipKey =
  | "shiftMultiselect"
  | "backpack"
  | "trash";

type TooltipMessages = Record<TooltipKey, string>;

const TOOLTIP_STYLE_ID = "blockly-workspace-control-tooltip-style";
const SHIFT_HINT_WIDTH = 42;
const SHIFT_HINT_HEIGHT = 42;
const SHIFT_HINT_MARGIN = 20;
const SHIFT_HINT_WEIGHT = 4;

const CONTROL_TARGETS: Array<{ selector: string; key: TooltipKey }> = [
  { selector: ".blocklyShiftMultiselectHint", key: "shiftMultiselect" },
  { selector: ".blocklyBackpack", key: "backpack" },
  { selector: ".blocklyTrash", key: "trash" },
];

const TOOLTIP_MESSAGES: Record<SupportedLanguage, TooltipMessages> = {
  "zh-CN": {
    shiftMultiselect: "按住 Shift 框选或点击块进行多选。",
    backpack: "背包：临时保存和复用块。",
    trash: "垃圾桶：拖入块可删除。",
  },
  "zh-TW": {
    shiftMultiselect: "按住 Shift 框選或點擊積木進行多選。",
    backpack: "背包：暫時保存並重複使用積木。",
    trash: "垃圾桶：拖入積木可刪除。",
  },
  "en-US": {
    shiftMultiselect: "Hold Shift to box-select or click blocks.",
    backpack: "Backpack: save blocks for reuse.",
    trash: "Trash: drag blocks here to delete.",
  },
  "ja-JP": {
    shiftMultiselect: "Shift を押しながら範囲選択またはクリックします。",
    backpack: "バックパック：ブロックを保存して再利用します。",
    trash: "ゴミ箱：ブロックをドラッグして削除します。",
  },
  "th-TH": {
    shiftMultiselect: "กด Shift ค้างเพื่อลากกรอบหรือคลิกเลือกหลายบล็อก",
    backpack: "กระเป๋า: เก็บบล็อกไว้ใช้ซ้ำ",
    trash: "ถังขยะ: ลากบล็อกมาที่นี่เพื่อลบ",
  },
};

export function createWorkspaceControlHints(
  workspace: Blockly.WorkspaceSvg,
  blocklyDiv: HTMLElement
): DisposablePlugin {
  ensureTooltipStyle();

  const language = resolveLanguage();
  const messages = TOOLTIP_MESSAGES[language];
  const shiftHint = new ShiftMultiselectHint(workspace, messages.shiftMultiselect);
  const tooltipController = new WorkspaceControlTooltipController(
    blocklyDiv.parentElement || blocklyDiv,
    messages
  );

  shiftHint.init();
  tooltipController.init();

  return {
    dispose: () => {
      tooltipController.dispose();
      shiftHint.dispose();
    },
  };
}

class ShiftMultiselectHint implements Blockly.IPositionable {
  id = "shiftMultiselectHint";

  private svgGroup: SVGElement | null = null;
  private initialized = false;
  private left = 0;
  private top = 0;
  private readonly boundEvents: Array<{
    type: string;
    listener: EventListener;
  }> = [];

  constructor(
    private readonly workspace: Blockly.WorkspaceSvg,
    private readonly label: string
  ) {}

  init(): void {
    this.workspace.getParentSvg().appendChild(this.createDom());
    this.workspace.getComponentManager().addComponent({
      component: this,
      weight: SHIFT_HINT_WEIGHT,
      capabilities: [Blockly.ComponentManager.Capability.POSITIONABLE],
    });
    this.initialized = true;
    this.workspace.resize();
  }

  dispose(): void {
    this.workspace.getComponentManager().removeComponent(this.id);
    for (const event of this.boundEvents) {
      this.svgGroup?.removeEventListener(event.type, event.listener);
    }
    this.boundEvents.length = 0;
    this.svgGroup?.remove();
    this.svgGroup = null;
  }

  getBoundingRectangle(): Blockly.utils.Rect {
    return new Blockly.utils.Rect(
      this.top,
      this.top + SHIFT_HINT_HEIGHT,
      this.left,
      this.left + SHIFT_HINT_WIDTH
    );
  }

  position(
    metrics: Blockly.MetricsManager.UiMetrics,
    savedPositions: Blockly.utils.Rect[]
  ): void {
    if (!this.initialized) return;

    const cornerPosition = Blockly.uiPosition.getCornerOppositeToolbox(
      this.workspace,
      metrics
    );
    const startRect = Blockly.uiPosition.getStartPositionRect(
      cornerPosition,
      new Blockly.utils.Size(SHIFT_HINT_WIDTH, SHIFT_HINT_HEIGHT),
      SHIFT_HINT_MARGIN,
      SHIFT_HINT_MARGIN,
      metrics,
      this.workspace
    );
    const bumpDirection =
      cornerPosition.vertical === Blockly.uiPosition.verticalPosition.TOP
        ? Blockly.uiPosition.bumpDirection.DOWN
        : Blockly.uiPosition.bumpDirection.UP;
    const positionRect = Blockly.uiPosition.bumpPositionRect(
      startRect,
      SHIFT_HINT_MARGIN,
      bumpDirection,
      savedPositions
    );

    this.top = positionRect.top;
    this.left = positionRect.left;
    this.svgGroup?.setAttribute(
      "transform",
      `translate(${this.left},${this.top})`
    );
  }

  private createDom(): SVGElement {
    this.svgGroup = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {
        "class": "blocklyShiftMultiselectHint",
        "aria-label": this.label,
        "data-blockly-control-tooltip": "shiftMultiselect",
        "role": "img",
      },
      null
    );

    Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        "class": "blocklyShiftMultiselectHintHitArea",
        "width": SHIFT_HINT_WIDTH,
        "height": SHIFT_HINT_HEIGHT,
      },
      this.svgGroup
    );
    Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        "class": "blocklyShiftMultiselectHintSelection back",
        "x": 10,
        "y": 9,
        "width": 17,
        "height": 17,
        "rx": 3.5,
      },
      this.svgGroup
    );
    Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        "class": "blocklyShiftMultiselectHintSelection front",
        "x": 16,
        "y": 15,
        "width": 17,
        "height": 17,
        "rx": 3.5,
      },
      this.svgGroup
    );

    this.bindPassiveEvent("pointerdown");
    this.bindPassiveEvent("mousedown");
    this.bindPassiveEvent("click");
    return this.svgGroup;
  }

  private bindPassiveEvent(type: string): void {
    const listener = (event: Event): void => {
      event.preventDefault();
      event.stopPropagation();
    };
    this.svgGroup?.addEventListener(type, listener);
    this.boundEvents.push({ type, listener });
  }
}

class WorkspaceControlTooltipController {
  private tooltipElement: HTMLDivElement | null = null;
  private activeElement: Element | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly messages: TooltipMessages
  ) {}

  init(): void {
    this.tooltipElement = document.createElement("div");
    this.tooltipElement.className = "blockly-control-tooltip";
    this.tooltipElement.setAttribute("role", "tooltip");
    this.container.appendChild(this.tooltipElement);

    this.container.addEventListener("pointerover", this.onPointerOver, true);
    this.container.addEventListener("pointerout", this.onPointerOut, true);
    this.container.addEventListener("focusin", this.onFocusIn, true);
    this.container.addEventListener("focusout", this.onFocusOut, true);
  }

  dispose(): void {
    this.container.removeEventListener("pointerover", this.onPointerOver, true);
    this.container.removeEventListener("pointerout", this.onPointerOut, true);
    this.container.removeEventListener("focusin", this.onFocusIn, true);
    this.container.removeEventListener("focusout", this.onFocusOut, true);
    this.tooltipElement?.remove();
    this.tooltipElement = null;
    this.activeElement = null;
  }

  private readonly onPointerOver = (event: PointerEvent): void => {
    const match = this.findTooltipTarget(event.target);
    if (!match || match.element === this.activeElement) return;

    this.show(match.element, this.messages[match.key]);
  };

  private readonly onPointerOut = (event: PointerEvent): void => {
    if (!this.activeElement) return;
    if (
      event.relatedTarget instanceof Node &&
      this.activeElement.contains(event.relatedTarget)
    ) {
      return;
    }
    this.hide();
  };

  private readonly onFocusIn = (event: FocusEvent): void => {
    const match = this.findTooltipTarget(event.target);
    if (!match) return;

    this.show(match.element, this.messages[match.key]);
  };

  private readonly onFocusOut = (): void => {
    this.hide();
  };

  private show(element: Element, text: string): void {
    if (!this.tooltipElement) return;

    this.activeElement = element;
    this.tooltipElement.textContent = text;
    this.positionTooltip(element);
    this.tooltipElement.classList.add("visible");
  }

  private hide(): void {
    this.tooltipElement?.classList.remove("visible");
    this.activeElement = null;
  }

  private positionTooltip(element: Element): void {
    if (!this.tooltipElement) return;

    const containerRect = this.container.getBoundingClientRect();
    const targetRect = element.getBoundingClientRect();
    const top = clamp(
      targetRect.top - containerRect.top + targetRect.height / 2,
      12,
      Math.max(12, containerRect.height - 12)
    );
    const left = targetRect.left - containerRect.left - 12;

    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
  }

  private findTooltipTarget(
    target: EventTarget | null
  ): { element: Element; key: TooltipKey } | null {
    if (!(target instanceof Element)) return null;

    for (const item of CONTROL_TARGETS) {
      const element = target.closest(item.selector);
      if (element && this.container.contains(element)) {
        return { element, key: item.key };
      }
    }

    return null;
  }

}

function resolveLanguage(): SupportedLanguage {
  const language = new URLSearchParams(window.location.search).get("language");
  const supportedLanguages = Object.keys(
    TOOLTIP_MESSAGES
  ) as SupportedLanguage[];
  return (
    supportedLanguages.find((item) => language?.includes(item)) ||
    "zh-CN"
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function ensureTooltipStyle(): void {
  if (document.getElementById(TOOLTIP_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = TOOLTIP_STYLE_ID;
  style.textContent = `
.blocklyShiftMultiselectHint {
  cursor: help;
}

.blocklyShiftMultiselectHintHitArea {
  fill: transparent;
  stroke: none;
}

.blocklyShiftMultiselectHintSelection {
  fill: none;
  stroke: #8fa6c4;
  stroke-width: 2.4;
}

.blocklyShiftMultiselectHintSelection.back {
  opacity: 0.72;
}

.blocklyShiftMultiselectHintSelection.front {
  stroke: #6f8db7;
}

.blocklyShiftMultiselectHint:hover .blocklyShiftMultiselectHintSelection {
  stroke: #0284c7;
}

.blockly-control-tooltip {
  position: absolute;
  z-index: 140;
  max-width: 300px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.92);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
  color: #fff;
  font: 12px/1.45 "PingFang SC", "Microsoft YaHei", sans-serif;
  opacity: 0;
  pointer-events: none;
  transform: translate(-100%, -50%) translateX(-10px);
  transition: opacity 0.14s ease;
  white-space: normal;
}

.blockly-control-tooltip.visible {
  opacity: 1;
}

.blockly-control-tooltip::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -5px;
  width: 10px;
  height: 10px;
  background: rgba(15, 23, 42, 0.92);
  transform: translateY(-50%) rotate(45deg);
}
`;
  document.head.appendChild(style);
}
