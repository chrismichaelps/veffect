import { never } from '../src/schema/never';
import { TypeValidationError } from '../src/errors';
import { expectSuccess, expectError } from './utils';
import { ValidationError } from '../src/types';

describe('NeverSchema', () => {
  test('rejects all values', () => {
    const schema = never();
    const validator = schema.toValidator();

    // Test with various types - all should fail
    ['string', 123, true, null, undefined, {}, [], new Date(), Symbol('test')].forEach(value => {
      const result = validator.safeParse(value);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error._tag).toBe('TypeValidationError');
        expect(result.error.message).toContain('Never type schema never accepts any value');
      }
    });
  });

  test('parse method throws for all values', () => {
    const schema = never();
    const validator = schema.toValidator();

    expect(() => {
      validator.parse('any value');
    }).toThrow();

    try {
      validator.parse('any value');
    } catch (error) {
      expect(JSON.stringify(error)).toContain('TypeValidationError');
      expect(JSON.stringify(error)).toContain('Never type schema never accepts any value');
    }

    expect(() => {
      validator.parse(null);
    }).toThrow();

    expect(() => {
      validator.parse(undefined);
    }).toThrow();
  });

  test('validateAsync always throws errors', async () => {
    const schema = never();
    const validator = schema.toValidator();

    try {
      await validator.validateAsync('any value');
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      const validationError = error as ValidationError;
      expect(validationError).toBeDefined();
      expect(validationError._tag).toBe('RefinementValidationError');
      expect(validationError.message).toContain('Never type schema never accepts any value');
    }

    // Test other values too
    let threwError = false;
    try {
      await validator.validateAsync(null);
    } catch (error) {
      threwError = true;
    }
    expect(threwError).toBe(true);

    threwError = false;
    try {
      await validator.validateAsync(undefined);
    } catch (error) {
      threwError = true;
    }
    expect(threwError).toBe(true);
  });
});
