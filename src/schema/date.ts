/**
 * Date schema implementation
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
import { TypeValidationError, DateValidationError } from '../errors';

/**
 * Date schema interface
 */
export interface DateSchema extends
  Schema<Date>,
  RefinableSchema<Date, DateSchema>,
  TransformableSchema<Date, DateSchema>,
  DefaultableSchema<Date, DateSchema>,
  NullableSchema<Date, DateSchema>,
  PredicateSchema<Date, DateSchema>,
  CustomErrorsSchema<Date, DateSchema> {
  readonly _tag: 'DateSchema';

  // Date specific validations
  readonly min: (min: Date | string | number, message?: string) => DateSchema;
  readonly max: (max: Date | string | number, message?: string) => DateSchema;
  readonly future: (message?: string) => DateSchema;
  readonly past: (message?: string) => DateSchema;
  readonly format: (formatter: (date: Date) => string) => Schema<string>;
}

/**
 * Create a date schema
 */
export function date(): DateSchema {
  const validations: Array<(input: Date, options?: ValidatorOptions) => ValidationResult<Date>> = [];
  let errorMessage: string | undefined = undefined;

  const schema: DateSchema = {
    _tag: 'DateSchema',

    min: (min, message) => {
      const minDate = min instanceof Date ? min : new Date(min);
      validations.push((input, options) =>
        input.getTime() >= minDate.getTime()
          ? E.succeed(input)
          : E.fail(new DateValidationError(
            message || `Date must be at or after ${minDate.toISOString()}`,
            options?.path
          ))
      );
      return schema;
    },

    max: (max, message) => {
      const maxDate = max instanceof Date ? max : new Date(max);
      validations.push((input, options) =>
        input.getTime() <= maxDate.getTime()
          ? E.succeed(input)
          : E.fail(new DateValidationError(
            message || `Date must be at or before ${maxDate.toISOString()}`,
            options?.path
          ))
      );
      return schema;
    },

    future: (message) => {
      validations.push((input, options) =>
        input.getTime() > Date.now()
          ? E.succeed(input)
          : E.fail(new DateValidationError(
            message || 'Date must be in the future',
            options?.path
          ))
      );
      return schema;
    },

    past: (message) => {
      validations.push((input, options) =>
        input.getTime() < Date.now()
          ? E.succeed(input)
          : E.fail(new DateValidationError(
            message || 'Date must be in the past',
            options?.path
          ))
      );
      return schema;
    },

    format: (formatter) => {
      return {
        _tag: 'TransformedSchema',
        toValidator: () => createEffectValidator((input, options) => {
          return E.pipe(
            schema.toValidator().validate(input, options),
            E.map(date => formatter(date))
          );
        })
      };
    },

    // refinement implementation
    refine: (refinement, message) => {
      validations.push((input, options) =>
        refinement(input)
          ? E.succeed(input)
          : E.fail(new DateValidationError(
            typeof message === 'function'
              ? message(input)
              : message || 'Invalid date',
            options?.path
          ))
      );
      return schema;
    },

    // predicate implementation (alias for refine)
    predicate: (predicate, message) => {
      return schema.refine(predicate, message);
    },

    // transformation implementation
    transform: <U>(transformer: (value: Date) => U) => {
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
      // Create a default validator function
      const defaultValidator = createEffectValidator((input, options) => {
        if (input === undefined) {
          const value = typeof defaultValue === 'function'
            ? (defaultValue as () => Date)()
            : defaultValue;
          return E.succeed(value);
        }
        return schema.toValidator().validate(input, options);
      });

      // Return a new schema with all properties preserved
      return {
        ...schema,
        _tag: 'DateSchema',
        toValidator: () => defaultValidator
      };
    },

    // nullable implementation
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

    // nullish implementation (null or undefined)
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

    // custom error message
    error: (message) => {
      errorMessage = message;
      return schema;
    },

    toValidator: () => createEffectValidator((input, options) => {
      // Check if it's a Date object
      const isDate = input instanceof Date && !isNaN(input.getTime());

      if (!isDate) {
        return E.fail(new TypeValidationError(
          errorMessage || 'Value must be a valid date',
          'Date',
          typeof input,
          options?.path
        ));
      }

      return validations.reduce(
        (acc, validation) => E.flatMap(acc, val => validation(val, options)),
        E.succeed(input) as E.Effect<Date, ValidationError>
      );
    })
  };

  return schema;
} 