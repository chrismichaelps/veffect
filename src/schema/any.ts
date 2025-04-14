/**
 * Any Schema implementation
 */
import { Schema, Validator, ValidationResult, RefinableSchema, TransformableSchema, DefaultableSchema, NullableSchema, ValidationError } from '../types';
import * as E from '../internal/effect';
import { createEffectValidator } from '../validator';

export interface AnySchema extends
  Schema<any>,
  RefinableSchema<any, AnySchema>,
  TransformableSchema<any, AnySchema>,
  DefaultableSchema<any, AnySchema>,
  NullableSchema<any, AnySchema> {
  readonly _tag: 'AnySchema';
}

/**
 * Creates a schema that accepts any value without validation
 *
 * @returns A schema that accepts any value
 *
 * @example
 * const dynamicDataSchema = any();
 */
export function any(): AnySchema {
  const schema: AnySchema = {
    _tag: 'AnySchema',

    toValidator: (): Validator<any> => ({
      validate: (input, _options): ValidationResult<any> => {
        return E.succeed(input);
      },

      parse: (input): any => {
        return input;
      },

      safeParse: (input) => {
        return { success: true, data: input };
      },

      validateAsync: async (input, _options) => {
        return input;
      }
    }),

    // Implement refinement
    refine: (refinement, message) => {
      const baseValidator = schema.toValidator();
      const refinedValidator = createEffectValidator((input, options) => {
        return E.pipe(
          baseValidator.validate(input, options),
          E.flatMap((value: any) =>
            refinement(value)
              ? E.succeed(value)
              : E.fail({
                _tag: 'RefinementValidationError',
                message: typeof message === 'function' ? message(value) : (message || 'Invalid value'),
                path: options?.path
              })
          )
        );
      });

      return {
        ...schema,
        toValidator: () => refinedValidator
      };
    },

    // Implement transform
    transform: (transformer) => {
      const baseValidator = schema.toValidator();
      const transformedValidator = createEffectValidator((input, options) => {
        return E.pipe(
          baseValidator.validate(input, options),
          E.map((value: any) => transformer(value))
        );
      });

      return {
        _tag: 'TransformedSchema',
        toValidator: () => transformedValidator
      };
    },

    // Implement default
    default: (defaultValue) => {
      const baseValidator = schema.toValidator();
      const defaultValidator = createEffectValidator((input, options) => {
        if (input === undefined) {
          const value = typeof defaultValue === 'function'
            ? (defaultValue as () => any)()
            : defaultValue;
          return E.succeed(value);
        }
        return baseValidator.validate(input, options);
      });

      return {
        ...schema,
        toValidator: () => defaultValidator
      };
    },

    // Implement nullable
    nullable: () => {
      const baseValidator = schema.toValidator();
      const nullableValidator = createEffectValidator((input, options) => {
        if (input === null) {
          return E.succeed(null);
        }
        return baseValidator.validate(input, options);
      });

      return {
        _tag: 'NullableSchema',
        toValidator: () => nullableValidator
      };
    },

    // Implement optional
    optional: () => {
      const baseValidator = schema.toValidator();
      const optionalValidator = createEffectValidator((input, options) => {
        if (input === undefined) {
          return E.succeed(undefined);
        }
        return baseValidator.validate(input, options);
      });

      return {
        _tag: 'OptionalSchema',
        toValidator: () => optionalValidator
      };
    },

    // Implement nullish
    nullish: () => {
      const baseValidator = schema.toValidator();
      const nullishValidator = createEffectValidator((input, options) => {
        if (input === null || input === undefined) {
          return E.succeed(input);
        }
        return baseValidator.validate(input, options);
      });

      return {
        _tag: 'NullishSchema',
        toValidator: () => nullishValidator
      };
    }
  };

  return schema;
}
