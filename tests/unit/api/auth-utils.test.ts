import {
  hashPassword,
  verifyPassword,
  validatePassword,
  validateEmail,
} from '@/lib/auth-utils'

describe('Password Hashing', () => {
  test('hashPassword generates a bcrypt hash', async () => {
    const password = 'testpassword123'
    const hash = await hashPassword(password)

    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
    // bcrypt hash format: starts with $2a$, $2b$, or $2y$
    expect(/^\$2[aby]\$/.test(hash)).toBe(true)
  })

  test('same password generates different hashes', async () => {
    const password = 'testpassword123'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    expect(hash1).not.toBe(hash2)
  })
})

describe('Password Verification', () => {
  test('verifyPassword returns true for correct password', async () => {
    const password = 'testpassword123'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword(password, hash)

    expect(isValid).toBe(true)
  })

  test('verifyPassword returns false for incorrect password', async () => {
    const password = 'testpassword123'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword('wrongpassword', hash)

    expect(isValid).toBe(false)
  })

  test('verifyPassword is case sensitive', async () => {
    const password = 'TestPassword123'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword('testpassword123', hash)

    expect(isValid).toBe(false)
  })
})

describe('Password Validation', () => {
  test('accepts password with 8+ characters', () => {
    const result = validatePassword('password123')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  test('accepts password with exactly 8 characters', () => {
    const result = validatePassword('pass1234')
    expect(result.valid).toBe(true)
  })

  test('rejects password with less than 8 characters', () => {
    const result = validatePassword('pass123')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Password must be at least 8 characters')
  })

  test('rejects empty password', () => {
    const result = validatePassword('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Password must be at least 8 characters')
  })

  test('rejects undefined password', () => {
    const result = validatePassword(undefined as unknown as string)
    expect(result.valid).toBe(false)
  })
})

describe('Email Validation', () => {
  test('accepts valid email format', () => {
    const result = validateEmail('test@example.com')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  test('accepts email with multiple dots', () => {
    const result = validateEmail('test.user@example.co.uk')
    expect(result.valid).toBe(true)
  })

  test('rejects email without @ symbol', () => {
    const result = validateEmail('invalid-email.com')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid email format')
  })

  test('rejects email without domain', () => {
    const result = validateEmail('test@')
    expect(result.valid).toBe(false)
  })

  test('rejects email without local part', () => {
    const result = validateEmail('@example.com')
    expect(result.valid).toBe(false)
  })

  test('rejects email with spaces', () => {
    const result = validateEmail('test @example.com')
    expect(result.valid).toBe(false)
  })

  test('rejects empty email', () => {
    const result = validateEmail('')
    expect(result.valid).toBe(false)
  })
})
