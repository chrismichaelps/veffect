import { literal } from '../src/schema/literal';
import { TypeValidationError } from '../src/errors';
import * as E from '../src/internal/effect';

describe('LiteralSchema', () => {
  test('validates string literals', () => {
    const schema = literal('admin');
    const validator = schema.toValidator();

    // Valid case
    const result = validator.safeParse('admin');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('admin');
    }

    // Invalid cases
    expect(validator.safeParse('user').success).toBe(false);
    expect(validator.safeParse('ADMIN').success).toBe(false);
    expect(validator.safeParse(123).success).toBe(false);
    expect(validator.safeParse(null).success).toBe(false);
    expect(validator.safeParse(undefined).success).toBe(false);

    // Check error type and message
    const invalidResult = validator.safeParse('user');
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.error).toBeInstanceOf(TypeValidationError);
      expect(invalidResult.error.message).toContain('Expected literal value: admin');
    }
  });

  test('validates number literals', () => {
    const schema = literal(42);
    const validator = schema.toValidator();

    // Valid case
    expect(validator.safeParse(42).success).toBe(true);

    // Invalid cases
    expect(validator.safeParse(43).success).toBe(false);
    expect(validator.safeParse('42').success).toBe(false);
    expect(validator.safeParse(null).success).toBe(false);
  });

  test('validates boolean literals', () => {
    const trueSchema = literal(true);
    const falseSchema = literal(false);

    // Valid cases
    expect(trueSchema.toValidator().safeParse(true).success).toBe(true);
    expect(falseSchema.toValidator().safeParse(false).success).toBe(true);

    // Invalid cases
    expect(trueSchema.toValidator().safeParse(false).success).toBe(false);
    expect(falseSchema.toValidator().safeParse(true).success).toBe(false);
    expect(trueSchema.toValidator().safeParse('true').success).toBe(false);
    expect(falseSchema.toValidator().safeParse(0).success).toBe(false);
  });

  test('validates null literals', () => {
    const schema = literal(null);
    const validator = schema.toValidator();

    // Valid case
    expect(validator.safeParse(null).success).toBe(true);

    // Invalid cases
    expect(validator.safeParse(undefined).success).toBe(false);
    expect(validator.safeParse('null').success).toBe(false);
    expect(validator.safeParse(0).success).toBe(false);
  });

  test('validates undefined literals', () => {
    const schema = literal(undefined);
    const validator = schema.toValidator();

    // Valid case
    expect(validator.safeParse(undefined).success).toBe(true);

    // Invalid cases
    expect(validator.safeParse(null).success).toBe(false);
    expect(validator.safeParse('undefined').success).toBe(false);
  });

  test('tracks path correctly in validation errors', () => {
    const schema = literal('admin');
    const validator = schema.toValidator();

    // Test with custom path
    const result = validator.validate('user', { path: ['role'] });
    const either = E.runSync(E.either(result));

    expect(E.isLeft(either)).toBe(true);
    if (E.isLeft(either)) {
      const error = either.left;
      expect(error.path).toEqual(['role']);
    }
  });

  test('supports refinement', () => {
    // Not a very practical example since literals are already exact values,
    // but testing the API is available and works
    const schema = literal('admin').refine(
      value => value.length > 3,
      'Value must be longer than 3 characters'
    );
    const validator = schema.toValidator();

    expect(validator.safeParse('admin').success).toBe(true);
  });

  test('supports transformation', () => {
    const schema = literal('admin').transform(value => ({ role: value, isAdmin: true }));
    const validator = schema.toValidator();

    const result = validator.safeParse('admin');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ role: 'admin', isAdmin: true });
    }
  });

  test('supports default values', () => {
    // Create a literal schema with default value
    const schema = literal('admin') as any; // Cast to any to bypass type checking for the test
    const schemaWithDefault = schema.default('user');
    const validator = schemaWithDefault.toValidator();

    // When undefined, use default
    const result = validator.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('user');
    }
  });

  test('supports nullable literals', () => {
    const schema = literal('admin').nullable();
    const validator = schema.toValidator();

    // Both original value and null should be valid
    expect(validator.safeParse('admin').success).toBe(true);
    expect(validator.safeParse(null).success).toBe(true);

    // Other values still invalid
    expect(validator.safeParse('user').success).toBe(false);
    expect(validator.safeParse(undefined).success).toBe(false);
  });

  test('supports optional literals', () => {
    const schema = literal('admin').optional();
    const validator = schema.toValidator();

    // Both original value and undefined should be valid
    expect(validator.safeParse('admin').success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(true);

    // Other values still invalid
    expect(validator.safeParse('user').success).toBe(false);
    expect(validator.safeParse(null).success).toBe(false);
  });

  test('supports nullish literals', () => {
    const schema = literal('admin').nullish();
    const validator = schema.toValidator();

    // Original value, null, and undefined should be valid
    expect(validator.safeParse('admin').success).toBe(true);
    expect(validator.safeParse(null).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(true);

    // Other values still invalid
    expect(validator.safeParse('user').success).toBe(false);
  });

  test('parse method throws on invalid data', () => {
    const schema = literal('admin');
    const validator = schema.toValidator();

    expect(() => {
      validator.parse('user');
    }).toThrow();
  });

  test('parse method returns data on valid input', () => {
    const schema = literal('admin');
    const validator = schema.toValidator();

    const result = validator.parse('admin');
    expect(result).toBe('admin');
  });

  test('validateAsync works with literals', async () => {
    const schema = literal('admin');
    const validator = schema.toValidator();

    const result = await validator.validateAsync('admin');
    expect(result).toBe('admin');
  });
}); 