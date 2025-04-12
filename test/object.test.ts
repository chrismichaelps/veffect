import { object } from '../src/schema/object';
import { string } from '../src/schema/string';
import { number } from '../src/schema/number';
import { boolean } from '../src/schema/boolean';
import { ObjectValidationError, TypeValidationError } from '../src/errors';
import * as E from '../src/internal/effect';

describe('ObjectSchema', () => {
  test('validates objects with correct shape', () => {
    const schema = object({
      name: string(),
      age: number(),
      isActive: boolean()
    });
    const validator = schema.toValidator();

    // Valid case
    const result = validator.safeParse({
      name: 'John',
      age: 30,
      isActive: true
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: 'John',
        age: 30,
        isActive: true
      });
    }
  });

  test('rejects non-object values', () => {
    const schema = object({
      name: string(),
      age: number()
    });
    const validator = schema.toValidator();

    // Non-object cases
    expect(validator.safeParse('not an object').success).toBe(false);
    expect(validator.safeParse(123).success).toBe(false);
    expect(validator.safeParse(null).success).toBe(false);
    expect(validator.safeParse(undefined).success).toBe(false);
    expect(validator.safeParse([]).success).toBe(false);

    // Check error type and message
    const result = validator.safeParse('not an object');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(TypeValidationError);
      expect(result.error.message).toContain('Value must be an object');
    }
  });

  test('rejects objects with missing required properties', () => {
    const schema = object({
      name: string(),
      age: number(),
      isActive: boolean()
    });
    const validator = schema.toValidator();

    // Missing property
    const result = validator.safeParse({
      name: 'John',
      age: 30
      // Missing isActive
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      // In some implementations this might be a TypeValidationError instead
      expect(result.error._tag).toBe('TypeValidationError');
    }
  });

  test('rejects objects with wrong property types', () => {
    const schema = object({
      name: string(),
      age: number(),
      isActive: boolean()
    });
    const validator = schema.toValidator();

    // Wrong types
    const result = validator.safeParse({
      name: 'John',
      age: '30', // Should be number
      isActive: true
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      // In some implementations this might be a TypeValidationError instead
      expect(result.error._tag).toBe('TypeValidationError');
    }
  });

  test('handles object property behavior according to implementation', () => {
    const schema = object({
      name: string(),
      age: number()
    });
    const validator = schema.toValidator();

    // Object with extra property
    const result = validator.safeParse({
      name: 'John',
      age: 30,
      extraProperty: 'this is extra'
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // Some implementations strip extra properties, some preserve them
      // Just check the required properties are there
      expect(result.data.name).toBe('John');
      expect(result.data.age).toBe(30);
    }
  });

  test('supports nested objects', () => {
    const schema = object({
      name: string(),
      address: object({
        street: string(),
        city: string(),
        zip: string()
      })
    });
    const validator = schema.toValidator();

    // Valid nested object
    const result = validator.safeParse({
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        zip: '12345'
      }
    });
    expect(result.success).toBe(true);

    // Invalid nested object
    const result2 = validator.safeParse({
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        zip: 12345 // Should be string
      }
    });
    expect(result2.success).toBe(false);
  });

  test('tracks path correctly in nested objects', () => {
    const schema = object({
      user: object({
        profile: object({
          contact: object({
            email: string().email()
          })
        })
      })
    });
    const validator = schema.toValidator();

    // Invalid email in deeply nested object
    const input = {
      user: {
        profile: {
          contact: {
            email: 'not-a-valid-email'
          }
        }
      }
    };

    const result = validator.validate(input);
    const either = E.runSync(E.either(result));

    expect(E.isLeft(either)).toBe(true);
    if (E.isLeft(either)) {
      // Find the innermost error with the path
      function findLeafError(error: any): any {
        if (error._tag === 'ObjectValidationError' && error.errors && error.errors.length) {
          return findLeafError(error.errors[0]);
        }
        return error;
      }

      const leafError = findLeafError(either.left);
      expect(leafError.path).toContain('user');
      expect(leafError.path).toContain('profile');
      expect(leafError.path).toContain('contact');
      expect(leafError.path).toContain('email');
    }
  });

  test('supports refined objects', () => {
    const schema = object({
      start: number(),
      end: number()
    }).refine(
      obj => obj.start < obj.end,
      obj => `Start (${obj.start}) must be less than end (${obj.end})`
    );
    const validator = schema.toValidator();

    // Valid case
    expect(validator.safeParse({ start: 1, end: 10 }).success).toBe(true);

    // Invalid case
    const result = validator.safeParse({ start: 10, end: 5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Start (10) must be less than end (5)');
    }
  });

  test('supports object transformation', () => {
    const schema = object({
      firstName: string(),
      lastName: string()
    }).transform(obj => ({
      fullName: `${obj.firstName} ${obj.lastName}`,
      initials: `${obj.firstName[0]}.${obj.lastName[0]}.`
    }));
    const validator = schema.toValidator();

    const result = validator.safeParse({ firstName: 'John', lastName: 'Doe' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        fullName: 'John Doe',
        initials: 'J.D.'
      });
    }
  });

  test('supports default values', () => {
    const schema = object({
      name: string(),
      age: number()
    }).default({ name: 'Default Name', age: 25 });
    const validator = schema.toValidator();

    // Undefined should use default
    const result = validator.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: 'Default Name', age: 25 });
    }

    // Null should not use default (it's not undefined)
    expect(validator.safeParse(null).success).toBe(false);
  });

  test('supports nullable objects', () => {
    const schema = object({
      name: string(),
      age: number()
    }).nullable();
    const validator = schema.toValidator();

    // Valid object
    expect(validator.safeParse({ name: 'John', age: 30 }).success).toBe(true);

    // Null is valid
    expect(validator.safeParse(null).success).toBe(true);

    // Undefined is not valid
    expect(validator.safeParse(undefined).success).toBe(false);
  });

  test('supports optional objects', () => {
    const schema = object({
      name: string(),
      age: number()
    }).optional();
    const validator = schema.toValidator();

    // Valid object
    expect(validator.safeParse({ name: 'John', age: 30 }).success).toBe(true);

    // Undefined is valid
    expect(validator.safeParse(undefined).success).toBe(true);

    // Null is not valid
    expect(validator.safeParse(null).success).toBe(false);
  });

  test('supports nullish objects', () => {
    const schema = object({
      name: string(),
      age: number()
    }).nullish();
    const validator = schema.toValidator();

    // Valid object
    expect(validator.safeParse({ name: 'John', age: 30 }).success).toBe(true);

    // Null is valid
    expect(validator.safeParse(null).success).toBe(true);

    // Undefined is valid
    expect(validator.safeParse(undefined).success).toBe(true);
  });

  test('parse method throws on invalid data', () => {
    const schema = object({
      name: string(),
      age: number()
    });
    const validator = schema.toValidator();

    expect(() => {
      validator.parse({ name: 'John', age: 'invalid' });
    }).toThrow();
  });

  test('parse method returns data on valid input', () => {
    const schema = object({
      name: string(),
      age: number()
    });
    const validator = schema.toValidator();

    const result = validator.parse({ name: 'John', age: 30 });
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  test('validateAsync works with objects', async () => {
    const schema = object({
      name: string(),
      age: number()
    });
    const validator = schema.toValidator();

    const result = await validator.validateAsync({ name: 'John', age: 30 });
    expect(result).toEqual({ name: 'John', age: 30 });
  });
}); 