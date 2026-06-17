import * as Blockly from "blockly";

type DropdownOption = [string, string];

const EASING_OPTIONS: Array<[string, string, string]> = [
  ["TASK_TWEEN_EASING_LINEAR", "LINEAR", "TASK_TWEEN_EASING_LINEAR_TOOLTIP"],
  ["TASK_TWEEN_EASING_EASE_IN", "EASE_IN", "TASK_TWEEN_EASING_EASE_IN_TOOLTIP"],
  [
    "TASK_TWEEN_EASING_EASE_OUT",
    "EASE_OUT",
    "TASK_TWEEN_EASING_EASE_OUT_TOOLTIP",
  ],
  [
    "TASK_TWEEN_EASING_EASE_IN_OUT",
    "EASE_IN_OUT",
    "TASK_TWEEN_EASING_EASE_IN_OUT_TOOLTIP",
  ],
  [
    "TASK_TWEEN_EASING_BOUNCE_IN",
    "BOUNCE_IN",
    "TASK_TWEEN_EASING_BOUNCE_IN_TOOLTIP",
  ],
  [
    "TASK_TWEEN_EASING_BOUNCE_OUT",
    "BOUNCE_OUT",
    "TASK_TWEEN_EASING_BOUNCE_OUT_TOOLTIP",
  ],
  [
    "TASK_TWEEN_EASING_BOUNCE_IN_OUT",
    "BOUNCE_IN_OUT",
    "TASK_TWEEN_EASING_BOUNCE_IN_OUT_TOOLTIP",
  ],
];

export function getTweenEasingOptions(): DropdownOption[] {
  const messages = Blockly.Msg as unknown as Record<
    string,
    Record<string, string> | string
  >;
  const language = window.lg || "en-US";

  return EASING_OPTIONS.map(([messageKey, value]) => [
    getLocalizedLabel(messages, messageKey, language, value),
    value,
  ]);
}

export function getTweenEasingTooltip(value: string): string {
  const messages = Blockly.Msg as unknown as Record<
    string,
    Record<string, string> | string
  >;
  const language = window.lg || "en-US";
  const option = EASING_OPTIONS.find(([, optionValue]) => optionValue === value);
  const label = option
    ? getLocalizedLabel(messages, option[0], language, value)
    : value;
  const detail = option
    ? getLocalizedLabel(messages, option[2], language, "")
    : "";

  return [label, detail].filter(Boolean).join("\n");
}

function getLocalizedLabel(
  messages: Record<string, Record<string, string> | string>,
  messageKey: string,
  language: string,
  fallback: string
): string {
  const message = messages[messageKey];
  if (typeof message === "string") return message;

  return message?.[language] || message?.["en-US"] || fallback;
}
