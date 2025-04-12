/**
 * Literal schema implementation
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
import { TypeValidationError } from '../errors';

/**
 * Literal schema interface
 */
export interface LiteralSchema<T extends string | number | boolean | null | undefined> extends
  Schema<T>,
  RefinableSchema<T, LiteralSchema<T>>,
  TransformableSchema<T, LiteralSchema<T>>,
  DefaultableSchema<T, LiteralSchema<T>>,
  NullableSchema<T, LiteralSchema<T>> {
  readonly _tag: 'LiteralSchema';
  readonly value: T;
}

/**
 * Creates a schema that validates that a value exactly matches the provided literal value
 * 
 * @param value The literal value to match against
 * @returns A schema that validates against the exact literal value
 * 
 * @example
 * const adminTypeSchema = literal('admin');
 * const userTypeSchema = literal('user');
 * const boolSchema = literal(true);
 * const nullSchema = literal(null);
 */
export function literal<T extends string | number | boolean | null | undefined>(value: T): LiteralSchema<T> {
  const schema: LiteralSchema<T> = {
    _tag: 'LiteralSchema',
    value,

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
      } as LiteralSchema<T>;
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
      } as LiteralSchema<T>;
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

    toValidator: (): Validator<T> => ({
      validate: (input, options): ValidationResult<T> => {
        if (input !== value) {
          const valueType = value === null ? 'null' :
            value === undefined ? 'undefined' :
              typeof value;
          const inputType = input === null ? 'null' :
            input === undefined ? 'undefined' :
              typeof input;

          return E.fail(
            new TypeValidationError(
              `Expected literal value: ${value}`,
              valueType,
              inputType,
              options?.path
            )
          );
        }

        return E.succeed(input as T);
      },

      parse: (input): T => {
        const result = E.runSync(E.either(schema.toValidator().validate(input)));
        if (E.isLeft(result)) {
          throw result.left;
        }
        return result.right;
      },

      safeParse: (input) => {
        const result = E.runSync(E.either(schema.toValidator().validate(input)));
        if (E.isLeft(result)) {
          return { success: false, error: result.left };
        }
        return { success: true, data: result.right };
      },

      validateAsync: async (input, options) => {
        return E.unwrapEither(E.runSync(
          E.either(schema.toValidator().validate(input, options))
        )) as T;
      }
    })
  };

  return schema;
} 