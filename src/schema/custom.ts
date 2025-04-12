/**
 * Custom schema implementation
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
import { CustomValidationError } from '../errors';
import * as EffectMod from 'effect/Effect';

/**
 * Custom schema interface
 */
export interface CustomSchema<T> extends
  Schema<T>,
  RefinableSchema<T, CustomSchema<T>>,
  TransformableSchema<T, CustomSchema<T>>,
  DefaultableSchema<T, CustomSchema<T>>,
  NullableSchema<T, CustomSchema<T>> {
  readonly _tag: 'CustomSchema';
}

/**
 * Create a custom schema with a validation function
 */
export function custom<T>(
  validator: (input: unknown, options?: ValidatorOptions) => T | ValidationError | Promise<T | ValidationError>
): CustomSchema<T> {
  const validations: Array<(input: T, options?: ValidatorOptions) => ValidationResult<T>> = [];

  const schema: CustomSchema<T> = {
    _tag: 'CustomSchema',

    // Refinement implementation
    refine: (refinement, message) => {
      validations.push((input, options) =>
        refinement(input)
          ? E.succeed(input)
          : E.fail(new CustomValidationError(
            typeof message === 'function'
              ? message(input)
              : message || 'Failed refinement',
            options?.path
          ))
      );
      return schema;
    },

    // Transformation implementation
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
        _tag: 'CustomSchema',
        toValidator: () => createEffectValidator((input, options) => {
          if (input === undefined) {
            const value = typeof defaultValue === 'function'
              ? (defaultValue as () => T)()
              : defaultValue;
            return E.succeed(value);
          }
          return schema.toValidator().validate(input, options);
        })
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

    toValidator: () => createEffectValidator((input, options) => {
      // Convert Promise to Effect
      return EffectMod.tryPromise({
        try: async () => {
          try {
            // Run the custom validator
            const result = await validator(input, options);

            // If the result is a ValidationError, fail with that error
            if (result && typeof result === 'object' && '_tag' in result) {
              const error = result as ValidationError;
              return E.runSync(E.fail(error));
            }

            // Otherwise, succeed with the result
            const validatedInput = result as T;

            // Apply any additional validations
            return E.runSync(validations.reduce(
              (acc, validation) => E.flatMap(acc, val => validation(val, options)),
              E.succeed(validatedInput) as E.Effect<T, ValidationError>
            ));
          } catch (err) {
            // Handle any synchronous errors
            return E.runSync(E.fail(new CustomValidationError(
              err instanceof Error ? err.message : String(err),
              options?.path
            )));
          }
        },
        catch: (err) => new CustomValidationError(
          err instanceof Error ? err.message : String(err),
          options?.path
        )
      });
    })
  };

  return schema;
}

/**
 * Create a passthrough schema that always succeeds with the input value
 */
export function passthrough<T>(): Schema<T> {
  return {
    _tag: 'PassthroughSchema',
    toValidator: () => createEffectValidator((input) => {
      return E.succeed(input as T);
    })
  };
}

/**
 * Create a lazy schema for recursive definitions
 */
export function lazy<T>(schemaFn: () => Schema<T>): Schema<T> {
  let cachedSchema: Schema<T> | null = null;

  return {
    _tag: 'LazySchema',
    toValidator: () => {
      if (!cachedSchema) {
        cachedSchema = schemaFn();
      }
      return cachedSchema.toValidator();
    }
  };
} 