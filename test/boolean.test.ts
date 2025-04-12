import { boolean } from '../src/schema/boolean';

describe('BooleanSchema', () => {
  test('validates boolean values', () => {
    const schema = boolean();
    const validator = schema.toValidator();

    // Valid cases
    expect(validator.safeParse(true).success).toBe(true);
    expect(validator.safeParse(false).success).toBe(true);

    // Invalid cases
    expect(validator.safeParse('true').success).toBe(false);
    expect(validator.safeParse(1).success).toBe(false);
    expect(validator.safeParse(0).success).toBe(false);
    expect(validator.safeParse(null).success).toBe(false);
    expect(validator.safeParse(undefined).success).toBe(false);
    expect(validator.safeParse({}).success).toBe(false);
    expect(validator.safeParse([]).success).toBe(false);
  });

  test('nullable() accepts null values', () => {
    const schema = boolean().nullable();
    const validator = schema.toValidator();

    expect(validator.safeParse(true).success).toBe(true);
    expect(validator.safeParse(false).success).toBe(true);
    expect(validator.safeParse(null).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(false);
  });

  test('optional() accepts undefined values', () => {
    const schema = boolean().optional();
    const validator = schema.toValidator();

    expect(validator.safeParse(true).success).toBe(true);
    expect(validator.safeParse(false).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(true);
    expect(validator.safeParse(null).success).toBe(false);
  });

  test('nullish() accepts null and undefined values', () => {
    const schema = boolean().nullish();
    const validator = schema.toValidator();

    expect(validator.safeParse(true).success).toBe(true);
    expect(validator.safeParse(false).success).toBe(true);
    expect(validator.safeParse(null).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(true);
  });

  test('default() provides default values', () => {
    const schema = boolean().default(true);
    const validator = schema.toValidator();

    const result1 = validator.safeParse(false);
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.data).toBe(false);
    }

    const result2 = validator.safeParse(undefined);
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toBe(true);
    }
  });

  test('refine() allows custom validation', () => {
    // Only accept true
    const schema = boolean().refine(val => val === true, 'Value must be true');
    const validator = schema.toValidator();

    expect(validator.safeParse(true).success).toBe(true);
    expect(validator.safeParse(false).success).toBe(false);
  });
}); 