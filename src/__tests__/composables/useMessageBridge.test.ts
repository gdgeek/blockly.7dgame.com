import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useMessageBridge } from '@/composables/useMessageBridge'

/**
 * Helper to mount a composable inside a real component context
 * so Vue lifecycle hooks (onMounted, onBeforeUnmount) fire correctly.
 */
function withSetup(composable: () => any) {
  let result: any
  const comp = defineComponent({
    setup() {
      result = composable()
      return () => null
    },
  })
  const wrapper = mount(comp)
  return { result, wrapper }
}

describe('useMessageBridge', () => {
  let postMessageSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    postMessageSpy = vi.fn()
    Object.defineProperty(window, 'parent', {
      value: { postMessage: postMessageSpy },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('postMessage', () => {
    it('sends { action, data, from: "script.blockly" } to parent with "*" origin', () => {
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.postMessage('test-action', { key: 'value' })

      expect(postMessageSpy).toHaveBeenCalledWith(
        { action: 'test-action', data: { key: 'value' }, from: 'script.blockly' },
        '*',
      )

      wrapper.unmount()
    })

    it('defaults data to empty object when omitted', () => {
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.postMessage('ping')

      expect(postMessageSpy).toHaveBeenCalledWith(
        { action: 'ping', data: {}, from: 'script.blockly' },
        '*',
      )

      wrapper.unmount()
    })
  })

  describe('ready message on mount', () => {
    it('sends a "ready" message to parent when mounted', () => {
      const { wrapper } = withSetup(() => useMessageBridge())

      expect(postMessageSpy).toHaveBeenCalledWith(
        { action: 'ready', data: {}, from: 'script.blockly' },
        '*',
      )

      wrapper.unmount()
    })
  })

  describe('onAction and message receiving', () => {
    it('dispatches to registered handler when a valid message arrives', async () => {
      const handler = vi.fn()
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.onAction('init', handler)

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { action: 'init', data: { workspace: '{}' }, from: 'script.meta.web' },
        }),
      )

      // Allow async handler to process
      await nextTick()

      expect(handler).toHaveBeenCalledWith({ workspace: '{}' })

      wrapper.unmount()
    })

    it('accepts messages from script.verse.web origin', async () => {
      const handler = vi.fn()
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.onAction('user-info', handler)

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { action: 'user-info', data: { name: 'test' }, from: 'script.verse.web' },
        }),
      )

      await nextTick()

      expect(handler).toHaveBeenCalledWith({ name: 'test' })

      wrapper.unmount()
    })
  })

  describe('message filtering', () => {
    it('ignores messages with wrong "from" field', async () => {
      const handler = vi.fn()
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.onAction('init', handler)

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { action: 'init', data: {}, from: 'unknown.origin' },
        }),
      )

      await nextTick()

      expect(handler).not.toHaveBeenCalled()

      wrapper.unmount()
    })

    it('ignores messages without an action field', async () => {
      const handler = vi.fn()
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.onAction('init', handler)

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { data: {}, from: 'script.meta.web' },
        }),
      )

      await nextTick()

      expect(handler).not.toHaveBeenCalled()

      wrapper.unmount()
    })

    it('ignores messages without a "from" field', async () => {
      const handler = vi.fn()
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.onAction('init', handler)

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { action: 'init', data: {} },
        }),
      )

      await nextTick()

      expect(handler).not.toHaveBeenCalled()

      wrapper.unmount()
    })

    it('ignores null/undefined message data', async () => {
      const handler = vi.fn()
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.onAction('init', handler)

      window.dispatchEvent(new MessageEvent('message', { data: null }))
      window.dispatchEvent(new MessageEvent('message', { data: undefined }))

      await nextTick()

      expect(handler).not.toHaveBeenCalled()

      wrapper.unmount()
    })
  })

  describe('Ctrl+S shortcut', () => {
    it('triggers the save handler on Ctrl+S', async () => {
      const saveHandler = vi.fn()
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.onAction('save', saveHandler)

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })
      window.dispatchEvent(event)

      await nextTick()

      expect(saveHandler).toHaveBeenCalledWith(undefined)

      wrapper.unmount()
    })

    it('triggers the save handler on Meta+S (macOS)', async () => {
      const saveHandler = vi.fn()
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.onAction('save', saveHandler)

      const event = new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      })
      window.dispatchEvent(event)

      await nextTick()

      expect(saveHandler).toHaveBeenCalledWith(undefined)

      wrapper.unmount()
    })

    it('does not trigger save handler on plain "s" keypress', async () => {
      const saveHandler = vi.fn()
      const { result, wrapper } = withSetup(() => useMessageBridge())

      result.onAction('save', saveHandler)

      const event = new KeyboardEvent('keydown', {
        key: 's',
        bubbles: true,
        cancelable: true,
      })
      window.dispatchEvent(event)

      await nextTick()

      expect(saveHandler).not.toHaveBeenCalled()

      wrapper.unmount()
    })
  })
})
