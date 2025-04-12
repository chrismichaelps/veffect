import { number } from '../src/schema/number';

describe('NumberSchema', () => {
  test('validates numbers', () => {
    const schema = number();
    const validator = schema.toValidator();

    // Valid cases
    expect(validator.safeParse(123).success).toBe(true);
    expect(validator.safeParse(0).success).toBe(true);
    expect(validator.safeParse(-123.45).success).toBe(true);

    // Invalid cases
    expect(validator.safeParse('123').success).toBe(false);
    expect(validator.safeParse(true).success).toBe(false);
    expect(validator.safeParse(null).success).toBe(false);
    expect(validator.safeParse(undefined).success).toBe(false);
  });

  test('min() validates minimum value', () => {
    const schema = number().min(5);
    const validator = schema.toValidator();

    expect(validator.safeParse(10).success).toBe(true);
    expect(validator.safeParse(5).success).toBe(true);
    expect(validator.safeParse(4.9).success).toBe(false);
  });

  test('max() validates maximum value', () => {
    const schema = number().max(5);
    const validator = schema.toValidator();

    expect(validator.safeParse(4).success).toBe(true);
    expect(validator.safeParse(5).success).toBe(true);
    expect(validator.safeParse(5.1).success).toBe(false);
  });

  test('integer() validates integer values', () => {
    const schema = number().integer();
    const validator = schema.toValidator();

    expect(validator.safeParse(42).success).toBe(true);
    expect(validator.safeParse(0).success).toBe(true);
    expect(validator.safeParse(-10).success).toBe(true);
    expect(validator.safeParse(3.14).success).toBe(false);
  });

  test('positive() validates positive values', () => {
    const schema = number().positive();
    const validator = schema.toValidator();

    expect(validator.safeParse(10).success).toBe(true);
    expect(validator.safeParse(0.1).success).toBe(true);
    expect(validator.safeParse(0).success).toBe(false);
    expect(validator.safeParse(-5).success).toBe(false);
  });

  test('negative() validates negative values', () => {
    const schema = number().negative();
    const validator = schema.toValidator();

    expect(validator.safeParse(-10).success).toBe(true);
    expect(validator.safeParse(-0.1).success).toBe(true);
    expect(validator.safeParse(0).success).toBe(false);
    expect(validator.safeParse(5).success).toBe(false);
  });

  test('nullable() accepts null values', () => {
    const schema = number().nullable();
    const validator = schema.toValidator();

    expect(validator.safeParse(42).success).toBe(true);
    expect(validator.safeParse(null).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(false);
  });

  test('optional() accepts undefined values', () => {
    const schema = number().optional();
    const validator = schema.toValidator();

    expect(validator.safeParse(42).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(true);
    expect(validator.safeParse(null).success).toBe(false);
  });

  test('default() provides default values', () => {
    const schema = number().default(42);
    const validator = schema.toValidator();

    const result1 = validator.safeParse(10);
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.data).toBe(10);
    }

    const result2 = validator.safeParse(undefined);
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toBe(42);
    }
  });

  test('combines multiple validations', () => {
    const schema = number().min(0).max(100).integer();
    const validator = schema.toValidator();

    expect(validator.safeParse(42).success).toBe(true);
    expect(validator.safeParse(0).success).toBe(true);
    expect(validator.safeParse(100).success).toBe(true);
    expect(validator.safeParse(-1).success).toBe(false);
    expect(validator.safeParse(101).success).toBe(false);
    expect(validator.safeParse(42.5).success).toBe(false);
  });
}); 