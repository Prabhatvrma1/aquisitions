import { describe, it, expect } from '@jest/globals';
import {
  userIdSchema,
  updateUserSchema,
} from '../../src/validations/users.validation.js';

describe('userIdSchema', () => {
  it('should pass for valid numeric string', () => {
    const result = userIdSchema.safeParse({ id: '123' });
    expect(result.success).toBe(true);
    expect(result.data.id).toBe(123);
  });

  it('should fail for non-numeric string', () => {
    const result = userIdSchema.safeParse({ id: 'abc' });
    expect(result.success).toBe(false);
  });

  it('should fail for empty string', () => {
    const result = userIdSchema.safeParse({ id: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when id is missing', () => {
    const result = userIdSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('updateUserSchema', () => {
  it('should pass with valid partial update (name only)', () => {
    const result = updateUserSchema.safeParse({ name: 'John' });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('John');
  });

  it('should pass with valid email', () => {
    const result = updateUserSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
    expect(result.data.email).toBe('test@example.com');
  });

  it('should fail with invalid email', () => {
    const result = updateUserSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should pass with valid role', () => {
    const result = updateUserSchema.safeParse({ role: 'admin' });
    expect(result.success).toBe(true);
  });

  it('should fail with invalid role', () => {
    const result = updateUserSchema.safeParse({ role: 'superadmin' });
    expect(result.success).toBe(false);
  });

  it('should fail with unknown fields', () => {
    const result = updateUserSchema.safeParse({ age: 25 });
    expect(result.success).toBe(false);
  });

  it('should pass with empty object (no fields to update)', () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should fail with password shorter than 6 chars', () => {
    const result = updateUserSchema.safeParse({ password: '123' });
    expect(result.success).toBe(false);
  });

  it('should pass with valid password', () => {
    const result = updateUserSchema.safeParse({ password: 'secure123' });
    expect(result.success).toBe(true);
  });
});
