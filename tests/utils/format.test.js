import { describe, it, expect } from '@jest/globals';
import { formatValidationError } from '../../src/utils/format.js';

describe('formatValidationError', () => {
  it('should return default message when error is null', () => {
    expect(formatValidationError(null)).toBe('Validation failed');
  });

  it('should return default message when error is undefined', () => {
    expect(formatValidationError(undefined)).toBe('Validation failed');
  });

  it('should return default message when error has no issues', () => {
    expect(formatValidationError({})).toBe('Validation failed');
  });

  it('should join issue messages when issues is an array', () => {
    const error = {
      issues: [
        { message: 'Name is required' },
        { message: 'Email is invalid' },
      ],
    };
    expect(formatValidationError(error)).toBe(
      'Name is required, Email is invalid'
    );
  });

  it('should return single message for one issue', () => {
    const error = {
      issues: [{ message: 'Password too short' }],
    };
    expect(formatValidationError(error)).toBe('Password too short');
  });

  it('should stringify error when issues is not an array', () => {
    const error = { issues: 'not an array' };
    const result = formatValidationError(error);
    expect(result).toBe(JSON.stringify(error));
  });
});
