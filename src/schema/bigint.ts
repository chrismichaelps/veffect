/**
 * BigInt schema implementation
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
import { TypeValidationError, BigIntValidationError } from '../errors';

/**
 * BigInt schema interface
 */
export interface BigIntSchema extends
  Schema<bigint>,
  RefinableSchema<bigint, BigIntSchema>,
  TransformableSchema<bigint, BigIntSchema>,
  DefaultableSchema<bigint, BigIntSchema>,
  NullableSchema<bigint, BigIntSchema>,
  PredicateSchema<bigint, BigIntSchema>,
  CustomErrorsSchema<bigint, BigIntSchema> {
  readonly _tag: 'BigIntSchema';

  // BigInt specific validations
  readonly min: (min: bigint, message?: string) => BigIntSchema;
  readonly max: (max: bigint, message?: string) => BigIntSchema;
  readonly positive: (message?: string) => BigIntSchema;
  readonly negative: (message?: string) => BigIntSchema;
  readonly nonPositive: (message?: string) => BigIntSchema;
  readonly nonNegative: (message?: string) => BigIntSchema;
  readonly multipleOf: (value: bigint, message?: string) => BigIntSchema;
  readonly between: (min: bigint, max: bigint, message?: string) => BigIntSchema;
  readonly fromString: () => Schema<bigint>;
}

/**
 * Create a bigint schema
 */
export function bigint(): BigIntSchema {
  const validations: Array<(input: bigint, options?: ValidatorOptions) => ValidationResult<bigint>> = [];
  let errorMessage: string | undefined = undefined;

  const schema: BigIntSchema = {
    _tag: 'BigIntSchema',

    min: (min, message) => {
      validations.push((input, options) =>
        input >= min
          ? E.succeed(input)
          : E.fail(new BigIntValidationError(
            message || `BigInt must be at least ${min}`,
            options?.path
          ))
      );
      return schema;
    },

    max: (max, message) => {
      validations.push((input, options) =>
        input <= max
          ? E.succeed(input)
          : E.fail(new BigIntValidationError(
            message || `BigInt must be at most ${max}`,
            options?.path
          ))
      );
      return schema;
    },

    positive: (message) => {
      validations.push((input, options) =>
        input > BigInt(0)
          ? E.succeed(input)
          : E.fail(new BigIntValidationError(
            message || `BigInt must be positive`,
            options?.path
          ))
      );
      return schema;
    },

    negative: (message) => {
      validations.push((input, options) =>
        input < BigInt(0)
          ? E.succeed(input)
          : E.fail(new BigIntValidationError(
            message || `BigInt must be negative`,
            options?.path
          ))
      );
      return schema;
    },

    nonPositive: (message) => {
      validations.push((input, options) =>
        input <= BigInt(0)
          ? E.succeed(input)
          : E.fail(new BigIntValidationError(
            message || `BigInt must be non-positive`,
            options?.path
          ))
      );
      return schema;
    },

    nonNegative: (message) => {
      validations.push((input, options) =>
        input >= BigInt(0)
          ? E.succeed(input)
          : E.fail(new BigIntValidationError(
            message || `BigInt must be non-negative`,
            options?.path
          ))
      );
      return schema;
    },

    multipleOf: (value, message) => {
      validations.push((input, options) =>
        input % value === BigInt(0)
          ? E.succeed(input)
          : E.fail(new BigIntValidationError(
            message || `BigInt must be a multiple of ${value}`,
            options?.path
          ))
      );
      return schema;
    },

    between: (min, max, message) => {
      validations.push((input, options) =>
        input >= min && input <= max
          ? E.succeed(input)
          : E.fail(new BigIntValidationError(
            message || `BigInt must be between ${min} and ${max}`,
            options?.path
          ))
      );
      return schema;
    },

    fromString: () => {
      return {
        _tag: 'StringToBigIntSchema',
        toValidator: () => createEffectValidator((input, options) => {
          if (typeof input !== 'string') {
            return E.fail(new TypeValidationError(
              'Expected a string that can be converted to BigInt',
              'string',
              typeof input,
              options?.path
            ));
          }

          try {
            const bigIntValue = BigInt(input);
            return schema.toValidator().validate(bigIntValue, options);
          } catch (error) {
            return E.fail(new BigIntValidationError(
              `Could not convert string "${input}" to BigInt`,
              options?.path
            ));
          }
        })
      };
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
    transform: <U>(transformer: (value: bigint) => U) => {
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
      // Create a default validator function
      const defaultValidator = createEffectValidator((input, options) => {
        if (input === undefined) {
          const value = typeof defaultValue === 'function'
            ? (defaultValue as () => bigint)()
            : defaultValue;
          return E.succeed(value);
        }
        return schema.toValidator().validate(input, options);
      });

      // Return a new schema with all properties preserved
      return {
        ...schema,
        _tag: 'BigIntSchema',
        toValidator: () => defaultValidator
      };
    },

    // Nullable implementation
    nullable: () => {
      return {
        _tag: 'NullableSchema',
        toValidator: () => createEffectValidator((input, options) => {
          if (input === null) {
            return E.succeed(null);
          }
          return schema.toValidator().validate(input, options);
        })
      };
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
      // Type validation
      if (typeof input !== 'bigint') {
        return E.fail(new TypeValidationError(
          errorMessage || 'Value must be a BigInt',
          'bigint',
          typeof input,
          options?.path
        ));
      }

      // Apply validations
      return validations.reduce(
        (acc, validation) => E.flatMap(acc, val => validation(val, options)),
        E.succeed(input) as E.Effect<bigint, ValidationError>
      );
    })
  };

  return schema;
}
