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
    watchWorkspaceReady: (
      _editor: unknown,
      _data: unknown,
      onReady: (workspace: typeof mocks.workspace) => void
    ) => onReady(mocks.workspace),
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
    },
  });
  await flushPromises();
  return wrapper;
}

function requestSave(): void {
  const request = mocks.handlers.get("REQUEST");
  expect(request).toBeDefined();
  request?.({ action: "save" });
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
