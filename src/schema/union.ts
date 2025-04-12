/**
 * Union schema implementation
 */
import * as E from '../internal/effect';
import * as EffectMod from 'effect/Effect';
import { pipe } from 'effect/Function';
import { Either } from 'effect/Either';
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
  CatchAllSchema
} from '../types';
import { createEffectValidator } from '../validator';
import { UnionValidationError } from '../errors';

/**
 * Union schema type
 */
export interface UnionSchema<T> extends
  Schema<T>,
  RefinableSchema<T, UnionSchema<T>>,
  TransformableSchema<T, UnionSchema<T>>,
  DefaultableSchema<T, UnionSchema<T>>,
  NullableSchema<T, UnionSchema<T>>,
  CatchAllSchema<T> {
  readonly _tag: 'UnionSchema';
  readonly schemas: readonly Schema<any>[];
}

/**
 * Create a union schema
 */
export function union<T extends readonly [Schema<any>, ...Schema<any>[]]>(
  schemas: T
): UnionSchema<T[number] extends Schema<infer U> ? U : never> {
  const validations: Array<(input: any, options?: ValidatorOptions) => ValidationResult<any>> = [];

  const schema: UnionSchema<any> = {
    _tag: 'UnionSchema',
    schemas,

    // refinement implementation
    refine: (refinement, message) => {
      validations.push((input, options) =>
        refinement(input)
          ? E.succeed(input)
          : E.fail(new UnionValidationError(
            typeof message === 'function'
              ? message(input)
              : message || 'Failed refinement',
            [],
            options?.path
          ))
      );
      return schema;
    },

    // transformation implementation
    transform: <U>(transformer: (value: any) => U) => {
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

    // default value implementation
    default: (defaultValue) => {
      const defaultSchema: UnionSchema<any> = {
        ...schema,
        _tag: 'UnionSchema',
        schemas,
        toValidator: () => createEffectValidator((input, options) => {
          if (input === undefined) {
            const value = typeof defaultValue === 'function'
              ? (defaultValue as () => any)()
              : defaultValue;
            return E.succeed(value);
          }
          return schema.toValidator().validate(input, options);
        })
      };

      return defaultSchema;
    },

    // nullable implementation
    nullable: () => {
      return {
        ...schema,
        _tag: 'NullableSchema',
        toValidator: () => createEffectValidator((input, options) => {
          if (input === null) {
            return E.succeed(null);
          }
          return schema.toValidator().validate(input, options);
        })
      };
    },

    // optional implementation
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

    // nullish implementation
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

    // catch-all implementation
    catchAll: <U>(fallback: U | ((error: ValidationError) => U)) => {
      return {
        _tag: 'CatchAllSchema',
        toValidator: () => createEffectValidator((input, options) => {
          return pipe(
            schema.toValidator().validate(input, options),
            EffectMod.catchAll((error: ValidationError) => {
              const fallbackValue = typeof fallback === 'function'
                ? (fallback as (error: ValidationError) => U)(error)
                : fallback;
              return E.succeed(fallbackValue);
            })
          );
        })
      };
    },

    toValidator: () => createEffectValidator((input, options) => {
      // Reject null and undefined by default
      if (input === null || input === undefined) {
        return E.fail(new UnionValidationError(
          `Expected a valid value but received ${input === null ? 'null' : 'undefined'}`,
          [],
          options?.path
        ));
      }

      // Special handling for empty objects that won't match any schema
      if (typeof input === 'object' && !Array.isArray(input) &&
        Object.keys(input).length === 0 &&
        !schemas.some(s => s._tag === 'EmptyObjectSchema')) {
        return E.fail(new UnionValidationError(
          `Empty object doesn't match any schema in the union`,
          [],
          options?.path
        ));
      }

      // Try to validate with each schema
      const schemaValidations = schemas.map(s => {
        const validator = s.toValidator();
        return E.either(validator.validate(input, options));
      });

      // If any schema validates successfully, use that result
      const result = pipe(
        E.forEach(schemaValidations, (validation) => validation),
        E.map((results) => {
          // Find the first successful validation
          const successResult = results.find(r => E.isRight(r as Either<unknown, unknown>));

          if (successResult && E.isRight(successResult as Either<unknown, unknown>)) {
            // Return the successful validation result
            return (successResult as any).right;
          }

          // If all validations failed, collect all errors
          const errors = results
            .filter(r => E.isLeft(r as Either<unknown, unknown>))
            .map(r => E.isLeft(r as Either<unknown, unknown>) ? (r as any).left : null)
            .filter(Boolean) as ValidationError[];

          // Return union validation error with all schema errors
          return E.fail(new UnionValidationError(
            'Input failed to match any schema in the union',
            errors,
            options?.path
          ));
        })
      );

      // Apply any additional validations
      return validations.reduce(
        (acc, validation) => E.flatMap(acc, val => validation(val, options)),
        result as ValidationResult<any>
      );
    })
  };

  return schema;
}

/**
 * Alias for union - Creates a schema that accepts any of the given schemas
 */
export const oneOf = union; 