/**
 * Tuple schema implementation
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
import { TypeValidationError, TupleValidationError } from '../errors';

/**
 * Helper type to infer tuple types
 */
type InferTuple<T extends readonly Schema<any>[]> = {
  [K in keyof T]: T[K] extends Schema<infer U> ? U : never;
};

/**
 * Tuple schema interface
 */
export interface TupleSchema<T extends any[]> extends
  Schema<T>,
  RefinableSchema<T, TupleSchema<T>>,
  TransformableSchema<T, TupleSchema<T>>,
  DefaultableSchema<T, TupleSchema<T>>,
  NullableSchema<T, TupleSchema<T>> {
  readonly _tag: 'TupleSchema';
  readonly schemas: { [K in keyof T]: Schema<T[K]> };
}

/**
 * Create a schema for a fixed-length array (tuple) with specific element types
 */
export function tuple<T extends any[]>(
  ...schemas: { [K in keyof T]: Schema<T[K]> }
): TupleSchema<T> {
  const schema: TupleSchema<T> = {
    _tag: 'TupleSchema',
    schemas,

    // Refinement implementation
    refine: (refinement, message) => {
      return {
        ...schema,
        toValidator: () => createEffectValidator((input, options) => {
          const baseValidator = schema.toValidator();
          return E.pipe(
            baseValidator.validate(input, options),
            E.flatMap(value =>
              refinement(value)
                ? E.succeed(value)
                : E.fail({
                  _tag: 'RefinementValidationError',
                  message: typeof message === 'function'
                    ? message(value)
                    : message || 'Failed refinement',
                  path: options?.path
                })
            )
          );
        })
      } as TupleSchema<T>;
    },

    // Transform implementation
    transform: <U>(transformer: (value: T) => U) => {
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
              ? (defaultValue as () => T)()
              : defaultValue;
            return E.succeed(value);
          }
          return schema.toValidator().validate(input, options);
        })
      } as TupleSchema<T>;
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
      } as unknown as Schema<T | null>;
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
      // Check if the input is an array
      if (!Array.isArray(input)) {
        return E.fail(new TypeValidationError(
          'Expected an array',
          'array',
          typeof input,
          options?.path
        ));
      }

      // Check if the input array has the correct length
      if (input.length !== schemas.length) {
        return E.fail(new TupleValidationError(
          `Expected tuple of length ${schemas.length}`,
          [],
          options?.path
        ));
      }

      // Validate each element using its corresponding schema
      const results: E.Effect<any, ValidationError>[] = [];

      for (let i = 0; i < schemas.length; i++) {
        const elementSchema = schemas[i];
        const elementValidator = elementSchema.toValidator();
        const path = options?.path ? [...options.path, i.toString()] : [i.toString()];

        results.push(
          elementValidator.validate(input[i], { ...options, path })
        );
      }

      // Combine all validation results
      return E.pipe(
        E.all(results),
        E.map(values => values as T)
      );
    })
  };

  return schema;
} 