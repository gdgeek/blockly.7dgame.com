export interface SaveSnapshot {
  saveId: string;
}

export interface PersistedCodeSnapshot {
  js: string;
  lua: string;
}

export interface SaveSettlement<TSnapshot extends SaveSnapshot> {
  matched: boolean;
  snapshot: TSnapshot | null;
  hadQueuedSave: boolean;
}

/**
 * Keeps at most one save in flight and coalesces any number of additional save
 * requests into one queued retry.
 */
export class SaveCoordinator<TSnapshot extends SaveSnapshot> {
  private pendingSnapshot: TSnapshot | null = null;
  private queuedSave = false;

  get pending(): TSnapshot | null {
    return this.pendingSnapshot;
  }

  get hasPending(): boolean {
    return this.pendingSnapshot !== null;
  }

  get hasQueuedSave(): boolean {
    return this.queuedSave;
  }

  queueIfPending(): boolean {
    if (!this.pendingSnapshot) return false;
    this.queuedSave = true;
    return true;
  }

  begin(snapshot: TSnapshot): boolean {
    if (this.pendingSnapshot) {
      this.queuedSave = true;
      return false;
    }
    this.pendingSnapshot = snapshot;
    return true;
  }

  settle(saveId: string): SaveSettlement<TSnapshot> {
    if (!this.pendingSnapshot || this.pendingSnapshot.saveId !== saveId) {
      return {
        matched: false,
        snapshot: null,
        hadQueuedSave: false,
      };
    }

    const snapshot = this.pendingSnapshot;
    const hadQueuedSave = this.queuedSave;
    this.pendingSnapshot = null;
    this.queuedSave = false;
    return { matched: true, snapshot, hadQueuedSave };
  }

  reset(): void {
    this.pendingSnapshot = null;
    this.queuedSave = false;
  }
}

/**
 * Blockly JSON is expected to be structured-cloneable. The JSON fallback keeps
 * older browsers working while still guaranteeing an independent object graph.
 */
export function cloneWorkspaceValue<T>(value: T): T {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      // Fall through to JSON for older structured-clone implementations.
    }
  }

  const serialized = JSON.stringify(value);
  if (serialized === undefined) return value;
  return JSON.parse(serialized) as T;
}

export function prepareWorkspaceInitData<T>(
  value: T,
  upgrade: (upgradeInput: T) => T
): { baseline: T; loadData: T } {
  const baseline = cloneWorkspaceValue(value);
  const upgradeInput = cloneWorkspaceValue(value);
  return {
    baseline,
    loadData: upgrade(upgradeInput),
  };
}

export function hasPersistedChanges(
  currentData: unknown,
  currentCode: PersistedCodeSnapshot,
  baselineData: unknown,
  persistedCode: PersistedCodeSnapshot
): boolean {
  return (
    JSON.stringify(currentData) !== JSON.stringify(baselineData) ||
    currentCode.js !== persistedCode.js ||
    currentCode.lua !== persistedCode.lua
  );
}
