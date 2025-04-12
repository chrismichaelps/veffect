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

    validateAsync: async (input: I, options?: ValidatorOptions): Promise<T> => {
      try {
        // First try to validate synchronously
        const syncResult = validateFn(input, options);

        // If validation immediately succeeds or fails, return that result
        const syncExit = E.runSyncExit(syncResult);

        if (E.isSuccess(syncExit)) {
          return syncExit.value;
        }

        // Handle async validation using Promise
        return await E.runPromise(syncResult);
      } catch (err) {
        // Any errors should be converted to ValidationError format
        const error = err as Error;
        if (err && typeof err === 'object' && '_tag' in err) {
          throw err; // Already a ValidationError
        }

        // Convert generic Error to ValidationError format
        throw {
          _tag: 'RefinementValidationError',
          message: error.message || 'Async validation failed',
          path: options?.path
        } as ValidationError;
      }
    }
  };
}

/**
 * Create an Effect-based validator
 */
export function createEffectValidator<T, I = unknown>(
  validateFn: (input: I, options?: ValidatorOptions) => ValidationResult<T>
): Validator<T, I> {
  return createBaseValidator(validateFn);
}
