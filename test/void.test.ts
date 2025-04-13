import { voidType } from '../src/schema/void';
import { TypeValidationError } from '../src/errors';
import { expectSuccess, expectError } from './utils';
import { ValidationError } from '../src/types';

describe('VoidSchema', () => {
  test('validates undefined values as void', () => {
    const schema = voidType();
    const validator = schema.toValidator();

    const result = validator.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(undefined);
    }
  });

  test('rejects non-void values', () => {
    const schema = voidType();
    const validator = schema.toValidator();

    // Test with various non-void types
    ['string', 123, true, null, {}, [], new Date(), Symbol('test')].forEach(value => {
      const result = validator.safeParse(value);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error._tag).toBe('TypeValidationError');
        expect(result.error.message).toContain('Expected void (undefined)');
      }
    });
  });

  test('parse method returns undefined (void)', () => {
    const schema = voidType();
    const validator = schema.toValidator();

    const result = validator.parse(undefined);
    expect(result).toBe(undefined);
  });

  test('parse method throws for non-void values', () => {
    const schema = voidType();
    const validator = schema.toValidator();

    expect(() => {
      validator.parse(null);
    }).toThrow();

    try {
      validator.parse(null);
    } catch (error) {
      expect(JSON.stringify(error)).toContain('TypeValidationError');
      expect(JSON.stringify(error)).toContain('Expected void (undefined)');
    }
  });

  test('validateAsync returns Promise with undefined (void) value', async () => {
    const schema = voidType();
    const validator = schema.toValidator();

    const result = await validator.validateAsync(undefined);
    expect(result).toBe(undefined);
  });

  test('validateAsync throws for non-void values', async () => {
    const schema = voidType();
    const validator = schema.toValidator();

    try {
      await validator.validateAsync('not void');
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      const validationError = error as ValidationError;
      expect(validationError).toBeDefined();
      expect(validationError._tag).toBe('RefinementValidationError');
      expect(validationError.message).toContain('Expected void (undefined)');
    }
  });
});
