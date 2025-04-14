import { unknown } from '../src/schema/unknown';

describe('UnknownSchema', () => {
  test('validates any value without errors as unknown type', () => {
    const schema = unknown();
    const validator = schema.toValidator();

    // Test with various types
    expect(validator.safeParse('string value').success).toBe(true);
    expect(validator.safeParse(123).success).toBe(true);
    expect(validator.safeParse(true).success).toBe(true);
    expect(validator.safeParse(null).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(true);
    expect(validator.safeParse({}).success).toBe(true);
    expect(validator.safeParse([]).success).toBe(true);
    expect(validator.safeParse(new Date()).success).toBe(true);
    expect(validator.safeParse(Symbol('test')).success).toBe(true);
    expect(validator.safeParse(() => { }).success).toBe(true);
  });

  test('returns the same input value without changes', () => {
    const schema = unknown();
    const validator = schema.toValidator();

    const complexObject = {
      name: 'Test',
      value: 42,
      nested: {
        array: [1, 2, 3],
        boolean: true
      }
    };

    const result = validator.safeParse(complexObject);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(complexObject); // Should be the same object reference
      expect(result.data).toEqual(complexObject); // Should have the same content
    }
  });

  test('parse method returns input directly', () => {
    const schema = unknown();
    const validator = schema.toValidator();

    const input = { key: 'value' };
    const result = validator.parse(input);

    expect(result).toBe(input);
  });

  test('validateAsync returns Promise with input value', async () => {
    const schema = unknown();
    const validator = schema.toValidator();

    const input = [1, 2, 3];
    const result = await validator.validateAsync(input);

    expect(result).toBe(input);
  });

  test('safeParse always returns success result', () => {
    const schema = unknown();
    const validator = schema.toValidator();

    // Even with unusual values, should always succeed
    const result1 = validator.safeParse(NaN);
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(isNaN(result1.data as number)).toBe(true);
    }

    const result2 = validator.safeParse(Infinity);
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toBe(Infinity);
    }
  });

  test('differs from any() in its type safety', () => {
    // This is more of a TypeScript type check than a runtime test
    // In runtime, unknown() and any() behave the same way
    const schema = unknown();
    const validator = schema.toValidator();

    const result = validator.safeParse('test');
    expect(result.success).toBe(true);

    // Note: In TypeScript, using the value would require a type check first
    // but this can't be directly tested in a Jest test
  });

  // Tests for the refine method
  describe('refine method', () => {
    test('successfully validates when refinement condition is true', () => {
      const schema = unknown().refine(val => val !== null && val !== undefined);
      const validator = schema.toValidator();

      expect(validator.safeParse('test').success).toBe(true);
      expect(validator.safeParse(42).success).toBe(true);
      expect(validator.safeParse({}).success).toBe(true);
    });

    test('fails validation when refinement condition is false', () => {
      const schema = unknown().refine(val => val !== null && val !== undefined);
      const validator = schema.toValidator();

      expect(validator.safeParse(null).success).toBe(false);
      expect(validator.safeParse(undefined).success).toBe(false);
    });

    test('uses custom error message when provided', () => {
      const errorMessage = 'Value cannot be null or undefined';
      const schema = unknown().refine(
        val => val !== null && val !== undefined,
        errorMessage
      );
      const validator = schema.toValidator();

      const result = validator.safeParse(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe(errorMessage);
      }
    });

    test('supports function for dynamic error messages', () => {
      const schema = unknown().refine(
        val => typeof val === 'number' && val > 0,
        val => `Expected positive number, got ${val}`
      );
      const validator = schema.toValidator();

      const result = validator.safeParse(-5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Expected positive number, got -5');
      }
    });

    test('chains multiple refinements', () => {
      const schema = unknown()
        .refine(val => val !== null && val !== undefined)
        .refine(val => typeof val === 'number')
        .refine(val => (val as number) > 0);
      const validator = schema.toValidator();

      expect(validator.safeParse(10).success).toBe(true);
      expect(validator.safeParse(-5).success).toBe(false);
      expect(validator.safeParse('string').success).toBe(false);
      expect(validator.safeParse(null).success).toBe(false);
    });
  });

  // Tests for the transform method
  describe('transform method', () => {
    test('transforms values according to the transformer function', () => {
      const schema = unknown().transform(val => {
        if (typeof val === 'string') {
          return val.toUpperCase();
        }
        return val;
      });
      const validator = schema.toValidator();

      const result1 = validator.safeParse('hello');
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.data).toBe('HELLO');
      }

      // Non-string values should remain unchanged
      const result2 = validator.safeParse(42);
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.data).toBe(42);
      }
    });

    test('transforms based on value type', () => {
      const schema = unknown().transform(val => {
        if (typeof val === 'number') {
          return val * 2;
        } else if (typeof val === 'string') {
          return val.toUpperCase();
        } else if (Array.isArray(val)) {
          return [...val, 'extra'];
        } else if (typeof val === 'object' && val !== null) {
          return { ...val, processed: true };
        }
        return val;
      });
      const validator = schema.toValidator();

      // Test number transformation
      const numResult = validator.safeParse(10);
      expect(numResult.success).toBe(true);
      if (numResult.success) {
        expect(numResult.data).toBe(20);
      }

      // Test string transformation
      const strResult = validator.safeParse('hello');
      expect(strResult.success).toBe(true);
      if (strResult.success) {
        expect(strResult.data).toBe('HELLO');
      }

      // Test array transformation
      const arrResult = validator.safeParse([1, 2, 3]);
      expect(arrResult.success).toBe(true);
      if (arrResult.success) {
        expect(arrResult.data).toEqual([1, 2, 3, 'extra']);
      }

      // Test object transformation
      const objResult = validator.safeParse({ name: 'test' });
      expect(objResult.success).toBe(true);
      if (objResult.success) {
        expect(objResult.data).toEqual({ name: 'test', processed: true });
      }

      // Null and undefined should remain unchanged
      expect(validator.safeParse(null).success).toBe(true);
      expect(validator.safeParse(undefined).success).toBe(true);
    });

    test('works with refine before transform', () => {
      const schema = unknown()
        .refine(val => typeof val === 'string', 'Must be a string')
        .transform(val => (val as string).trim().toUpperCase());
      const validator = schema.toValidator();

      // Valid case
      const validResult = validator.safeParse('  hello  ');
      expect(validResult.success).toBe(true);
      if (validResult.success) {
        expect(validResult.data).toBe('HELLO');
      }

      // Invalid case
      const invalidResult = validator.safeParse(42);
      expect(invalidResult.success).toBe(false);
    });

    test('applies multiple transformations in a single transform function', () => {
      const schema = unknown().transform(val => {
        if (typeof val === 'string') {
          return `Processed: ${val.trim().toUpperCase()}`;
        }
        return val;
      });
      const validator = schema.toValidator();

      const result = validator.safeParse('  hello  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Processed: HELLO');
      }
    });

    test('supports transform after transform (chained transforms)', () => {
      const schema = unknown()
        .transform(val => {
          if (typeof val === 'string') {
            return val.trim();
          }
          return val;
        })
        .transform(val => {
          if (typeof val === 'string') {
            return val.toUpperCase();
          }
          return val;
        });

      const validator = schema.toValidator();

      const result = validator.safeParse('  hello  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('HELLO');
      }
    });

    test('supports refine after transform', () => {
      const schema = unknown()
        .transform(val => {
          if (typeof val === 'number') {
            return val * 2;
          }
          return val;
        })
        .refine(val => {
          if (typeof val === 'number') {
            return val > 10;
          }
          return true;
        }, 'Number must be greater than 10 after doubling');

      const validator = schema.toValidator();

      // Valid case: 6 * 2 = 12, which is > 10
      expect(validator.safeParse(6).success).toBe(true);

      // Invalid case: 4 * 2 = 8, which is not > 10
      const invalidResult = validator.safeParse(4);
      expect(invalidResult.success).toBe(false);
    });
  });
});
