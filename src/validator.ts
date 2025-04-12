/**
 * Base validator implementation
 */
import * as E from './internal/effect';
import { ValidationError, ValidationResult, Validator, ValidatorOptions } from './types';

/**
 * Create a base validator with common functionalities
 */
export function createBaseValidator<T, I = unknown>(
  validateFn: (input: I, options?: ValidatorOptions) => ValidationResult<T>
): Validator<T, I> {
  return {
    validate: validateFn,

    parse: (input: I): T => {
      return E.runSync(
        E.orDie(
          validateFn(input)
        )
      );
    },

    safeParse: (input: I) => {
      const result = E.runSyncExit(validateFn(input));

      if (E.isSuccess(result)) {
        return {
          success: true,
          data: result.value
        };
      } else {
        const failureOption = E.failureOption(result.cause);
        const error = E.getOrElse(failureOption, () => ({
          _tag: 'UnknownValidationError',
          message: 'An unknown validation error occurred'
        } as ValidationError));

        return {
          success: false,
          error
        };
      }
    },

    validateAsync: (input: I, options?: ValidatorOptions): Promise<T> => {
      return E.runPromise(validateFn(input, options));
    }
  };
}

/**
 * Create a validator that validates using an Effect
 */
export function createEffectValidator<T, E extends ValidationError, I = unknown>(
  effectFn: (input: I, options?: ValidatorOptions) => E.Effect<T, E>
): Validator<T, I> {
  return createBaseValidator((input, options) => effectFn(input, options));
} 