/**
 * Object schema implementation
 */
import * as E from '../internal/effect';
import * as EffectMod from 'effect/Effect';
import { Either } from 'effect/Either';
import {
  Schema,
  Validator,
  ValidatorOptions,
  ValidationResult,
  ValidationError,
  ObjectSchema,
  RefinableSchema,
  TransformableSchema,
  DefaultableSchema,
  NullableSchema
} from '../types';
import { createEffectValidator } from '../validator';
import { TypeValidationError, ObjectValidationError } from '../errors';

/**
 * Create an object schema
 */
export function object<T extends Record<string, any>>(
  properties: { [K in keyof T]: Schema<T[K]> }
): ObjectSchema<T> {
  const schema: ObjectSchema<T> = {
    _tag: 'ObjectSchema',
    properties,

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
      } as ObjectSchema<T>;
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
      } as ObjectSchema<T>;
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
      } as Schema<T | null>;
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
      if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        return E.fail(new TypeValidationError(
          'Value must be an object',
          'object',
          typeof input,
          options?.path
        ));
      }

      // Check for discriminating field (typically "type")
      if (Object.prototype.hasOwnProperty.call(properties, 'type') &&
        properties.type._tag === 'LiteralSchema') {
        const typeSchema = properties.type;
        const typeValidator = typeSchema.toValidator();
        const typeResult = EffectMod.runSync(EffectMod.either(typeValidator.validate((input as any).type, options)));

        if (E.isLeft(typeResult)) {
          return E.fail(new ObjectValidationError(
            `Invalid discriminated union: type field does not match expected value`,
            [typeResult.left],
            options?.path
          ));
        }
      }

      type KeyValuePair = [keyof T, T[keyof T]];
      const validationResults: Array<E.Effect<KeyValuePair, ValidationError>> = [];

      for (const key in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, key)) {
          const path = options?.path ? [...options.path, key] : [key];
          const value = (input as any)[key];

          const validator = properties[key].toValidator();
          const validation = E.map(
            validator.validate(value, { ...options, path }),
            validValue => [key, validValue] as KeyValuePair
          );

          validationResults.push(validation);
        }
      }

      return E.pipe(
        E.all(validationResults, {
          concurrency: options?.stopOnFirstError ? 1 : 'unbounded'
        }),
        E.map(entries => {
          const result = {} as T;
          for (const [key, value] of entries) {
            result[key] = value;
          }
          return result;
        })
      );
    })
  };

  return schema;
} 