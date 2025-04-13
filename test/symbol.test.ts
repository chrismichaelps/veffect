import { symbol } from '../src/schema/symbol';
import { TypeValidationError } from '../src/errors';
import { expectSuccess, expectError } from './utils';
import { ValidationError } from '../src/types';

describe('SymbolSchema', () => {
  test('validates Symbol values', () => {
    const schema = symbol();
    const validator = schema.toValidator();

    const testSymbol = Symbol('test');

    const result = validator.safeParse(testSymbol);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(testSymbol);
    }
  });

  test('rejects non-Symbol values', () => {
    const schema = symbol();
    const validator = schema.toValidator();

    // Test with various non-symbol types
    ['string', 123, true, null, undefined, {}, [], new Date()].forEach(value => {
      const result = validator.safeParse(value);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error._tag).toBe('TypeValidationError');
        expect(result.error.message).toContain('Expected a symbol');
      }
    });
  });

  test('parse method returns the original Symbol', () => {
    const schema = symbol();
    const validator = schema.toValidator();

    const testSymbol = Symbol('test');
    const result = validator.parse(testSymbol);

    expect(result).toBe(testSymbol);
  });

  test('parse method throws for non-Symbol values', () => {
    const schema = symbol();
    const validator = schema.toValidator();

    expect(() => {
      validator.parse('not a symbol');
    }).toThrow();

    try {
      validator.parse('not a symbol');
    } catch (error) {
      expect(JSON.stringify(error)).toContain('TypeValidationError');
      expect(JSON.stringify(error)).toContain('Expected a symbol');
    }
  });

  test('validateAsync returns Promise with Symbol value', async () => {
    const schema = symbol();
    const validator = schema.toValidator();

    const testSymbol = Symbol('test');
    const result = await validator.validateAsync(testSymbol);

    expect(result).toBe(testSymbol);
  });

  test('validateAsync throws for non-Symbol values', async () => {
    const schema = symbol();
    const validator = schema.toValidator();

    try {
      await validator.validateAsync('not a symbol');
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      const validationError = error as ValidationError;
      expect(validationError).toBeDefined();
      expect(validationError._tag).toBe('RefinementValidationError');
      expect(validationError.message).toContain('Expected a symbol');
    }
  });
});
