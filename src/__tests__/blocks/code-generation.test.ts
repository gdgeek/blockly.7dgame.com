import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('blockly/javascript', () => ({
  javascriptGenerator: {
    workspaceToCode: vi.fn(),
  },
}))
vi.mock('blockly/lua', () => ({
  luaGenerator: {
    workspaceToCode: vi.fn(),
  },
}))
vi.mock('blockly', () => ({
  default: {},
}))

import { javascriptGenerator } from 'blockly/javascript'
import { luaGenerator } from 'blockly/lua'
import { useCodeGenerator } from '@/composables/useCodeGenerator'

describe('useCodeGenerator', () => {
  const fakeWorkspace = { id: 'test-workspace' } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateJavaScript', () => {
    it('calls javascriptGenerator.workspaceToCode with the workspace and returns the result', () => {
      vi.mocked(javascriptGenerator.workspaceToCode).mockReturnValue('var x = 1;')
      const { generateJavaScript } = useCodeGenerator()

      const result = generateJavaScript(fakeWorkspace)

      expect(javascriptGenerator.workspaceToCode).toHaveBeenCalledWith(fakeWorkspace)
      expect(result).toBe('var x = 1;')
    })
  })

  describe('generateLua', () => {
    it('calls luaGenerator.workspaceToCode with the workspace and returns the result', () => {
      vi.mocked(luaGenerator.workspaceToCode).mockReturnValue('local x = 1')
      const { generateLua } = useCodeGenerator()

      const result = generateLua(fakeWorkspace)

      expect(luaGenerator.workspaceToCode).toHaveBeenCalledWith(fakeWorkspace)
      expect(result).toBe('local x = 1')
    })
  })

  describe('generateAll', () => {
    it('returns both js and lua code strings', () => {
      vi.mocked(javascriptGenerator.workspaceToCode).mockReturnValue('console.log("hi");')
      vi.mocked(luaGenerator.workspaceToCode).mockReturnValue('print("hi")')
      const { generateAll } = useCodeGenerator()

      const result = generateAll(fakeWorkspace)

      expect(result).toEqual({
        js: 'console.log("hi");',
        lua: 'print("hi")',
      })
    })

    it('passes the workspace argument through to both generators', () => {
      vi.mocked(javascriptGenerator.workspaceToCode).mockReturnValue('')
      vi.mocked(luaGenerator.workspaceToCode).mockReturnValue('')
      const { generateAll } = useCodeGenerator()

      generateAll(fakeWorkspace)

      expect(javascriptGenerator.workspaceToCode).toHaveBeenCalledWith(fakeWorkspace)
      expect(luaGenerator.workspaceToCode).toHaveBeenCalledWith(fakeWorkspace)
    })
  })
})
