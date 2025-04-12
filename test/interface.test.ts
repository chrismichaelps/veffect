/**
 * Test cases for the interface schema implementation
 */
import { string, number, boolean, array, object, interface_ } from '../src';

describe('Interface Schema', () => {
  describe('Basic functionality', () => {
    test('validates a simple interface schema', () => {
      const schema = interface_({
        name: string(),
        age: number(),
      });

      const validator = schema.toValidator();

      // Valid data
      const valid = validator.safeParse({ name: 'John', age: 30 });
      expect(valid.success).toBe(true);

      // Invalid data - missing required field
      const invalid1 = validator.safeParse({ name: 'John' });
      expect(invalid1.success).toBe(false);

      // Invalid data - wrong type
      const invalid2 = validator.safeParse({ name: 'John', age: 'thirty' as any });
      expect(invalid2.success).toBe(false);
    });

    test('handles optional keys with ? suffix', () => {
      const schema = interface_({
        name: string(),
        "age?": number(),
        "address?": string(),
      });

      const validator = schema.toValidator();

      // Valid with all fields
      const valid1 = validator.safeParse({
        name: 'John',
        age: 30,
        address: '123 Main St'
      });
      expect(valid1.success).toBe(true);

      // Valid with only required fields
      const valid2 = validator.safeParse({ name: 'John' });
      expect(valid2.success).toBe(true);

      // Valid with some optional fields
      const valid3 = validator.safeParse({ name: 'John', age: 30 });
      expect(valid3.success).toBe(true);

      // Invalid - missing required field
      const invalid = validator.safeParse({});
      expect(invalid.success).toBe(false);
    });
  });

  describe('Key vs Value optionality', () => {
    test('distinguishes between key optionality and value optionality', () => {
      // Key optional (property can be omitted)
      const keyOptionalSchema = interface_({
        "name?": string(),
      });

      // Value optional (property must exist but can be undefined)
      const valueOptionalSchema = interface_({
        name: string().optional(),
      });

      // Both validators
      const keyValidator = keyOptionalSchema.toValidator();
      const valueValidator = valueOptionalSchema.toValidator();

      // Test key optionality
      expect(keyValidator.safeParse({}).success).toBe(true);
      expect(keyValidator.safeParse({ name: 'John' }).success).toBe(true);
      expect(keyValidator.safeParse({ name: undefined }).success).toBe(false);

      // Test value optionality
      expect(valueValidator.safeParse({}).success).toBe(false);
      expect(valueValidator.safeParse({ name: 'John' }).success).toBe(true);
      expect(valueValidator.safeParse({ name: undefined }).success).toBe(true);
    });
  });

  describe('Edge cases', () => {
    test('handles empty objects', () => {
      const schema = interface_({});
      const validator = schema.toValidator();

      expect(validator.safeParse({}).success).toBe(true);

      // Check if extra fields are allowed
      const extraFieldsResult = validator.safeParse({ extra: 'field' });
      console.log("Extra fields test result:", extraFieldsResult);

      // Since we're not sure about the implementation yet, we'll verify the behavior
      // and then write an appropriate assertion based on the actual behavior
    });

    test('handles objects with all optional keys', () => {
      const schema = interface_({
        "name?": string(),
        "age?": number(),
        "address?": string(),
      });

      const validator = schema.toValidator();

      expect(validator.safeParse({}).success).toBe(true);
      expect(validator.safeParse({ name: 'John' }).success).toBe(true);
      expect(validator.safeParse({ age: 30 }).success).toBe(true);
      expect(validator.safeParse({ address: '123 Main St' }).success).toBe(true);
      expect(validator.safeParse({ name: 'John', age: 30 }).success).toBe(true);

      // Invalid types still fail
      expect(validator.safeParse({ name: 123 as any }).success).toBe(false);
    });

    test('handles keys with ? in the middle of the name', () => {
      const schema = interface_({
        'is?valid': string(), // This is a required field, not optional
      });

      const validator = schema.toValidator();

      expect(validator.safeParse({}).success).toBe(false);
      expect(validator.safeParse({ 'is?valid': 'yes' }).success).toBe(true);
    });

    test('does not confuse properties ending with ? in their key names', () => {
      const schema = interface_({
        'exists\\?': string(), // This should be a required field named exactly 'exists?'
        "optional?": string(), // This should be an optional field named 'optional'
      });

      const validator = schema.toValidator();

      // TEST 1: Empty object missing both fields
      // It should fail because 'exists?' is required
      const result1 = validator.safeParse({});
      expect(result1.success).toBe(false);
      if (!result1.success) {
        // The error should mention 'exists?' as missing
        expect(result1.error.message).toContain("exists?");
      }

      // TEST 2: Object with the required field
      expect(validator.safeParse({ 'exists?': 'yes' }).success).toBe(true);

      // TEST 3: Object with both fields
      expect(validator.safeParse({ 'exists?': 'yes', optional: 'value' }).success).toBe(true);

      // TEST 4: This should fail because the key is wrong - 'exists' vs 'exists?'
      expect(validator.safeParse({ exists: 'yes' }).success).toBe(false);
    });

    test('works with refinements', () => {
      const schema = interface_({
        name: string(),
        "age?": number(),
      }).refine(data => data.name.length > 3, 'Name must be longer than 3 characters');

      const validator = schema.toValidator();

      expect(validator.safeParse({ name: 'John' }).success).toBe(true);
      expect(validator.safeParse({ name: 'Jo' }).success).toBe(false);
    });

    test('works with transformations', () => {
      const schema = interface_({
        name: string(),
        "age?": number(),
      }).transform(data => ({
        ...data,
        nameUpper: data.name.toUpperCase(),
      }));

      const validator = schema.toValidator();

      const result = validator.safeParse({ name: 'John', age: 30 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nameUpper).toBe('JOHN');
      }
    });

    test('handles deeply nested object structures', () => {
      // Define a deeply nested but non-recursive structure
      const deepSchema = interface_({
        level1: interface_({
          value: string(),
          "level2?": interface_({
            value: string(),
            "level3?": interface_({
              value: string()
            })
          })
        })
      });

      const validator = deepSchema.toValidator();

      // Deep but valid nesting
      const deepData = {
        level1: {
          value: "1",
          level2: {
            value: "2",
            level3: {
              value: "3"
            }
          }
        }
      };

      expect(validator.safeParse(deepData).success).toBe(true);

      // Missing some optional nested objects is still valid
      const partialData = {
        level1: {
          value: "1",
          level2: {
            value: "2"
          }
        }
      };

      expect(validator.safeParse(partialData).success).toBe(true);
    });

    test('handles complex mixed key and value optionality', () => {
      const complexSchema = interface_({
        id: string(),
        name: string(),
        "metadata?": interface_({
          created: string(),
          "modified?": string(),
          tags: array(string()).optional(), // Value optional
          "notes?": array(string())         // Key optional
        })
      });

      const validator = complexSchema.toValidator();

      // Valid with all fields
      const validFull = {
        id: "123",
        name: "Test",
        metadata: {
          created: "2023-01-01",
          modified: "2023-01-02",
          tags: ["test", "example"],
          notes: ["Note 1", "Note 2"]
        }
      };
      expect(validator.safeParse(validFull).success).toBe(true);

      // Valid with missing optional keys
      const validPartial1 = {
        id: "123",
        name: "Test",
        metadata: {
          created: "2023-01-01",
          tags: ["test"]
          // missing modified (optional key)
          // missing notes (optional key)
        }
      };
      expect(validator.safeParse(validPartial1).success).toBe(true);

      // Valid with undefined optional values
      const validPartial2 = {
        id: "123",
        name: "Test",
        metadata: {
          created: "2023-01-01",
          tags: undefined // optional value can be undefined
        }
      };
      expect(validator.safeParse(validPartial2).success).toBe(true);

      // Invalid - missing required field
      const invalid1 = {
        id: "123",
        // missing name (required)
        metadata: {
          created: "2023-01-01"
        }
      };
      expect(validator.safeParse(invalid1).success).toBe(false);

      // Invalid - missing nested required field
      const invalid2 = {
        id: "123",
        name: "Test",
        metadata: {
          // missing created (required)
          modified: "2023-01-02"
        }
      };
      expect(validator.safeParse(invalid2).success).toBe(false);
    });
  });
});
