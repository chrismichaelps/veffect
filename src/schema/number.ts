/**
 * Number schema implementation
 */
import * as E from '../internal/effect';
import {
  Schema,
  Validator,
  ValidatorOptions,
  ValidationResult,
  ValidationError,
  RefinableSchema,
  TransformableSchema,
  DefaultableSchema,
  NullableSchema,
  PredicateSchema,
  CustomErrorsSchema
} from '../types';
import { createEffectValidator } from '../validator';
import { TypeValidationError, NumberValidationError } from '../errors';

/**
 * Number schema interface
 */
export interface NumberSchema extends
  Schema<number>,
  RefinableSchema<number, NumberSchema>,
  TransformableSchema<number, NumberSchema>,
  DefaultableSchema<number, NumberSchema>,
  NullableSchema<number, NumberSchema>,
  PredicateSchema<number, NumberSchema>,
  CustomErrorsSchema<number, NumberSchema> {
  readonly _tag: 'NumberSchema';

  // Number specific validations
  readonly min: (min: number, message?: string) => NumberSchema;
  readonly max: (max: number, message?: string) => NumberSchema;
  readonly integer: (message?: string) => NumberSchema;
  readonly positive: (message?: string) => NumberSchema;
  readonly negative: (message?: string) => NumberSchema;
  readonly nonnegative: (message?: string) => NumberSchema;
  readonly nonpositive: (message?: string) => NumberSchema;
  readonly multipleOf: (value: number, message?: string) => NumberSchema;
  readonly finite: (message?: string) => NumberSchema;
  readonly safe: (message?: string) => NumberSchema;
  readonly step: (step: number, message?: string) => NumberSchema;
  readonly port: (message?: string) => NumberSchema;
}

/**
 * Create a number schema
 */
export function number(): NumberSchema {
  const validations: Array<(input: number, options?: ValidatorOptions) => ValidationResult<number>> = [];
  let errorMessage: string | undefined = undefined;

  const schema: NumberSchema = {
    _tag: 'NumberSchema',

    min: (min, message) => {
      validations.push((input, options) =>
        input >= min
          ? E.succeed(input)
          : E.fail(new NumberValidationError(
            message || `Number must be at least ${min}`,
            options?.path
          ))
      );
      return schema;
    },

    max: (max, message) => {
      validations.push((input, options) =>
        input <= max
          ? E.succeed(input)
          : E.fail(new NumberValidationError(
            message || `Number must be at most ${max}`,
            options?.path
          ))
      );
      return schema;
    },

    integer: (message) => {
      validations.push((input, options) =>
        Number.isInteger(input)
          ? E.succeed(input)
          : E.fail(new NumberValidationError(
            message || `Number must be an integer`,
            options?.path
          ))
      );
      return schema;
    },

    positive: (message) => {
      validations.push((input, options) =>
        input > 0
          ? E.succeed(input)
          : E.fail(new NumberValidationError(
            message || `Number must be positive`,
            options?.path
          ))
      );
      return schema;
    },

    negative: (message) => {
      validations.push((input, options) =>
        input < 0
          ? E.succeed(input)
          : E.fail(new NumberValidationError(
            message || `Number must be negative`,
            options?.path
          ))
      );
      return schema;
    },

    nonnegative: (message) => {
      validations.push((input, options) =>
        input >= 0
          ? E.succeed(input)
          : E.fail(new NumberValidationError(
            message || `Number must be non-negative`,
            options?.path
          ))
      );
      return schema;
    },

    nonpositive: (message) => {
      validations.push((input, options) =>
        input <= 0
          ? E.succeed(input)
          : E.fail(new NumberValidationError(
            message || `Number must be non-positive`,
            options?.path
          ))
      );
      return schema;
    },

    multipleOf: (value, message) => {
      validations.push((input, options) => {
        // Handle floating point precision issues
        const remainder = (input / value) % 1;
        const isMultiple = remainder < Number.EPSILON || remainder > 1 - Number.EPSILON;

        return isMultiple
          ? E.succeed(input)
          : E.fail(new NumberValidationError(
            message || `Number must be a multiple of ${value}`,
            options?.path
          ));
      });
      return schema;
    },

    finite: (message) => {
      validations.push((input, options) =>
        Number.isFinite(input)
          ? E.succeed(input)
          : E.fail(new NumberValidationError(
            message || `Number must be finite`,
            options?.path
          ))
      );
      return schema;
    },

    safe: (message) => {
      validations.push((input, options) =>
        Number.isSafeInteger(input) || (Number.isFinite(input) && !Number.isInteger(input))
          ? E.succeed(input)
          : E.fail(new NumberValidationError(
            message || `Number must be a safe number`,
            options?.path
          ))
      );
      return schema;
    },

    step: (step, message) => {
      return schema.multipleOf(step, message || `Number must be a multiple of ${step}`);
    },

    port: (message) => {
      return schema
        .integer(message || 'Port must be an integer')
        .min(1, message || 'Port must be at least 1')
        .max(65535, message || 'Port must be at most 65535');
    },

    // Refinement implementation
    refine: (refinement, message) => {
      validations.push((input, options) =>
        refinement(input)
          ? E.succeed(input)
          : E.fail({
            _tag: 'RefinementValidationError',
            message: typeof message === 'function'
              ? message(input)
              : message || 'Failed refinement',
            path: options?.path
          })
      );
      return schema;
    },

    // Predicate implementation (alias for refine)
    predicate: (predicate, message) => {
      return schema.refine(predicate, message);
    },

    // Transform implementation
    transform: <U>(transformer: (value: number) => U) => {
      return {
        _tag: 'TransformedSchema',
        toValidator: () => createEffectValidator((input, options) => {
          return E.pipe(
            schema.toValidator().validate(input, options),
            E.map(value => transformer(value))
          );
        })
      };
    },

    // Default value implementation
    default: (defaultValue) => {
      return {
        ...schema,
        toValidator: () => createEffectValidator((input, options) => {
          if (input === undefined) {
            const value = typeof defaultValue === 'function'
              ? (defaultValue as () => number)()
              : defaultValue;
            return E.succeed(value);
          }
          return schema.toValidator().validate(input, options);
        })
      } as NumberSchema;
    },

    // Nullable implementation
    nullable: () => {
      return {
        ...schema,
        toValidator: () => createEffectValidator((input, options) => {
          if (input === null) {
            return E.succeed(null);
          }
          return schema.toValidator().validate(input, options);
        })
      } as Schema<number | null>;
    },

    // Optional implementation
    optional: () => {
      return {
        _tag: 'OptionalSchema',
        toValidator: () => createEffectValidator((input, options) => {
          if (input === undefined) {
            return E.succeed(undefined);
          }
          return schema.toValidator().validate(input, options);
        })
      };
    },

    // Nullish implementation
    nullish: () => {
      return {
        _tag: 'NullishSchema',
        toValidator: () => createEffectValidator((input, options) => {
          if (input === null || input === undefined) {
            return E.succeed(input);
          }
          return schema.toValidator().validate(input, options);
        })
      };
    },

    // Custom error message
    error: (message) => {
      errorMessage = message;
      return schema;
    },

    toValidator: () => createEffectValidator((input, options) => {
      if (typeof input !== 'number' || Number.isNaN(input)) {
        return E.fail(new TypeValidationError(
          errorMessage || 'Value must be a number',
          'number',
          typeof input,
          options?.path
        ));
      }

      return validations.reduce(
        (acc, validation) => E.flatMap(acc, val => validation(val, options)),
        E.succeed(input) as E.Effect<number, ValidationError>
      );
    })
  };

  return schema;
} 