import { any } from '../src/schema/any';
import { object } from '../src/schema/object';
import { string } from '../src/schema/string';

describe('AnySchema', () => {
  test('validates any value without errors', () => {
    const schema = any();
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
    const schema = any();
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

  test('works with complex objects and nested structures', () => {
    const userSchema = object({
      id: string(),
      profile: any() // Can contain any data structure
    });

    const validator = userSchema.toValidator();

    // Test with various profile structures
    const simpleProfile = {
      id: 'user-123',
      profile: {
        name: 'Test User'
      }
    };

    const complexProfile = {
      id: 'user-456',
      profile: {
        name: 'Complex User',
        preferences: {
          theme: 'dark',
          notifications: true,
          recentSearches: ['query1', 'query2'],
          lastLogin: new Date()
        }
      }
    };

    expect(validator.safeParse(simpleProfile).success).toBe(true);
    expect(validator.safeParse(complexProfile).success).toBe(true);
  });

  test('parse method returns input directly', () => {
    const schema = any();
    const validator = schema.toValidator();

    const input = { key: 'value' };
    const result = validator.parse(input);

    expect(result).toBe(input);
  });

  test('validateAsync returns Promise with input value', async () => {
    const schema = any();
    const validator = schema.toValidator();

    const input = [1, 2, 3];
    const result = await validator.validateAsync(input);

    expect(result).toBe(input);
  });

  test('safeParse always returns success result', () => {
    const schema = any();
    const validator = schema.toValidator();

    // Even with unusual values, should always succeed
    const result1 = validator.safeParse(NaN);
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(isNaN(result1.data)).toBe(true);
    }

    const result2 = validator.safeParse(Infinity);
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toBe(Infinity);
    }
  });
}); 