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
});
