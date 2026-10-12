import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentPublicInstance } from "vue";

const mocks = vi.hoisted(() => {
  const workspace = {
    addChangeListener: vi.fn(),
    removeChangeListener: vi.fn(),
    centerOnBlock: vi.fn(),
    dispose: vi.fn(),
    getAllBlocks: vi.fn(() => []),
  };

  return {
    workspace,
    handlers: new Map<
      string,
      (payload: unknown, message?: { id: string }) => void
    >(),
    postMessage: vi.fn(),
    postResponse: vi.fn(),
    saveWorkspace: vi.fn(),
    loadWorkspaceForInit: vi.fn(),
    watchWorkspaceReady: vi.fn(),
    generateAllSafely: vi.fn(),
    validationWarnings: [] as Array<{
      code: string;
      severity: "warning";
      message: string;
    }>,
    showWarnings: vi.fn(),
  };
});

vi.mock("@/blocks/stocks", () => ({}));

vi.mock("@/components/BlocklyComponent.vue", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    default: defineComponent({
      name: "BlocklyComponent",
      setup(_props, { expose }) {
        expose({ workspace: mocks.workspace });
        return () => h("div", { "data-test": "mock-blockly" });
      },
    }),
  };
});

vi.mock("@/composables/useMessageBridge", () => ({
  useMessageBridge: () => ({
    postMessage: mocks.postMessage,
    postResponse: mocks.postResponse,
    onMessage: (
      type: string,
      handler: (payload: unknown, message?: { id: string }) => void
    ) => mocks.handlers.set(type, handler),
  }),
}));

vi.mock("@/composables/useCodeGenerator", () => ({
  useCodeGenerator: () => ({
    generateAllSafely: mocks.generateAllSafely,
  }),
}));

vi.mock("@/composables/useToolboxSetup", () => ({
  useToolboxSetup: () => ({
    buildOptions: vi.fn(() => ({ media: "media/", toolbox: {} })),
  }),
}));

vi.mock("@/composables/useWorkspace", () => ({
  useWorkspace: () => ({
    cancelWorkspaceReadyWatch: vi.fn(),
    saveWorkspace: mocks.saveWorkspace,
    loadWorkspaceForInit: mocks.loadWorkspaceForInit,
    watchWorkspaceReady: mocks.watchWorkspaceReady,
  }),
}));

vi.mock("@/composables/useTheme", async () => {
  const { ref } = await import("vue");
  return {
    useTheme: () => ({
      setDark: vi.fn(),
      isDark: ref(false),
    }),
  };
});

vi.mock("@/utils/workspaceValidation", () => ({
  clearTrackedWorkspaceValidationFeedback: vi.fn(),
  validateWorkspaceForSave: () => ({
    ok: true,
    warnings: mocks.validationWarnings,
  }),
  showWorkspaceValidationWarnings: mocks.showWarnings,
  serializeWorkspaceWarnings: (warnings: unknown[]) => warnings,
}));

import App from "@/App.vue";

interface InitOverrides {
  code?: { js?: string; lua?: string };
  data?: Record<string, unknown>;
  hostSessionId?: string;
  editingBaseline?: Record<string, unknown>;
  persisted?: {
    data?: Record<string, unknown>;
    code?: { js?: string; lua?: string };
  };
}

const successfulGeneration = (js = "freshJs();", lua = "fresh_lua()") => ({
  generated: { js, lua },
  warnings: [],
});

const generationFailure = (
  language: "javascript" | "lua",
  generated: { js: string; lua: string }
) => ({
  generated,
  warnings: [
    {
      code: "code-generation-failed" as const,
      language,
      message: `${language} generator crashed`,
    },
  ],
});

async function mountInitializedApp(
  overrides: InitOverrides = {}
): Promise<VueWrapper<ComponentPublicInstance>> {
  const wrapper = mount(App);
  const init = mocks.handlers.get("INIT");
  expect(init).toBeDefined();
  init?.({
    config: {
      style: "base meta",
      parameters: {},
      data: overrides.data ?? { blocks: { blocks: [] } },
      userInfo: {},
      ...(overrides.code === undefined ? {} : { code: overrides.code }),
      ...(overrides.hostSessionId === undefined
        ? {}
        : { hostSessionId: overrides.hostSessionId }),
      ...(overrides.editingBaseline === undefined
        ? {}
        : { editingBaseline: overrides.editingBaseline }),
      ...(overrides.persisted === undefined
        ? {}
        : { persisted: overrides.persisted }),
    },
  });
  await flushPromises();
  return wrapper;
}

function requestSave(hostSessionId?: string): void {
  const request = mocks.handlers.get("REQUEST");
  expect(request).toBeDefined();
  request?.({
    action: "save",
    ...(hostSessionId === undefined ? {} : { hostSessionId }),
  });
}

function requestSaveShortcut(): void {
  const shortcut = mocks.handlers.get("SAVE_SHORTCUT");
  expect(shortcut).toBeDefined();
  shortcut?.(undefined);
}

function responsePayloads(): Array<Record<string, unknown>> {
  return mocks.postResponse.mock.calls.map(
    ([payload]) => payload as Record<string, unknown>
  );
}

function lastResponse(): Record<string, unknown> {
  const payloads = responsePayloads();
  return payloads[payloads.length - 1] ?? {};
}

describe("App save orchestration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.handlers.clear();
    mocks.postMessage.mockReset();
    mocks.postResponse.mockReset();
    mocks.saveWorkspace.mockReset();
    mocks.loadWorkspaceForInit.mockReset();
    mocks.watchWorkspaceReady.mockReset();
    mocks.watchWorkspaceReady.mockImplementation(
      (
        _editor: unknown,
        _data: unknown,
        onReady: (workspace: typeof mocks.workspace) => void
      ) => onReady(mocks.workspace)
    );
    mocks.generateAllSafely.mockReset();
    mocks.showWarnings.mockReset();
    mocks.workspace.addChangeListener.mockReset();
    mocks.workspace.removeChangeListener.mockReset();
    mocks.workspace.centerOnBlock.mockReset();
    mocks.workspace.dispose.mockReset();
    mocks.validationWarnings.length = 0;
    mocks.saveWorkspace.mockReturnValue({ blocks: { blocks: [] } });
    mocks.generateAllSafely.mockReturnValue(successfulGeneration());
  });

  afterEach(() => {
    mocks.handlers.get("DESTROY")?.(undefined);
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("saves validation violations as warnings instead of blocking", async () => {
    mocks.validationWarnings.push({
      code: "javascript-syntax-error",
      severity: "warning",
      message: "Unexpected string",
    });
    const wrapper = await mountInitializedApp({
      code: { js: "oldJs();", lua: "old_lua()" },
    });
    mocks.postResponse.mockClear();

    requestSave();

    expect(lastResponse()).toMatchObject({
      action: "save",
      js: "freshJs();",
      lua: "fresh_lua()",
      warnings: [
        expect.objectContaining({
          code: "javascript-syntax-error",
          severity: "warning",
        }),
      ],
    });
    expect(lastResponse().action).not.toBe("save-error");
    wrapper.unmount();
  });

  it("reports initial dirty state from the confirmed persisted baseline", async () => {
    const baselineData = { blocks: { blocks: [{ id: "persisted" }] } };
    const draftData = { blocks: { blocks: [{ id: "draft" }] } };
    mocks.saveWorkspace
      .mockReturnValueOnce(baselineData)
      .mockReturnValue(draftData);
    mocks.generateAllSafely.mockReturnValue(
      successfulGeneration("sameJs();", "same_lua()")
    );

    const wrapper = await mountInitializedApp({
      data: draftData,
      hostSessionId: "session-draft",
      persisted: {
        data: baselineData,
        code: { js: "sameJs();", lua: "same_lua()" },
      },
    });

    expect(mocks.postMessage).toHaveBeenCalledWith(
      "EVENT",
      expect.objectContaining({
        event: "update",
        dirty: true,
        editorDirty: true,
        editingBaseline: baselineData,
        hostSessionId: "session-draft",
        workspaceRevision: 0,
      })
    );
    mocks.postResponse.mockClear();

    requestSave("session-draft");

    expect(lastResponse()).toMatchObject({
      action: "save",
      data: draftData,
      dirty: true,
      editorDirty: true,
      hostSessionId: "session-draft",
    });
    expect(lastResponse().noChange).not.toBe(true);
    wrapper.unmount();
  });

  it("reports a clean initial update for the confirmed persisted snapshot", async () => {
    const baselineData = { blocks: { blocks: [{ id: "persisted" }] } };
    mocks.saveWorkspace.mockReturnValue(baselineData);
    mocks.generateAllSafely.mockReturnValue(
      successfulGeneration("sameJs();", "same_lua()")
    );

    const wrapper = await mountInitializedApp({
      data: baselineData,
      hostSessionId: "session-initial-clean",
      persisted: {
        data: baselineData,
        code: { js: "sameJs();", lua: "same_lua()" },
      },
    });

    expect(mocks.postMessage).toHaveBeenCalledWith(
      "EVENT",
      expect.objectContaining({
        event: "update",
        dirty: false,
        editorDirty: false,
        editingBaseline: baselineData,
        blocklyData: baselineData,
        hostSessionId: "session-initial-clean",
        workspaceRevision: 0,
      })
    );
    wrapper.unmount();
  });

  it("opens migrated data clean for editing and persists migrations only on explicit save", async () => {
    const persistedData = {};
    const normalizedData = { backpack: [] };
    mocks.saveWorkspace.mockReturnValue(normalizedData);
    const wrapper = await mountInitializedApp({
      data: persistedData,
      code: { js: "oldJs();", lua: "old_lua()" },
    });

    expect(mocks.watchWorkspaceReady).toHaveBeenCalledOnce();
    expect(mocks.loadWorkspaceForInit).not.toHaveBeenCalled();
    expect(mocks.postResponse).not.toHaveBeenCalled();
    expect(mocks.postMessage).toHaveBeenCalledWith(
      "EVENT",
      expect.objectContaining({
        event: "update",
        blocklyData: normalizedData,
        editingBaseline: normalizedData,
        dirty: true,
        editorDirty: false,
      })
    );

    requestSave();
    expect(lastResponse()).toMatchObject({
      action: "save",
      data: normalizedData,
      dirty: true,
      editorDirty: false,
    });
    mocks.postMessage.mockClear();
    mocks.handlers.get("SAVE_ACK")?.({ saveId: lastResponse().saveId });
    expect(mocks.postMessage).toHaveBeenCalledWith(
      "EVENT",
      expect.objectContaining({
        dirty: false,
        editorDirty: false,
      })
    );
    wrapper.unmount();
  });

  it("keeps regenerated code changes outside the user editing indicator", async () => {
    const wrapper = await mountInitializedApp({
      code: { js: "oldJs();", lua: "old_lua()" },
    });
    expect(mocks.postMessage).toHaveBeenCalledWith(
      "EVENT",
      expect.objectContaining({
        dirty: true,
        editorDirty: false,
      })
    );
    wrapper.unmount();
  });

  it("reuses a cached normalized baseline instead of loading persisted data with new IDs", async () => {
    const persistedData = { blocks: { blocks: [{ id: "legacy" }] } };
    const cachedBaseline = {
      blocks: { blocks: [{ id: "legacy", shadowId: "stable-shadow" }] },
    };
    mocks.saveWorkspace.mockReturnValue(cachedBaseline);
    const wrapper = await mountInitializedApp({
      data: cachedBaseline,
      editingBaseline: cachedBaseline,
      persisted: {
        data: persistedData,
        code: { js: "freshJs();", lua: "fresh_lua()" },
      },
    });
    expect(mocks.watchWorkspaceReady.mock.calls[0]?.[1]).toEqual(
      cachedBaseline
    );
    expect(mocks.loadWorkspaceForInit).not.toHaveBeenCalled();
    expect(mocks.saveWorkspace).toHaveBeenCalledOnce();
    expect(mocks.postMessage).toHaveBeenCalledWith(
      "EVENT",
      expect.objectContaining({
        editingBaseline: cachedBaseline,
        dirty: true,
        editorDirty: false,
      })
    );
    wrapper.unmount();
  });

  it("normalizes persisted data before restoring a draft when no cached baseline exists", async () => {
    const persistedData = { blocks: { blocks: [{ id: "original" }] } };
    const normalizedData = { ...persistedData, backpack: [] };
    const draftData = { blocks: { blocks: [{ id: "edited" }] }, backpack: [] };
    mocks.saveWorkspace
      .mockReturnValueOnce(normalizedData)
      .mockReturnValue(draftData);
    const wrapper = await mountInitializedApp({
      data: draftData,
      persisted: {
        data: persistedData,
        code: { js: "freshJs();", lua: "fresh_lua()" },
      },
    });
    expect(mocks.watchWorkspaceReady.mock.calls[0]?.[1]).toEqual(persistedData);
    expect(mocks.loadWorkspaceForInit).toHaveBeenCalledWith(
      draftData,
      mocks.workspace
    );
    expect(mocks.postMessage).toHaveBeenCalledWith(
      "EVENT",
      expect.objectContaining({
        editingBaseline: normalizedData,
        dirty: true,
        editorDirty: true,
      })
    );
    wrapper.unmount();
  });

  it("treats equivalent draft object key order as the same initial workspace", async () => {
    const persistedData = { blocks: { blocks: [] }, backpack: [] };
    const draftData = { backpack: [], blocks: { blocks: [] } };
    mocks.saveWorkspace.mockReturnValue(draftData);
    const wrapper = await mountInitializedApp({
      data: draftData,
      persisted: {
        data: persistedData,
        code: { js: "freshJs();", lua: "fresh_lua()" },
      },
    });
    expect(mocks.loadWorkspaceForInit).not.toHaveBeenCalled();
    expect(mocks.postMessage).toHaveBeenCalledWith(
      "EVENT",
      expect.objectContaining({
        dirty: false,
        editorDirty: false,
      })
    );
    wrapper.unmount();
  });

  it.each(["NACK", "stale ACK"])(
    "does not advance either baseline after %s",
    async (settlement) => {
      const baselineData = { blocks: { blocks: [{ id: "original" }] } };
      const draftData = { blocks: { blocks: [{ id: "edited" }] } };
      mocks.saveWorkspace.mockReturnValue(draftData);
      const wrapper = await mountInitializedApp({
        data: draftData,
        editingBaseline: baselineData,
        persisted: {
          data: baselineData,
          code: { js: "oldJs();", lua: "old_lua()" },
        },
      });
      requestSave();
      const saveId = lastResponse().saveId;
      if (settlement === "NACK") {
        mocks.handlers.get("SAVE_NACK")?.({ saveId });
      } else {
        mocks.handlers.get("SAVE_ACK")?.({ saveId: "stale-save" });
        vi.advanceTimersByTime(30_000);
      }
      requestSave();
      expect(lastResponse()).toMatchObject({ dirty: true, editorDirty: true });
      expect(lastResponse().saveId).not.toBe(saveId);
      wrapper.unmount();
    }
  );

  it("rebases a noChange result to its exact server-confirmed data", async () => {
    const persistedData = { blocks: { blocks: [{ id: "persisted" }] } };
    const cachedBaseline = {
      blocks: { blocks: [{ id: "earlier-editing-baseline" }] },
    };
    mocks.saveWorkspace.mockReturnValue(persistedData);
    const wrapper = await mountInitializedApp({
      data: persistedData,
      editingBaseline: cachedBaseline,
      code: { js: "freshJs();", lua: "fresh_lua()" },
    });
    expect(mocks.postMessage).toHaveBeenCalledWith(
      "EVENT",
      expect.objectContaining({
        dirty: false,
        editorDirty: true,
      })
    );
    requestSave();
    expect(lastResponse()).toMatchObject({
      noChange: true,
      dirty: false,
      editorDirty: false,
    });
    wrapper.unmount();
  });

  it.each(["baseline capture", "draft load", "first snapshot"])(
    "does not publish readiness or allow saving after failed %s",
    async (failure) => {
      const persistedData = { blocks: { blocks: [{ id: "persisted" }] } };
      const draftData = { blocks: { blocks: [{ id: "draft" }] } };
      if (failure === "baseline capture") {
        mocks.saveWorkspace.mockImplementation(() => {
          throw new Error("baseline failed");
        });
      } else if (failure === "draft load") {
        mocks.loadWorkspaceForInit.mockImplementation(() => {
          throw new Error("draft failed");
        });
      } else {
        mocks.saveWorkspace
          .mockReturnValueOnce(persistedData)
          .mockImplementation(() => {
            throw new Error("snapshot failed");
          });
      }
      const wrapper = await mountInitializedApp({
        data: draftData,
        persisted: { data: persistedData },
      });
      expect(mocks.postMessage).toHaveBeenCalledWith(
        "EVENT",
        expect.objectContaining({ event: "error" })
      );
      expect(mocks.postMessage.mock.calls).not.toContainEqual([
        "EVENT",
        expect.objectContaining({ event: "update" }),
      ]);
      expect(mocks.workspace.addChangeListener).not.toHaveBeenCalled();
      requestSave();
      expect(lastResponse()).toMatchObject({
        action: "save-error",
        message: expect.stringContaining("尚未就绪"),
      });
      wrapper.unmount();
    }
  );

  it("returns the exact compared snapshot when save has no changes", async () => {
    const baselineData = { blocks: { blocks: [{ id: "persisted" }] } };
    mocks.saveWorkspace.mockReturnValue(baselineData);
    mocks.generateAllSafely.mockReturnValue(
      successfulGeneration("sameJs();", "same_lua()")
    );
    const wrapper = await mountInitializedApp({
      data: baselineData,
      hostSessionId: "session-clean",
      persisted: {
        data: baselineData,
        code: { js: "sameJs();", lua: "same_lua()" },
      },
    });
    mocks.postResponse.mockClear();

    requestSave("session-clean");

    expect(lastResponse()).toMatchObject({
      action: "save",
      noChange: true,
      data: baselineData,
      js: "sameJs();",
      lua: "same_lua()",
      dirty: false,
      hostSessionId: "session-clean",
      workspaceRevision: 0,
    });
    wrapper.unmount();
  });

  it("merges a partial persisted code baseline with legacy INIT code", async () => {
    const baselineData = { blocks: { blocks: [{ id: "persisted" }] } };
    mocks.saveWorkspace.mockReturnValue(baselineData);
    mocks.generateAllSafely.mockReturnValue(
      successfulGeneration("persistedJs();", "legacy_lua()")
    );
    const wrapper = await mountInitializedApp({
      data: baselineData,
      code: { js: "legacyJs();", lua: "legacy_lua()" },
      persisted: {
        data: baselineData,
        code: { js: "persistedJs();" },
      },
    });
    mocks.postResponse.mockClear();

    requestSave();

    expect(lastResponse()).toMatchObject({
      action: "save",
      noChange: true,
      dirty: false,
    });
    wrapper.unmount();
  });

  it("allows a generator warning when INIT supplied a historical fallback", async () => {
    mocks.generateAllSafely.mockReturnValue(
      generationFailure("javascript", {
        js: "historicalJs();",
        lua: "fresh_lua()",
      })
    );
    const wrapper = await mountInitializedApp({
      code: { js: "historicalJs();", lua: "historical_lua()" },
    });
    mocks.postResponse.mockClear();

    requestSave();

    expect(lastResponse()).toMatchObject({
      action: "save",
      js: "historicalJs();",
      lua: "fresh_lua()",
      warnings: [
        expect.objectContaining({
          code: "code-generation-failed",
          language: "javascript",
        }),
      ],
    });
    wrapper.unmount();
  });

  it("does not overwrite unknown legacy code with an empty fallback after a generator crash", async () => {
    mocks.generateAllSafely.mockReturnValue(
      generationFailure("javascript", { js: "", lua: "fresh_lua()" })
    );
    const wrapper = await mountInitializedApp();
    mocks.postResponse.mockClear();

    requestSave();

    expect(lastResponse()).toMatchObject({
      action: "save-error",
      error: true,
      errorCode: "missing-generated-code-fallback",
      message: expect.stringContaining("避免用空代码覆盖"),
      warnings: [
        expect.objectContaining({
          code: "code-generation-failed",
          language: "javascript",
        }),
      ],
    });
    expect(responsePayloads()).not.toContainEqual(
      expect.objectContaining({ action: "save", js: "" })
    );
    wrapper.unmount();
  });

  it("answers a queued request with noChange after ACK", async () => {
    const wrapper = await mountInitializedApp({
      code: { js: "oldJs();", lua: "old_lua()" },
    });
    mocks.postResponse.mockClear();

    requestSave();
    const first = lastResponse();
    requestSave();
    expect(responsePayloads()).toHaveLength(1);

    mocks.handlers.get("SAVE_ACK")?.({ saveId: first.saveId });

    expect(responsePayloads()).toHaveLength(2);
    expect(lastResponse()).toMatchObject({ action: "save", noChange: true });
    vi.advanceTimersByTime(30_000);
    expect(responsePayloads()).toHaveLength(2);
    wrapper.unmount();
  });

  it("answers every queued save with its captured request ID after ACK", async () => {
    const wrapper = await mountInitializedApp({
      code: { js: "oldJs();", lua: "old_lua()" },
    });
    mocks.postResponse.mockClear();
    const request = mocks.handlers.get("REQUEST")!;
    request({ action: "save" }, { id: "save-a" });
    const first = lastResponse();
    request({ action: "save" }, { id: "save-b" });
    request({ action: "save" }, { id: "save-c" });
    mocks.handlers.get("SAVE_ACK")?.({ saveId: first.saveId });
    expect(mocks.postResponse.mock.calls.map((call) => call[1])).toEqual([
      "save-a",
      "save-b",
      "save-c",
    ]);
    expect(responsePayloads().slice(1)).toEqual([
      expect.objectContaining({ noChange: true }),
      expect.objectContaining({ noChange: true }),
    ]);
    wrapper.unmount();
  });

  it("keeps a newer workspace revision dirty when ACK confirms an older save", async () => {
    const firstData = { blocks: { blocks: [{ id: "first" }] } };
    const secondData = { blocks: { blocks: [{ id: "second" }] } };
    mocks.saveWorkspace.mockReturnValue(firstData);
    mocks.generateAllSafely.mockReturnValue(
      successfulGeneration("firstJs();", "first_lua()")
    );
    const wrapper = await mountInitializedApp({
      data: firstData,
      editingBaseline: { blocks: { blocks: [] } },
      hostSessionId: "session-race",
      persisted: {
        data: { blocks: { blocks: [] } },
        code: { js: "", lua: "" },
      },
    });
    mocks.postMessage.mockClear();
    mocks.postResponse.mockClear();

    requestSave("session-race");
    const firstSaveId = lastResponse().saveId as string;

    mocks.saveWorkspace.mockReturnValue(secondData);
    mocks.generateAllSafely.mockReturnValue(
      successfulGeneration("secondJs();", "second_lua()")
    );
    const listener = mocks.workspace.addChangeListener.mock.calls[0]?.[0] as
      ((event: Record<string, unknown>) => void) | undefined;
    expect(listener).toBeDefined();
    listener?.({ type: "change", element: "field" });

    mocks.handlers.get("SAVE_ACK")?.({
      saveId: firstSaveId,
      hostSessionId: "session-race",
    });

    const eventCalls = mocks.postMessage.mock.calls.filter(
      ([type]) => type === "EVENT"
    );
    const latestUpdate = eventCalls[eventCalls.length - 1]?.[1] as Record<
      string,
      unknown
    >;
    expect(latestUpdate).toMatchObject({
      event: "update",
      dirty: true,
      editorDirty: true,
      js: "secondJs();",
      blocklyData: secondData,
      hostSessionId: "session-race",
      workspaceRevision: 1,
    });
    expect(latestUpdate).not.toHaveProperty("editingBaseline");

    // Returning to the submitted snapshot proves C advanced to that snapshot,
    // rather than keeping the opening baseline or accepting the newer edit.
    mocks.saveWorkspace.mockReturnValue(firstData);
    mocks.generateAllSafely.mockReturnValue(
      successfulGeneration("firstJs();", "first_lua()")
    );
    requestSave("session-race");
    expect(lastResponse()).toMatchObject({
      noChange: true,
      dirty: false,
      editorDirty: false,
    });
    wrapper.unmount();
  });

  it("ignores save messages from a stale host session", async () => {
    const wrapper = await mountInitializedApp({
      hostSessionId: "session-current",
      code: { js: "oldJs();", lua: "old_lua()" },
    });
    mocks.postResponse.mockClear();

    mocks.handlers.get("REQUEST")?.({
      action: "save",
      hostSessionId: "session-stale",
    });

    expect(mocks.postResponse).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("rejects a request that omits the active host session", async () => {
    const wrapper = await mountInitializedApp({
      hostSessionId: "session-current",
      code: { js: "oldJs();", lua: "old_lua()" },
    });
    mocks.postResponse.mockClear();

    requestSave();

    expect(mocks.postResponse).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("asks a session-aware host to initiate Ctrl+S through its save path", async () => {
    const wrapper = await mountInitializedApp({
      hostSessionId: "session-current",
      code: { js: "oldJs();", lua: "old_lua()" },
    });
    mocks.postMessage.mockClear();
    mocks.postResponse.mockClear();

    requestSaveShortcut();

    expect(mocks.postResponse).not.toHaveBeenCalled();
    expect(mocks.postMessage).toHaveBeenCalledWith("EVENT", {
      event: "save-request",
      hostSessionId: "session-current",
    });
    wrapper.unmount();
  });

  it("keeps direct Ctrl+S saves working for a legacy host", async () => {
    const wrapper = await mountInitializedApp({
      code: { js: "oldJs();", lua: "old_lua()" },
    });
    mocks.postResponse.mockClear();

    requestSaveShortcut();

    expect(lastResponse()).toMatchObject({ action: "save" });
    wrapper.unmount();
  });

  it("ignores an ACK that does not identify the active host session", async () => {
    const wrapper = await mountInitializedApp({
      hostSessionId: "session-current",
      persisted: {
        data: { blocks: { blocks: [] } },
        code: { js: "oldJs();", lua: "old_lua()" },
      },
    });
    mocks.postResponse.mockClear();

    requestSave("session-current");
    const firstSaveId = lastResponse().saveId as string;
    mocks.handlers.get("SAVE_ACK")?.({ saveId: firstSaveId });
    requestSave("session-current");

    expect(responsePayloads()).toHaveLength(1);
    wrapper.unmount();
  });

  it("times out an old host, then completes an identical queued request with a safe retry", async () => {
    const wrapper = await mountInitializedApp({
      code: { js: "oldJs();", lua: "old_lua()" },
    });
    mocks.postResponse.mockClear();

    requestSave();
    requestSave();
    vi.advanceTimersByTime(30_000);

    expect(responsePayloads()).toHaveLength(2);
    expect(responsePayloads()[0]).toMatchObject({
      action: "save",
      js: "freshJs();",
    });
    expect(responsePayloads()[1]).toMatchObject({
      action: "save",
      js: "freshJs();",
      lua: "fresh_lua()",
    });
    expect(responsePayloads()[1].saveId).not.toBe(responsePayloads()[0].saveId);
    expect(responsePayloads()[1].noChange).not.toBe(true);
    wrapper.unmount();
  });

  it("completes a queued request after timeout when the workspace returned to the confirmed baseline", async () => {
    const originalData = { blocks: { blocks: [{ id: "original" }] } };
    const changedData = { blocks: { blocks: [{ id: "changed" }] } };
    mocks.saveWorkspace.mockReturnValue(changedData);
    mocks.generateAllSafely.mockReturnValue(
      successfulGeneration("changedJs();", "changed_lua()")
    );
    const wrapper = await mountInitializedApp({
      data: originalData,
      code: { js: "originalJs();", lua: "original_lua()" },
    });
    mocks.postResponse.mockClear();

    requestSave();
    requestSave();
    mocks.saveWorkspace.mockReturnValue(originalData);
    mocks.generateAllSafely.mockReturnValue(
      successfulGeneration("originalJs();", "original_lua()")
    );
    vi.advanceTimersByTime(30_000);

    expect(responsePayloads()).toHaveLength(2);
    expect(responsePayloads()[1]).toMatchObject({
      action: "save",
      noChange: true,
    });
    wrapper.unmount();
  });

  it("retries an unchanged queued snapshot after NACK", async () => {
    const wrapper = await mountInitializedApp({
      code: { js: "oldJs();", lua: "old_lua()" },
    });
    mocks.postResponse.mockClear();

    requestSave();
    const firstSaveId = lastResponse().saveId;
    requestSave();
    mocks.handlers.get("SAVE_NACK")?.({ saveId: firstSaveId });

    expect(responsePayloads()).toHaveLength(2);
    expect(responsePayloads()[1]).toMatchObject({
      action: "save",
      js: "freshJs();",
    });
    expect(responsePayloads()[1].saveId).not.toBe(firstSaveId);
    wrapper.unmount();
  });
});
