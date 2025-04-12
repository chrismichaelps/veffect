import { pattern, invalid } from '../src/schema/pattern';
import { object } from '../src/schema/object';
import { string } from '../src/schema/string';
import { number } from '../src/schema/number';
import { literal } from '../src/schema/literal';
import { any } from '../src/schema/any';
import { CustomValidationError, TypeValidationError } from '../src/errors';
import * as E from '../src/internal/effect';

describe('PatternSchema', () => {
  // Define a basic pattern schema for API responses
  type ResponseType =
    | { status: 'success'; data: any }
    | { status: 'error'; message: string; code: string };

  const responseSchema = pattern<ResponseType>(input => {
    if (typeof input !== 'object' || input === null) {
      return invalid('Expected an object');
    }

    const status = (input as any).status;

    if (status === 'success') {
      return object({
        status: literal('success'),
        data: any()
      });
    }

    if (status === 'error') {
      return object({
        status: literal('error'),
        message: string(),
        code: string()
      });
    }

    return invalid(`Unknown status type: ${status}`);
  });

  test('validates data based on pattern matching', () => {
    const validator = responseSchema.toValidator();

    // Valid success response
    expect(validator.safeParse({
      status: 'success',
      data: { id: 123, name: 'Test' }
    }).success).toBe(true);

    // Valid error response
    expect(validator.safeParse({
      status: 'error',
      message: 'Something went wrong',
      code: 'ERR_SERVER'
    }).success).toBe(true);
  });

  test('rejects non-object values with custom message', () => {
    const validator = responseSchema.toValidator();

    const result = validator.safeParse('not an object');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CustomValidationError);
      expect(result.error.message).toBe('Expected an object');
    }
  });

  test('rejects objects with unknown patterns', () => {
    const validator = responseSchema.toValidator();

    const result = validator.safeParse({
      status: 'unknown',
      data: {}
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CustomValidationError);
      expect(result.error.message).toContain('Unknown status type: unknown');
    }
  });

  test('validates using returned schemas', () => {
    const validator = responseSchema.toValidator();

    // Invalid error response (missing required message)
    const result = validator.safeParse({
      status: 'error',
      code: 'ERR_SERVER'
      // Missing message field
    });

    expect(result.success).toBe(false);
  });

  test('path is correctly propagated in validation errors', () => {
    // Create schema that uses pattern to validate age restrictions
    type ContentType = { type: string; title: string; age?: number };

    const contentSchema = pattern<ContentType>(input => {
      if (typeof input !== 'object' || input === null) {
        return invalid('Expected an object');
      }

      const contentType = (input as any).type;
      const age = (input as any).age;

      if (contentType === 'adult' && (typeof age !== 'number' || age < 18)) {
        return invalid('Adult content requires age >= 18');
      }

      return object({
        type: string(),
        title: string(),
        age: number().optional()
      });
    });

    const validator = contentSchema.toValidator();

    // Test with custom path
    const options = { path: ['content', '0'] };
    const result = validator.validate({
      type: 'adult',
      age: 16
    }, options);

    // Use Effect's either function to get a result we can check
    const either = E.runSync(E.either(result));
    expect(E.isLeft(either)).toBe(true);

    if (E.isLeft(either)) {
      const error = either.left;
      expect(error.path).toEqual(['content', '0']);
    }
  });

  test('parse method throws on invalid data', () => {
    const validator = responseSchema.toValidator();

    expect(() => {
      validator.parse({
        status: 'unknown'
      });
    }).toThrow();

    expect(() => {
      validator.parse('not an object');
    }).toThrow();
  });

  test('parse method returns data on valid input', () => {
    const validator = responseSchema.toValidator();
    const successData = {
      status: 'success',
      data: { result: 'ok' }
    };

    const result = validator.parse(successData);
    expect(result).toEqual(successData);
  });

  test('validateAsync returns Promise with valid data', async () => {
    const validator = responseSchema.toValidator();
    const errorData = {
      status: 'error',
      message: 'Async error test',
      code: 'ASYNC_ERR'
    };

    const result = await validator.validateAsync(errorData);
    expect(result).toEqual(errorData);
  });

  test('validateAsync returns validation error on invalid data', async () => {
    const validator = responseSchema.toValidator();
    const invalidData = {
      status: 'unknown'
    };

    // The expected behavior is that it returns the error object directly
    const result = await validator.validateAsync(invalidData) as any;
    expect(result._tag).toBe('CustomValidationError');
    expect(typeof result.message).toBe('string');
    expect(result.message).toContain('Unknown status type: unknown');
  });

  test('complex pattern matching with multiple conditions', () => {
    // Create a schema that validates different number formats
    const numberFormatSchema = pattern<number | string>(input => {
      if (typeof input === 'number') {
        return number();
      }

      if (typeof input === 'string') {
        if (/^\d+$/.test(input)) {
          // String containing only digits
          return string().transform(val => parseInt(val, 10));
        }

        if (/^0x[0-9A-Fa-f]+$/.test(input)) {
          // Hexadecimal format
          return string().transform(val => parseInt(val, 16));
        }
      }

      return invalid('Expected a number or a string containing a number');
    });

    const validator = numberFormatSchema.toValidator();

    // Test direct number
    const result1 = validator.safeParse(42);
    expect(result1.success).toBe(true);

    // Test decimal string
    const result2 = validator.safeParse('123');
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toBe(123);
    }

    // Test hex string
    const result3 = validator.safeParse('0xFF');
    expect(result3.success).toBe(true);
    if (result3.success) {
      expect(result3.data).toBe(255);
    }

    // Test invalid input
    const result4 = validator.safeParse('not a number');
    expect(result4.success).toBe(false);
  });
}); 