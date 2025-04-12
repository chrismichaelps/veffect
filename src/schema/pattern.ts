/**
 * Pattern Schema implementation for ad-hoc validation based on runtime value inspection
 */
import { Schema, Validator, ValidationResult } from '../types';
import * as E from '../internal/effect';
import { CustomValidationError } from '../errors';

export interface PatternSchema<T> extends Schema<T> {
  readonly _tag: 'PatternSchema';
}

/**
 * Creates a schema that validates the input based on a pattern matching function
 * The pattern function can return different schemas based on runtime inspection of the input
 * 
 * @param patternFn A function that takes the input and returns an appropriate schema
 * @returns A schema that validates using dynamic schema selection based on input
 * 
 * @example
 * const responseSchema = pattern(input => {
 *   if (input.status === 'success') return object({ status: literal('success'), data: any() });
 *   if (input.status === 'error') return object({ status: literal('error'), message: string() });
 *   return invalid('Unknown response type');
 * });
 */
export function pattern<T>(patternFn: (input: unknown) => Schema<T> | InvalidResult): PatternSchema<T> {
  const schema: PatternSchema<T> = {
    _tag: 'PatternSchema',

    toValidator: (): Validator<T> => ({
      validate: (input, options): ValidationResult<T> => {
        // Get the appropriate schema based on the input
        const result = patternFn(input);

        // Handle case where pattern function returned an invalid result
        if (isInvalidResult(result)) {
          return E.fail(new CustomValidationError(
            result.message,
            options?.path
          ));
        }

        // Validate using the returned schema
        const validator = result.toValidator();
        return validator.validate(input, options);
      },

      parse: (input): T => {
        const result = E.runSync(E.either(schema.toValidator().validate(input)));
        if (E.isLeft(result)) {
          throw result.left;
        }
        return result.right;
      },

      safeParse: (input) => {
        const result = E.runSync(E.either(schema.toValidator().validate(input)));
        if (E.isLeft(result)) {
          return { success: false, error: result.left };
        }
        return { success: true, data: result.right };
      },

      validateAsync: async (input, options) => {
        return E.unwrapEither(E.runSync(
          E.either(schema.toValidator().validate(input, options))
        )) as T;
      }
    })
  };

  return schema;
}

/**
 * Interface for invalid results in pattern matching
 */
export interface InvalidResult {
  readonly _type: 'invalid';
  readonly message: string;
}

/**
 * Helper to create an invalid result with custom message
 */
export function invalid(message: string): InvalidResult {
  return {
    _type: 'invalid',
    message
  };
}

/**
 * Type guard for InvalidResult
 */
function isInvalidResult(value: any): value is InvalidResult {
  return value && value._type === 'invalid';
} 