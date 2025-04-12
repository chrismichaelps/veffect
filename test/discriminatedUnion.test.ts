import { discriminatedUnion } from '../src/schema/discriminatedUnion';
import { object } from '../src/schema/object';
import { string } from '../src/schema/string';
import { number } from '../src/schema/number';
import { array } from '../src/schema/array';
import { literal } from '../src/schema/literal';
import { TypeValidationError, UnionValidationError } from '../src/errors';

describe('DiscriminatedUnionSchema', () => {
  // Define schemas for different types of users
  const adminSchema = object({
    role: literal('admin'),
    name: string(),
    permissions: array(string())
  });

  const userSchema = object({
    role: literal('user'),
    name: string(),
    age: number().min(18)
  });

  const guestSchema = object({
    role: literal('guest'),
    visitorId: string()
  });

  const userUnionSchema = discriminatedUnion('role', [
    adminSchema,
    userSchema,
    guestSchema
  ]);

  test('validates objects with correct discriminator and shape', () => {
    const validator = userUnionSchema.toValidator();

    // Valid cases
    expect(validator.safeParse({
      role: 'admin',
      name: 'Admin User',
      permissions: ['read', 'write']
    }).success).toBe(true);

    expect(validator.safeParse({
      role: 'user',
      name: 'Regular User',
      age: 25
    }).success).toBe(true);

    expect(validator.safeParse({
      role: 'guest',
      visitorId: 'visitor-123'
    }).success).toBe(true);
  });

  test('rejects non-object values', () => {
    const validator = userUnionSchema.toValidator();

    // Non-object cases
    const result1 = validator.safeParse('not an object');
    expect(result1.success).toBe(false);
    if (!result1.success) {
      expect(result1.error).toBeInstanceOf(TypeValidationError);
      expect(result1.error.message).toContain('Expected an object for discriminated union');
    }

    const result2 = validator.safeParse(null);
    expect(result2.success).toBe(false);
    if (!result2.success) {
      expect(result2.error).toBeInstanceOf(TypeValidationError);
    }

    const result3 = validator.safeParse(undefined);
    expect(result3.success).toBe(false);
    if (!result3.success) {
      expect(result3.error).toBeInstanceOf(TypeValidationError);
    }

    const result4 = validator.safeParse(123);
    expect(result4.success).toBe(false);
    if (!result4.success) {
      expect(result4.error).toBeInstanceOf(TypeValidationError);
    }
  });

  test('rejects objects without the discriminator property', () => {
    const validator = userUnionSchema.toValidator();

    const result = validator.safeParse({
      name: 'Missing Role User'
      // Missing 'role' property
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(TypeValidationError);
      expect(result.error.message).toContain("Expected object with 'role' property");
    }
  });

  test('rejects objects with unknown discriminator value', () => {
    const validator = userUnionSchema.toValidator();

    const result = validator.safeParse({
      role: 'unknown', // Not one of our defined roles
      name: 'Unknown User'
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(UnionValidationError);
      expect(result.error.message).toContain("No schema matched for discriminated union");
      expect(result.error.message).toContain("unknown");
    }
  });

  test('rejects objects with correct discriminator but invalid shape', () => {
    const validator = userUnionSchema.toValidator();

    // Admin missing permissions
    const adminResult = validator.safeParse({
      role: 'admin',
      name: 'Invalid Admin'
      // Missing permissions array
    });

    expect(adminResult.success).toBe(false);
    if (!adminResult.success) {
      expect(adminResult.error).toBeInstanceOf(UnionValidationError);
    }

    // User with age below minimum
    const userResult = validator.safeParse({
      role: 'user',
      name: 'Young User',
      age: 16 // Below minimum age
    });

    expect(userResult.success).toBe(false);
    if (!userResult.success) {
      expect(userResult.error).toBeInstanceOf(UnionValidationError);
    }

    // Guest missing visitorId
    const guestResult = validator.safeParse({
      role: 'guest'
      // Missing visitorId
    });

    expect(guestResult.success).toBe(false);
    if (!guestResult.success) {
      expect(guestResult.error).toBeInstanceOf(UnionValidationError);
    }
  });

  test('parse method throws on invalid data', () => {
    const validator = userUnionSchema.toValidator();

    expect(() => {
      validator.parse({
        role: 'unknown',
        name: 'Invalid User'
      });
    }).toThrow();

    expect(() => {
      validator.parse('not an object');
    }).toThrow();
  });

  test('parse method returns data on valid input', () => {
    const validator = userUnionSchema.toValidator();
    const adminData = {
      role: 'admin',
      name: 'Valid Admin',
      permissions: ['read']
    };

    const result = validator.parse(adminData);
    expect(result).toEqual(adminData);
  });

  test('validateAsync returns Promise with valid data', async () => {
    const validator = userUnionSchema.toValidator();
    const userData = {
      role: 'user',
      name: 'Async User',
      age: 30
    };

    const result = await validator.validateAsync(userData);
    expect(result).toEqual(userData);
  });

  test('validateAsync returns validation error on invalid data', async () => {
    const validator = userUnionSchema.toValidator();
    const invalidData = {
      role: 'unknown'
    };

    const result = await validator.validateAsync(invalidData) as any;
    expect(result._tag).toBe('UnionValidationError');
    expect(typeof result.message).toBe('string');
    expect(result.message).toContain('No schema matched for discriminated union');
  });
}); 