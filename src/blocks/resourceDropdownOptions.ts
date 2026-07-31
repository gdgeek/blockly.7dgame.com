import * as Blockly from "blockly";

export type ResourceDropdownOption = [string, string];

export interface ResourceDropdownField {
  getOptions: (useCache?: boolean) => unknown[];
  getValue: () => string | null;
  setValue: (value: string) => void;
  setOptions: (options: ResourceDropdownOption[]) => void;
  forceRerender: () => void;
}

export interface BlockEventLike {
  type: string;
  blockId?: string;
  ids?: string[];
}

const appliedOptions = new WeakMap<
  ResourceDropdownField,
  ResourceDropdownOption[]
>();

function cloneOptions(
  options: readonly ResourceDropdownOption[]
): ResourceDropdownOption[] {
  return options.map(([label, value]) => [label, value]);
}

function optionsEqual(
  first: readonly ResourceDropdownOption[],
  second: readonly ResourceDropdownOption[]
): boolean {
  return (
    first.length === second.length &&
    first.every(
      ([label, value], index) =>
        label === second[index][0] && value === second[index][1]
    )
  );
}

/**
 * Records the options installed by jsonInit before contextual filtering starts.
 * Keeping our own copy avoids comparing Blockly's display-trimmed labels.
 */
export function rememberResourceDropdownOptions(
  field: ResourceDropdownField,
  options: readonly ResourceDropdownOption[]
): void {
  appliedOptions.set(field, cloneOptions(options));
}

/**
 * Applies contextual resource options only when their labels or values changed.
 *
 * Blockly's setOptions resets the field to the first option. If the previous
 * value is still valid, that temporary reset is an implementation detail and
 * must not emit two field-change events. If it is no longer valid, setOptions
 * remains responsible for the single real value-change event.
 */
export function applyResourceDropdownOptions(
  field: ResourceDropdownField,
  options: ResourceDropdownOption[]
): boolean {
  const previousOptions = appliedOptions.get(field);
  if (previousOptions && optionsEqual(previousOptions, options)) {
    return false;
  }

  const nextOptions = cloneOptions(options);
  appliedOptions.set(field, nextOptions);

  try {
    const currentValue = field.getValue();

    if (
      typeof currentValue === "string" &&
      options.some(([, value]) => value === currentValue)
    ) {
      Blockly.Events.disable();
      try {
        field.setOptions(options);
        field.setValue(currentValue);
      } finally {
        Blockly.Events.enable();
      }
    } else {
      field.setOptions(options);
    }

    field.forceRerender();
    return true;
  } catch (error) {
    if (previousOptions) {
      appliedOptions.set(field, previousOptions);
    } else {
      appliedOptions.delete(field);
    }
    throw error;
  }
}

export function isCreateOrMoveEventForBlocks(
  event: BlockEventLike,
  blockIds: Array<string | null | undefined>
): boolean {
  if (
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_MOVE
  ) {
    return false;
  }

  const isRelevantId = (eventBlockId: string): boolean =>
    blockIds.some((blockId) => blockId === eventBlockId);

  if (event.blockId && isRelevantId(event.blockId)) {
    return true;
  }

  return event.ids?.some(isRelevantId) ?? false;
}
