import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initialization', () => {
    it('should initialize with provided initial value', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
      expect(result.current[0]).toBe('initial')
    })

    it('should handle complex objects as initial value', () => {
      const initialValue = { name: 'test', count: 42 }
      const { result } = renderHook(() =>
        useLocalStorage('test-key', initialValue)
      )
      expect(result.current[0]).toEqual(initialValue)
    })

    it('should handle arrays', () => {
      const initialValue = [1, 2, 3]
      const { result } = renderHook(() =>
        useLocalStorage('test-key', initialValue)
      )
      expect(result.current[0]).toEqual(initialValue)
    })

    it('should handle boolean, number, and other types', () => {
      const { result: boolResult } = renderHook(() =>
        useLocalStorage('bool-key', true)
      )
      expect(boolResult.current[0]).toBe(true)

      const { result: numResult } = renderHook(() =>
        useLocalStorage('num-key', 42)
      )
      expect(numResult.current[0]).toBe(42)

      const { result: nullResult } = renderHook(() =>
        useLocalStorage<string | null>('null-key', null)
      )
      expect(nullResult.current[0]).toBeNull()
    })
  })

  describe('loading from localStorage', () => {
    it('should load stored value from localStorage on mount', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'))
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

      // After mount, should load from localStorage
      expect(result.current[0]).toBe('stored-value')
    })

    it('should keep initial value if localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
      expect(result.current[0]).toBe('initial')
    })

    it('should handle complex objects from localStorage', () => {
      const storedValue = { name: 'John', age: 30 }
      localStorage.setItem('test-key', JSON.stringify(storedValue))
      const { result } = renderHook(() =>
        useLocalStorage('test-key', { name: 'initial', age: 0 })
      )

      expect(result.current[0]).toEqual(storedValue)
    })

    it('should keep initial value if it matches stored value', () => {
      localStorage.setItem('test-key', JSON.stringify('same-value'))
      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'same-value')
      )
      expect(result.current[0]).toBe('same-value')
    })
  })

  describe('setting values', () => {
    it('should update state when setValue is called', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      expect(result.current[0]).toBe('updated')
    })

    it('should persist value to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'))
    })

    it('should handle complex object updates', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', { count: 0 })
      )

      const newValue = { count: 5, name: 'test' }
      act(() => {
        result.current[1](newValue)
      })

      expect(result.current[0]).toEqual(newValue)
      expect(JSON.parse(localStorage.getItem('test-key') || '{}')).toEqual(
        newValue
      )
    })

    it('should handle array updates', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', [1, 2]))

      const newArray = [1, 2, 3, 4]
      act(() => {
        result.current[1](newArray)
      })

      expect(result.current[0]).toEqual(newArray)
      expect(JSON.parse(localStorage.getItem('test-key') || '[]')).toEqual(
        newArray
      )
    })

    it('should handle setting null', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string | null>('test-key', 'initial')
      )

      act(() => {
        result.current[1](null)
      })

      expect(result.current[0]).toBeNull()
      expect(localStorage.getItem('test-key')).toBe('null')
    })
  })

  describe('multiple keys', () => {
    it('should handle multiple independent storage keys', () => {
      const { result: hook1 } = renderHook(() =>
        useLocalStorage('key-1', 'value-1')
      )
      const { result: hook2 } = renderHook(() =>
        useLocalStorage('key-2', 'value-2')
      )

      expect(hook1.current[0]).toBe('value-1')
      expect(hook2.current[0]).toBe('value-2')

      act(() => {
        hook1.current[1]('updated-1')
        hook2.current[1]('updated-2')
      })

      expect(hook1.current[0]).toBe('updated-1')
      expect(hook2.current[0]).toBe('updated-2')
      expect(localStorage.getItem('key-1')).toBe(JSON.stringify('updated-1'))
      expect(localStorage.getItem('key-2')).toBe(JSON.stringify('updated-2'))
    })
  })

  describe('SSR safety', () => {
    it('should not cause hydration issues on initial render', () => {
      // On first render, should return initial value
      // On mount, effect will load from localStorage
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
      expect(result.current[0]).toBe('initial')
    })

    it('should handle SSR hydration pattern', () => {
      // Pre-set a value in localStorage to simulate SSR
      localStorage.setItem('hydrated-key', JSON.stringify('ssr-value'))

      const { result } = renderHook(() =>
        useLocalStorage('hydrated-key', 'default-value')
      )

      // After mount, should have SSR value
      expect(result.current[0]).toBe('ssr-value')
    })
  })

  describe('type safety', () => {
    it('should work with generic types', () => {
      interface User {
        id: string
        name: string
        email: string
      }

      const initialUser: User = {
        id: '1',
        name: 'John',
        email: 'john@example.com',
      }

      const { result } = renderHook(() => useLocalStorage('user', initialUser))

      expect(result.current[0]).toEqual(initialUser)

      const updatedUser: User = {
        id: '1',
        name: 'Jane',
        email: 'jane@example.com',
      }

      act(() => {
        result.current[1](updatedUser)
      })

      expect(result.current[0]).toEqual(updatedUser)
    })
  })

  describe('hook contract', () => {
    it('should return a tuple [value, setValue]', () => {
      const { result } = renderHook(() => useLocalStorage('test', 'initial'))
      expect(Array.isArray(result.current)).toBe(true)
      expect(result.current.length).toBe(2)
      expect(typeof result.current[1]).toBe('function')
    })

    it('should update both state and localStorage synchronously', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

      act(() => {
        result.current[1]('new-value')
      })

      // Both state and localStorage should be updated
      expect(result.current[0]).toBe('new-value')
      expect(JSON.parse(localStorage.getItem('test-key') || '""')).toBe(
        'new-value'
      )
    })
  })
})
