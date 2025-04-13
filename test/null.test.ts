import { nullType } from '../src/schema/null';
import { TypeValidationError } from '../src/errors';
import { expectSuccess, expectError } from './utils';
import { ValidationError } from '../src/types';

describe('NullSchema', () => {
  test('validates null values', () => {
    const schema = nullType();
    const validator = schema.toValidator();

    const result = validator.safeParse(null);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(null);
    }
  });

  test('rejects non-null values', () => {
    const schema = nullType();
    const validator = schema.toValidator();

    // Test with various non-null types
    ['string', 123, true, undefined, {}, [], new Date(), Symbol('test')].forEach(value => {
      const result = validator.safeParse(value);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error._tag).toBe('TypeValidationError');
        expect(result.error.message).toContain('Expected null');
      }
    });
  });

  test('parse method returns null', () => {
    const schema = nullType();
    const validator = schema.toValidator();

    const result = validator.parse(null);
    expect(result).toBe(null);
  });

  test('parse method throws for non-null values', () => {
    const schema = nullType();
    const validator = schema.toValidator();

    expect(() => {
      validator.parse(undefined);
    }).toThrow();

    try {
      validator.parse(undefined);
    } catch (error) {
      expect(JSON.stringify(error)).toContain('TypeValidationError');
      expect(JSON.stringify(error)).toContain('Expected null');
    }
  });

  test('validateAsync returns Promise with null value', async () => {
    const schema = nullType();
    const validator = schema.toValidator();

    const result = await validator.validateAsync(null);
    expect(result).toBe(null);
  });

  test('validateAsync throws for non-null values', async () => {
    const schema = nullType();
    const validator = schema.toValidator();

    try {
      await validator.validateAsync('not null');
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      const validationError = error as ValidationError;
      expect(validationError).toBeDefined();
      expect(validationError._tag).toBe('RefinementValidationError');
      expect(validationError.message).toContain('Expected null');
    }
  });
});
