/**
 * Example unit tests to verify Jest is configured correctly
 * These tests demonstrate basic Jest testing patterns
 */

describe('Math operations', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3)
  })

  test('multiplies 2 * 3 to equal 6', () => {
    expect(2 * 3).toBe(6)
  })

  test('subtracts 5 - 2 to equal 3', () => {
    expect(5 - 2).toBe(3)
  })
})

describe('Async operations', () => {
  test('resolves a promise', async () => {
    const promise = Promise.resolve('success')
    await expect(promise).resolves.toBe('success')
  })

  test('rejects a promise', async () => {
    const promise = Promise.reject(new Error('failed'))
    await expect(promise).rejects.toThrow('failed')
  })
})

describe('TypeScript type checking', () => {
  type User = {
    id: string
    name: string
    email: string
  }

  test('type checking works with User interface', () => {
    const user: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    }

    expect(user.id).toBe('1')
    expect(user.name).toBe('Test User')
    expect(user.email).toBe('test@example.com')
  })

  test('arrays work with TypeScript', () => {
    const numbers: number[] = [1, 2, 3, 4, 5]
    expect(numbers.length).toBe(5)
    expect(numbers[0]).toBe(1)
  })
})

describe('Array operations', () => {
  test('finds element in array', () => {
    const items = ['apple', 'banana', 'orange']
    expect(items).toContain('banana')
  })

  test('filters array correctly', () => {
    const numbers = [1, 2, 3, 4, 5]
    const evens = numbers.filter((n) => n % 2 === 0)
    expect(evens).toEqual([2, 4])
  })

  test('maps array values', () => {
    const numbers = [1, 2, 3]
    const doubled = numbers.map((n) => n * 2)
    expect(doubled).toEqual([2, 4, 6])
  })
})
