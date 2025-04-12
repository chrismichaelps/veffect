import { optional } from '../src/schema/optional';
import { string } from '../src/schema/string';
import { number } from '../src/schema/number';
import { boolean } from '../src/schema/boolean';
import { object } from '../src/schema/object';
import { TypeValidationError } from '../src/errors';
import * as E from '../src/internal/effect';

describe('OptionalSchema', () => {
  test('makes schema accept undefined values', () => {
    const schema = optional(string());
    const validator = schema.toValidator();

    // Valid string value
    const result1 = validator.safeParse('test');
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.data).toBe('test');
    }

    // Valid undefined
    const result2 = validator.safeParse(undefined);
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toBe(undefined);
    }

    // Invalid value (still validates the inner schema)
    const result3 = validator.safeParse(123);
    expect(result3.success).toBe(false);
    if (!result3.success) {
      expect(result3.error).toBeInstanceOf(TypeValidationError);
    }

    // Null is still invalid
    const result4 = validator.safeParse(null);
    expect(result4.success).toBe(false);
  });

  test('works with different base schema types', () => {
    // Test with number
    const numSchema = optional(number());
    expect(numSchema.toValidator().safeParse(42).success).toBe(true);
    expect(numSchema.toValidator().safeParse(undefined).success).toBe(true);
    expect(numSchema.toValidator().safeParse('42').success).toBe(false);

    // Test with boolean
    const boolSchema = optional(boolean());
    expect(boolSchema.toValidator().safeParse(true).success).toBe(true);
    expect(boolSchema.toValidator().safeParse(undefined).success).toBe(true);
    expect(boolSchema.toValidator().safeParse('true').success).toBe(false);

    // Test with object
    const objSchema = optional(object({ name: string() }));
    expect(objSchema.toValidator().safeParse({ name: 'test' }).success).toBe(true);
    expect(objSchema.toValidator().safeParse(undefined).success).toBe(true);
    expect(objSchema.toValidator().safeParse({ name: 123 }).success).toBe(false);
  });

  test('preserves base schema validations when value is provided', () => {
    const schema = optional(string().minLength(5));
    const validator = schema.toValidator();

    // Valid undefined
    expect(validator.safeParse(undefined).success).toBe(true);

    // Valid string
    expect(validator.safeParse('valid string').success).toBe(true);

    // Invalid string (too short)
    expect(validator.safeParse('test').success).toBe(false);
  });

  test('supports chaining with other modifiers', () => {
    // String that's optional and has validation
    const schema = optional(string().email());
    const validator = schema.toValidator();

    expect(validator.safeParse('user@example.com').success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(true);
    expect(validator.safeParse('not-an-email').success).toBe(false);
  });

  test('is equivalent to .optional() method on schemas', () => {
    // These two should be functionally equivalent
    const schema1 = optional(string());
    const schema2 = string().optional();

    const validator1 = schema1.toValidator();
    const validator2 = schema2.toValidator();

    // Both should accept string and undefined
    expect(validator1.safeParse('test').success).toBe(true);
    expect(validator2.safeParse('test').success).toBe(true);
    expect(validator1.safeParse(undefined).success).toBe(true);
    expect(validator2.safeParse(undefined).success).toBe(true);

    // Both should reject number and null
    expect(validator1.safeParse(123).success).toBe(false);
    expect(validator2.safeParse(123).success).toBe(false);
    expect(validator1.safeParse(null).success).toBe(false);
    expect(validator2.safeParse(null).success).toBe(false);
  });

  test('tracks path correctly in validation errors', () => {
    const schema = optional(string());
    const validator = schema.toValidator();

    // Test with invalid value and custom path
    const result = validator.validate(123, { path: ['field'] });
    const either = E.runSync(E.either(result));

    expect(E.isLeft(either)).toBe(true);
    if (E.isLeft(either)) {
      const error = either.left;
      expect(error.path).toEqual(['field']);
    }
  });

  test('works with optional fields in objects', () => {
    const userSchema = object({
      name: string(),
      email: optional(string().email())
    });
    const validator = userSchema.toValidator();

    // Valid with all fields
    const result1 = validator.safeParse({
      name: 'John',
      email: 'john@example.com'
    });
    expect(result1.success).toBe(true);

    // Valid with optional field omitted
    const result2 = validator.safeParse({
      name: 'John'
    });
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toEqual({
        name: 'John'
      });
    }

    // Valid with undefined optional field
    const result3 = validator.safeParse({
      name: 'John',
      email: undefined
    });
    expect(result3.success).toBe(true);

    // Invalid with wrong type for optional field
    const result4 = validator.safeParse({
      name: 'John',
      email: 123
    });
    expect(result4.success).toBe(false);
  });

  test('parse method works correctly', () => {
    const schema = optional(string());
    const validator = schema.toValidator();

    expect(validator.parse('test')).toBe('test');
    expect(validator.parse(undefined)).toBe(undefined);

    expect(() => {
      validator.parse(123);
    }).toThrow();
  });

  test('validateAsync works correctly', async () => {
    const schema = optional(string());
    const validator = schema.toValidator();

    const result1 = await validator.validateAsync('test');
    expect(result1).toBe('test');

    const result2 = await validator.validateAsync(undefined);
    expect(result2).toBe(undefined);
  });

  test('supports optional with transformation', () => {
    const schema = optional(string().transform(val => val.toUpperCase()));
    const validator = schema.toValidator();

    // Regular value gets transformed
    const result1 = validator.safeParse('test');
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.data).toBe('TEST');
    }

    // Undefined stays undefined
    const result2 = validator.safeParse(undefined);
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toBe(undefined);
    }
  });
}); 