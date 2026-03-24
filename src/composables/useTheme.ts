import { ref, computed, watch } from 'vue'
import type { ComputedRef } from 'vue'
import * as Blockly from 'blockly/core'

/**
 * 浅色主题 — 基于 Classic，调整工作区背景和网格颜色
 */
const LightTheme = Blockly.Theme.defineTheme('light', {
  name: 'light',
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: '#f9fafb',
    toolboxBackgroundColour: '#ffffff',
    toolboxForegroundColour: '#1e293b',
    flyoutBackgroundColour: '#f1f5f9',
    flyoutForegroundColour: '#1e293b',
    flyoutOpacity: 0.95,
    scrollbarColour: '#cbd5e1',
    scrollbarOpacity: 0.6,
  },
})

/**
 * 深色主题
 */
const DarkTheme = Blockly.Theme.defineTheme('dark', {
  name: 'dark',
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: '#1e1e2e',
    toolboxBackgroundColour: '#181825',
    toolboxForegroundColour: '#cdd6f4',
    flyoutBackgroundColour: '#252536',
    flyoutForegroundColour: '#cdd6f4',
    flyoutOpacity: 0.95,
    scrollbarColour: '#585b70',
    scrollbarOpacity: 0.6,
  },
})

/**
 * 强制主题状态：null 表示跟随系统 prefers-color-scheme，
 * true/false 表示由主系统 THEME_CHANGE 消息强制设置。
 */
const forcedDark = ref<boolean | null>(null)

const mql = window.matchMedia('(prefers-color-scheme: dark)')

/**
 * 当前是否为深色模式。
 * 优先使用 forcedDark（主系统推送），否则跟随系统偏好。
 */
const isDark: ComputedRef<boolean> = computed(() =>
  forcedDark.value !== null ? forcedDark.value : mql.matches,
)

/**
 * 根据当前 isDark 状态返回对应主题，
 * 提供 setDark 供 THEME_CHANGE 消息处理器调用，
 * 并监听变化自动切换工作区主题。
 */
export function useTheme() {
  const getTheme = () => (isDark.value ? DarkTheme : LightTheme)

  /**
   * 由主系统 THEME_CHANGE 消息调用，强制设置深色/浅色模式。
   * 调用后将忽略浏览器 prefers-color-scheme 变化。
   */
  const setDark = (dark: boolean): void => {
    forcedDark.value = dark
  }

  /** 开始监听，传入 workspace 实例。返回清理函数。 */
  const watchTheme = (workspace: Blockly.WorkspaceSvg) => {
    const applyTheme = () => {
      workspace.setTheme(isDark.value ? DarkTheme : LightTheme)
    }

    // Watch forcedDark changes (via setDark)
    const stopWatchForced = watch(isDark, applyTheme)

    // Listen to system prefers-color-scheme changes —
    // only apply when forcedDark is null (following system)
    const mqlHandler = () => {
      if (forcedDark.value === null) {
        applyTheme()
      }
    }
    mql.addEventListener('change', mqlHandler)

    return () => {
      stopWatchForced()
      mql.removeEventListener('change', mqlHandler)
    }
  }

  return { getTheme, watchTheme, setDark, isDark }
}
