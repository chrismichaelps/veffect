/**
 * Array schema implementation
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
  NullableSchema
} from '../types';
import { createEffectValidator } from '../validator';
import { TypeValidationError, ArrayValidationError } from '../errors';

/**
 * Array schema interface
 */
export interface ArraySchema<T> extends
  Schema<T[]>,
  RefinableSchema<T[], ArraySchema<T>>,
  TransformableSchema<T[], ArraySchema<T>>,
  DefaultableSchema<T[], ArraySchema<T>>,
  NullableSchema<T[], ArraySchema<T>> {
  readonly _tag: 'ArraySchema';
  readonly elementSchema: Schema<T>;

  // Array specific validations
  readonly minLength: (min: number, message?: string) => ArraySchema<T>;
  readonly maxLength: (max: number, message?: string) => ArraySchema<T>;
  readonly length: (length: number, message?: string) => ArraySchema<T>;
}

/**
 * Create an array schema
 */
export function array<T>(elementSchema: Schema<T>): ArraySchema<T> {
  const validations: Array<(input: T[], options?: ValidatorOptions) => ValidationResult<T[]>> = [];

  const schema: ArraySchema<T> = {
    _tag: 'ArraySchema',
    elementSchema,

    minLength: (min, message) => {
      validations.push((input, options) =>
        input.length >= min
          ? E.succeed(input)
          : E.fail(new ArrayValidationError(
            message || `Array must contain at least ${min} elements`,
            [],
            options?.path
          ))
      );
      return schema;
    },

    maxLength: (max, message) => {
      validations.push((input, options) =>
        input.length <= max
          ? E.succeed(input)
          : E.fail(new ArrayValidationError(
            message || `Array must contain at most ${max} elements`,
            [],
            options?.path
          ))
      );
      return schema;
    },

    length: (length, message) => {
      validations.push((input, options) =>
        input.length === length
          ? E.succeed(input)
          : E.fail(new ArrayValidationError(
            message || `Array must contain exactly ${length} elements`,
            [],
            options?.path
          ))
      );
      return schema;
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

    // Transform implementation
    transform: <U>(transformer: (value: T[]) => U) => {
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
              ? (defaultValue as () => T[])()
              : defaultValue;
            return E.succeed(value);
          }
          return schema.toValidator().validate(input, options);
        })
      } as ArraySchema<T>;
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
      } as Schema<T[] | null>;
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

    toValidator: () => createEffectValidator((input, options) => {
      if (!Array.isArray(input)) {
        return E.fail(new TypeValidationError(
          'Value must be an array',
          'array',
          typeof input,
          options?.path
        ));
      }

      const elementValidator = elementSchema.toValidator();

      // Validate array elements sequentially for type safety
      const elementsWithIndex = input.map((element, index) => ({
        element,
        index
      }));

      return E.pipe(
        E.forEach(elementsWithIndex, ({ element, index }) => {
          const path = options?.path ? [...options.path, index.toString()] : [index.toString()];
          return E.map(
            elementValidator.validate(element, { ...options, path }),
            value => ({ index, value })
          );
        }),
        E.map(results =>
          results.map(result => result.value)
        ),
        (validArrayEffect: E.Effect<T[], ValidationError>) =>
          validations.reduce(
            (acc, validation) => E.flatMap(acc, val => validation(val, options)),
            validArrayEffect
          )
      );
    })
  };

  return schema;
} 