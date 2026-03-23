import * as Blockly from 'blockly/core'

/**
 * 浅色主题 — 基于 Classic，调整工作区背景和网格颜色
 */
const LightTheme = Blockly.Theme.defineTheme('light', {
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
 * 根据浏览器 prefers-color-scheme 返回对应主题，
 * 并监听变化自动切换工作区主题。
 */
export function useTheme() {
  const mql = window.matchMedia('(prefers-color-scheme: dark)')

  const getTheme = () => (mql.matches ? DarkTheme : LightTheme)

  /** 开始监听，传入 workspace 实例 */
  const watchTheme = (workspace: Blockly.WorkspaceSvg) => {
    const handler = () => {
      workspace.setTheme(getTheme())
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }

  return { getTheme, watchTheme }
}
