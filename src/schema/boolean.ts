/**
 * Boolean schema implementation
 */
import * as E from '../internal/effect';
import {
  Schema,
  Validator,
  ValidatorOptions,
  ValidationResult,
  ValidationError,
  BooleanSchema,
  RefinableSchema,
  TransformableSchema,
  DefaultableSchema,
  NullableSchema
} from '../types';
import { createEffectValidator } from '../validator';
import { TypeValidationError } from '../errors';

/**
 * Create a schema for boolean values
 */
export function boolean(): BooleanSchema {
  const schema: BooleanSchema = {
    _tag: 'BooleanSchema',

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
      } as BooleanSchema;
    },

    // Transform implementation
    transform: <U>(transformer: (value: boolean) => U) => {
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
              ? (defaultValue as () => boolean)()
              : defaultValue;
            return E.succeed(value);
          }
          return schema.toValidator().validate(input, options);
        })
      } as BooleanSchema;
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
      } as Schema<boolean | null>;
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
      if (typeof input !== 'boolean') {
        return E.fail(new TypeValidationError(
          'Expected a boolean',
          'boolean',
          typeof input,
          options?.path
        ));
      }

      return E.succeed(input);
    })
  };

  return schema;
}
