import { renderHook, act } from '@testing-library/react'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'

describe('useKeyboardNavigation', () => {
  describe('hook setup', () => {
    it('should initialize without errors', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, null, setHighlightedStep))
      expect(true).toBe(true)
    })

    it('should work with various counts', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(0, null, setHighlightedStep))
      renderHook(() => useKeyboardNavigation(1, null, setHighlightedStep))
      renderHook(() => useKeyboardNavigation(100, null, setHighlightedStep))
      expect(true).toBe(true)
    })
  })

  describe('arrow key navigation', () => {
    it('should move to first step on Arrow Down from null', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, null, setHighlightedStep))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).toHaveBeenCalledWith(1)
    })

    it('should move to next step on Arrow Down', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, 2, setHighlightedStep))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).toHaveBeenCalledWith(3)
    })

    it('should not go past last step on Arrow Down', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, 5, setHighlightedStep))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).not.toHaveBeenCalled()
    })

    it('should move to previous step on Arrow Up', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, 3, setHighlightedStep))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).toHaveBeenCalledWith(2)
    })

    it('should not go before first step on Arrow Up', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, 1, setHighlightedStep))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).not.toHaveBeenCalled()
    })

    it('should move to first step on Arrow Up from null', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, null, setHighlightedStep))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).toHaveBeenCalledWith(1)
    })
  })

  describe('escape key', () => {
    it('should clear highlight on Escape', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, 2, setHighlightedStep))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).toHaveBeenCalledWith(null)
    })

    it('should handle Escape when no highlight is set', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, null, setHighlightedStep))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).toHaveBeenCalledWith(null)
    })
  })

  describe('other keys should be ignored', () => {
    it('should ignore non-navigation keys', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, 2, setHighlightedStep))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).not.toHaveBeenCalled()
    })

    it('should ignore ArrowLeft and ArrowRight', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(5, 2, setHighlightedStep))

      act(() => {
        const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
        window.dispatchEvent(leftEvent)
      })

      act(() => {
        const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' })
        window.dispatchEvent(rightEvent)
      })

      expect(setHighlightedStep).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle single step recipes', () => {
      const setHighlightedStep = jest.fn()
      const { rerender } = renderHook(
        ({ current }) => useKeyboardNavigation(1, current, setHighlightedStep),
        { initialProps: { current: null } }
      )

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).toHaveBeenCalledWith(1)

      // Update the hook's currentStep to reflect the change
      setHighlightedStep.mockClear()
      rerender({ current: 1 })

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).not.toHaveBeenCalled()
    })

    it('should handle large number of steps', () => {
      const setHighlightedStep = jest.fn()
      renderHook(() => useKeyboardNavigation(100, 50, setHighlightedStep))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).toHaveBeenCalledWith(51)
    })
  })

  describe('event listener cleanup', () => {
    it('should not respond to events after unmount', () => {
      const setHighlightedStep = jest.fn()
      const { unmount } = renderHook(() =>
        useKeyboardNavigation(5, 2, setHighlightedStep)
      )

      unmount()
      setHighlightedStep.mockClear()

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).not.toHaveBeenCalled()
    })
  })

  describe('dependency updates', () => {
    it('should handle currentStep changes', () => {
      const setHighlightedStep = jest.fn()
      const { rerender } = renderHook(
        ({ current }) => useKeyboardNavigation(5, current, setHighlightedStep),
        { initialProps: { current: 1 } }
      )

      rerender({ current: 3 })
      setHighlightedStep.mockClear()

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).toHaveBeenCalledWith(4)
    })

    it('should handle totalSteps changes', () => {
      const setHighlightedStep = jest.fn()
      const { rerender } = renderHook(
        ({ total }) => useKeyboardNavigation(total, 1, setHighlightedStep),
        { initialProps: { total: 3 } }
      )

      rerender({ total: 10 })
      setHighlightedStep.mockClear()

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        window.dispatchEvent(event)
      })

      expect(setHighlightedStep).toHaveBeenCalledWith(2)
    })
  })

  describe('hook contract', () => {
    it('should not return any value (void hook)', () => {
      const setHighlightedStep = jest.fn()
      const { result } = renderHook(() =>
        useKeyboardNavigation(5, 2, setHighlightedStep)
      )

      expect(result.current).toBeUndefined()
    })

    it('should accept a callback function for step changes', () => {
      const mockCallback = jest.fn()
      renderHook(() => useKeyboardNavigation(5, 2, mockCallback))

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        window.dispatchEvent(event)
      })

      expect(mockCallback).toHaveBeenCalled()
    })
  })
})
