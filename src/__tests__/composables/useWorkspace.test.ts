import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import type * as Blockly from 'blockly'

const mockSave = vi.fn()
const mockLoad = vi.fn()

vi.mock('blockly', () => ({
  default: {
    serialization: {
      workspaces: {
        save: (...args: unknown[]) => mockSave(...args),
        load: (...args: unknown[]) => mockLoad(...args),
      },
    },
  },
  serialization: {
    workspaces: {
      save: (...args: unknown[]) => mockSave(...args),
      load: (...args: unknown[]) => mockLoad(...args),
    },
  },
}))

import { useWorkspace } from '@/composables/useWorkspace'

/**
 * Helper to mount a composable inside a real component context
 * so Vue lifecycle hooks (onBeforeUnmount) fire correctly.
 */
function withSetup<T>(composable: () => T) {
  let result!: T
  const comp = defineComponent({
    setup() {
      result = composable()
      return () => null
    },
  })
  const wrapper = mount(comp)
  return { result, wrapper }
}

interface EditorRefLike {
  workspace: Blockly.WorkspaceSvg | null
}

describe('useWorkspace', () => {
  beforeEach(() => {
    mockSave.mockReset()
    mockLoad.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('saveWorkspace', () => {
    it('calls Blockly.serialization.workspaces.save with the workspace and returns the result', () => {
      const { result, wrapper } = withSetup(() => useWorkspace())
      const fakeWorkspace = { id: 'ws-1' }
      const savedData = { blocks: { languageVersion: 0, blocks: [] } }
      mockSave.mockReturnValue(savedData)

      const output = result.saveWorkspace(fakeWorkspace)

      expect(mockSave).toHaveBeenCalledWith(fakeWorkspace)
      expect(output).toEqual(savedData)

      wrapper.unmount()
    })
  })

  describe('loadWorkspace', () => {
    it('calls Blockly.serialization.workspaces.load with data and workspace', () => {
      const { result, wrapper } = withSetup(() => useWorkspace())
      const fakeWorkspace = { id: 'ws-2' }
      const data = { blocks: { languageVersion: 0, blocks: [] } }

      result.loadWorkspace(data, fakeWorkspace)

      expect(mockLoad).toHaveBeenCalledWith(data, fakeWorkspace)

      wrapper.unmount()
    })
  })

  describe('watchWorkspaceReady', () => {
    it('loads data immediately and calls onReady when editor ref already has workspace', () => {
      const fakeWorkspace = { id: 'ws-3' }
      const editorRef = ref({ workspace: fakeWorkspace })
      const data = { blocks: [] }
      const onReady = vi.fn()

      const { result, wrapper } = withSetup(() => useWorkspace())

      result.watchWorkspaceReady(editorRef, data, onReady)

      expect(mockLoad).toHaveBeenCalledWith(data, fakeWorkspace)
      expect(onReady).toHaveBeenCalledWith(fakeWorkspace)

      wrapper.unmount()
    })

    it('loads data and calls onReady when editor ref workspace becomes available later', async () => {
      const fakeWorkspace = { id: 'ws-4' }
      const editorRef = ref<EditorRefLike | undefined>(undefined)
      const data = { blocks: [] }
      const onReady = vi.fn()

      const { result, wrapper } = withSetup(() => useWorkspace())

      result.watchWorkspaceReady(editorRef, data, onReady)

      // Not called yet — workspace not available
      expect(mockLoad).not.toHaveBeenCalled()
      expect(onReady).not.toHaveBeenCalled()

      // Simulate workspace becoming available
      editorRef.value = { workspace: fakeWorkspace }
      await nextTick()

      expect(mockLoad).toHaveBeenCalledWith(data, fakeWorkspace)
      expect(onReady).toHaveBeenCalledWith(fakeWorkspace)

      wrapper.unmount()
    })

    it('calls onTimeout after 5 seconds when workspace never becomes available', () => {
      vi.useFakeTimers()

      const editorRef = ref<EditorRefLike | undefined>(undefined)
      const data = { blocks: [] }
      const onReady = vi.fn()
      const onTimeout = vi.fn()

      const { result, wrapper } = withSetup(() => useWorkspace())

      result.watchWorkspaceReady(editorRef, data, onReady, onTimeout)

      // Not called yet
      expect(onReady).not.toHaveBeenCalled()
      expect(onTimeout).not.toHaveBeenCalled()

      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000)

      expect(onTimeout).toHaveBeenCalled()
      expect(onReady).not.toHaveBeenCalled()

      wrapper.unmount()
      vi.useRealTimers()
    })
  })

  describe('cleanup on unmount', () => {
    it('cleans up watcher and timeout when component unmounts before workspace is ready', () => {
      vi.useFakeTimers()

      const editorRef = ref<EditorRefLike | undefined>(undefined)
      const data = { blocks: [] }
      const onReady = vi.fn()
      const onTimeout = vi.fn()

      const { result, wrapper } = withSetup(() => useWorkspace())

      result.watchWorkspaceReady(editorRef, data, onReady, onTimeout)

      // Unmount before workspace becomes available or timeout fires
      wrapper.unmount()

      // Advance past the timeout — onTimeout should NOT fire because cleanup happened
      vi.advanceTimersByTime(10000)

      expect(onTimeout).not.toHaveBeenCalled()
      expect(onReady).not.toHaveBeenCalled()

      vi.useRealTimers()
    })
  })
})
