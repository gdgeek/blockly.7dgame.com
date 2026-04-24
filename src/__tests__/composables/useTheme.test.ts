import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

// Mock blockly/core before importing useTheme
const mockSetTheme = vi.fn();
const mockClassicTheme = {};

vi.mock("blockly/core", () => ({
  default: {
    Theme: {
      defineTheme: (_name: string, opts: unknown) => opts,
    },
    Themes: {
      Classic: mockClassicTheme,
    },
  },
  Theme: {
    defineTheme: (_name: string, opts: unknown) => opts,
  },
  Themes: {
    Classic: mockClassicTheme,
  },
}));

// Track matchMedia listeners so we can simulate system theme changes
let mqlListeners: Array<{
  raw: EventListenerOrEventListenerObject;
  trigger: () => void;
}> = [];
let mqlMatches = false;

beforeEach(() => {
  mqlListeners = [];
  mqlMatches = false;

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: mqlMatches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_event: string, handler: EventListenerOrEventListenerObject) => {
        mqlListeners.push({
          raw: handler,
          trigger: () => {
            const event = new Event("change");
            if (typeof handler === "function") {
              handler(event);
            } else {
              handler.handleEvent(event);
            }
          },
        });
      },
      removeEventListener: (_event: string, handler: EventListenerOrEventListenerObject) => {
        mqlListeners = mqlListeners.filter((h) => h.raw !== handler);
      },
      dispatchEvent: () => false,
    }),
  });

  // Reset module state between tests by clearing the module cache
  vi.resetModules();
  mockSetTheme.mockClear();
});

async function loadUseTheme() {
  const mod = await import("@/composables/useTheme");
  return mod.useTheme();
}

describe("useTheme", () => {
  describe("isDark computed", () => {
    it("follows system preference (light) when forcedDark is null", async () => {
      mqlMatches = false;
      const { isDark } = await loadUseTheme();
      expect(isDark.value).toBe(false);
    });

    it("follows system preference (dark) when forcedDark is null", async () => {
      mqlMatches = true;
      const { isDark } = await loadUseTheme();
      expect(isDark.value).toBe(true);
    });

    it("returns forced value after setDark(true)", async () => {
      mqlMatches = false;
      const { isDark, setDark } = await loadUseTheme();
      expect(isDark.value).toBe(false);

      setDark(true);
      expect(isDark.value).toBe(true);
    });

    it("returns forced value after setDark(false) even when system is dark", async () => {
      mqlMatches = true;
      const { isDark, setDark } = await loadUseTheme();
      expect(isDark.value).toBe(true);

      setDark(false);
      expect(isDark.value).toBe(false);
    });
  });

  describe("getTheme", () => {
    it("returns light theme when isDark is false", async () => {
      mqlMatches = false;
      const { getTheme } = await loadUseTheme();
      const theme = getTheme();
      expect((theme as any).name).toBe("light");
    });

    it("returns dark theme when isDark is true", async () => {
      mqlMatches = true;
      const { getTheme } = await loadUseTheme();
      const theme = getTheme();
      expect((theme as any).name).toBe("dark");
    });

    it("returns dark theme after setDark(true)", async () => {
      mqlMatches = false;
      const { getTheme, setDark } = await loadUseTheme();
      setDark(true);
      const theme = getTheme();
      expect((theme as any).name).toBe("dark");
    });
  });

  describe("setDark", () => {
    it("overrides system preference", async () => {
      mqlMatches = false;
      const { isDark, setDark } = await loadUseTheme();

      setDark(true);
      expect(isDark.value).toBe(true);

      setDark(false);
      expect(isDark.value).toBe(false);
    });
  });

  describe("watchTheme", () => {
    it("applies theme on forcedDark change", async () => {
      mqlMatches = false;
      const { watchTheme, setDark } = await loadUseTheme();

      const workspace = { setTheme: mockSetTheme } as any;
      const cleanup = watchTheme(workspace);

      setDark(true);
      await nextTick();

      expect(mockSetTheme).toHaveBeenCalled();
      const lastTheme =
        mockSetTheme.mock.calls[mockSetTheme.mock.calls.length - 1][0];
      expect((lastTheme as any).name).toBe("dark");

      cleanup();
    });

    it("applies theme on system change when forcedDark is null", async () => {
      mqlMatches = false;
      const { watchTheme } = await loadUseTheme();

      const workspace = { setTheme: mockSetTheme } as any;
      const cleanup = watchTheme(workspace);

      // Simulate system theme change
      for (const listener of mqlListeners) {
        listener.trigger();
      }

      expect(mockSetTheme).toHaveBeenCalled();

      cleanup();
    });

    it("ignores system change when forcedDark is set", async () => {
      mqlMatches = false;
      const { watchTheme, setDark } = await loadUseTheme();

      const workspace = { setTheme: mockSetTheme } as any;
      const cleanup = watchTheme(workspace);

      setDark(false);
      await nextTick();
      mockSetTheme.mockClear();

      // Simulate system theme change — should be ignored
      for (const listener of mqlListeners) {
        listener.trigger();
      }

      expect(mockSetTheme).not.toHaveBeenCalled();

      cleanup();
    });

    it("removes listeners on cleanup", async () => {
      mqlMatches = false;
      const { watchTheme } = await loadUseTheme();

      const workspace = { setTheme: mockSetTheme } as any;
      const cleanup = watchTheme(workspace);

      const listenerCountBefore = mqlListeners.length;
      cleanup();

      // mql listener should have been removed
      expect(mqlListeners.length).toBeLessThan(listenerCountBefore);
    });
  });
});
