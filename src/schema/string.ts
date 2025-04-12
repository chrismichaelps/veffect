/**
 * String schema implementation
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
import { TypeValidationError, StringValidationError } from '../errors';

/**
 * String schema interface
 */
export interface StringSchema extends
  Schema<string>,
  RefinableSchema<string, StringSchema>,
  TransformableSchema<string, StringSchema>,
  DefaultableSchema<string, StringSchema>,
  NullableSchema<string, StringSchema>,
  PredicateSchema<string, StringSchema>,
  CustomErrorsSchema<string, StringSchema> {
  readonly _tag: 'StringSchema';

  // String specific validations
  readonly minLength: (min: number, message?: string) => StringSchema;
  readonly maxLength: (max: number, message?: string) => StringSchema;
  readonly length: (length: number, message?: string) => StringSchema;
  readonly regex: (pattern: RegExp, message?: string) => StringSchema;
  readonly email: (message?: string) => StringSchema;
  readonly url: (message?: string) => StringSchema;
  readonly uuid: (message?: string) => StringSchema;
  readonly cuid: (message?: string) => StringSchema;
  readonly cuid2: (message?: string) => StringSchema;
  readonly ulid: (message?: string) => StringSchema;
  readonly startsWith: (substring: string, message?: string) => StringSchema;
  readonly endsWith: (substring: string, message?: string) => StringSchema;
  readonly includes: (substring: string, message?: string) => StringSchema;
  readonly trim: (message?: string) => StringSchema;
  readonly toLowerCase: () => StringSchema;
  readonly toUpperCase: () => StringSchema;
  readonly datetime: (options?: { offset?: boolean, precision?: number }, message?: string) => StringSchema;
  readonly ip: (version?: 'v4' | 'v6', message?: string) => StringSchema;
  readonly nonempty: (message?: string) => StringSchema;
}

/**
 * Create a string schema
 */
export function string(): StringSchema {
  const validations: Array<(input: string, options?: ValidatorOptions) => ValidationResult<string>> = [];
  let errorMessage: string | undefined = undefined;

  const schema: StringSchema = {
    _tag: 'StringSchema',

    minLength: (min, message) => {
      validations.push((input, options) =>
        input.length >= min
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must be at least ${min} characters`,
            options?.path
          ))
      );
      return schema;
    },

    maxLength: (max, message) => {
      validations.push((input, options) =>
        input.length <= max
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must be at most ${max} characters`,
            options?.path
          ))
      );
      return schema;
    },

    length: (length, message) => {
      validations.push((input, options) =>
        input.length === length
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must be exactly ${length} characters`,
            options?.path
          ))
      );
      return schema;
    },

    regex: (pattern, message) => {
      validations.push((input, options) =>
        pattern.test(input)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String does not match pattern ${pattern}`,
            options?.path
          ))
      );
      return schema;
    },

    email: (message) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return schema.regex(emailPattern, message || 'Invalid email address');
    },

    url: (message) => {
      const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
      return schema.regex(urlPattern, message || 'Invalid URL');
    },

    uuid: (message) => {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return schema.regex(uuidPattern, message || 'Invalid UUID');
    },

    cuid: (message) => {
      const cuidPattern = /^c[^\s-]{8,}$/i;
      return schema.regex(cuidPattern, message || 'Invalid CUID');
    },

    cuid2: (message) => {
      const cuid2Pattern = /^[a-z][a-z0-9]*$/;
      return schema.regex(cuid2Pattern, message || 'Invalid CUID2');
    },

    ulid: (message) => {
      const ulidPattern = /^[0-9A-HJKMNP-TV-Z]{26}$/;
      return schema.regex(ulidPattern, message || 'Invalid ULID');
    },

    startsWith: (substring, message) => {
      validations.push((input, options) =>
        input.startsWith(substring)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must start with "${substring}"`,
            options?.path
          ))
      );
      return schema;
    },

    endsWith: (substring, message) => {
      validations.push((input, options) =>
        input.endsWith(substring)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must end with "${substring}"`,
            options?.path
          ))
      );
      return schema;
    },

    includes: (substring, message) => {
      validations.push((input, options) =>
        input.includes(substring)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must include "${substring}"`,
            options?.path
          ))
      );
      return schema;
    },

    trim: (message) => {
      // Create a transformation function and return a complete StringSchema
      const transformedValidator = createEffectValidator((input, options) => {
        return E.pipe(
          schema.toValidator().validate(input, options),
          E.map(value => value.trim())
        );
      });

      return {
        ...schema,
        toValidator: () => transformedValidator
      };
    },

    toLowerCase: () => {
      // Create a transformation function and return a complete StringSchema
      const transformedValidator = createEffectValidator((input, options) => {
        return E.pipe(
          schema.toValidator().validate(input, options),
          E.map(value => value.toLowerCase())
        );
      });

      return {
        ...schema,
        toValidator: () => transformedValidator
      };
    },

    toUpperCase: () => {
      // Create a transformation function and return a complete StringSchema
      const transformedValidator = createEffectValidator((input, options) => {
        return E.pipe(
          schema.toValidator().validate(input, options),
          E.map(value => value.toUpperCase())
        );
      });

      return {
        ...schema,
        toValidator: () => transformedValidator
      };
    },

    datetime: (options, message) => {
      validations.push((input, options) => {
        const date = new Date(input);
        return !isNaN(date.getTime())
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || 'Invalid datetime string',
            options?.path
          ));
      });
      return schema;
    },

    ip: (version, message) => {
      const ipv4Pattern = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
      const ipv6Pattern = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/;

      validations.push((input, options) => {
        if (version === 'v4' && !ipv4Pattern.test(input)) {
          return E.fail(new StringValidationError(
            message || 'Invalid IPv4 address',
            options?.path
          ));
        }

        if (version === 'v6' && !ipv6Pattern.test(input)) {
          return E.fail(new StringValidationError(
            message || 'Invalid IPv6 address',
            options?.path
          ));
        }

        if (!version && !ipv4Pattern.test(input) && !ipv6Pattern.test(input)) {
          return E.fail(new StringValidationError(
            message || 'Invalid IP address',
            options?.path
          ));
        }

        return E.succeed(input);
      });

      return schema;
    },

    nonempty: (message) => {
      validations.push((input, options) =>
        input.length > 0
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || 'String must not be empty',
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

    // Predicate implementation (alias for refine)
    predicate: (predicate, message) => {
      return schema.refine(predicate, message);
    },

    // Transform implementation
    transform: <U>(transformer: (value: string) => U) => {
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
            ? (defaultValue as () => string)()
            : defaultValue;
          return E.succeed(value);
        }
        return schema.toValidator().validate(input, options);
      });

      // Return a new schema with all properties preserved
      return {
        ...schema,
        _tag: 'StringSchema',
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
      if (typeof input !== 'string') {
        return E.fail(new TypeValidationError(
          errorMessage || 'Value must be a string',
          'string',
          typeof input,
          options?.path
        ));
      }

      return validations.reduce(
        (acc, validation) => E.flatMap(acc, val => validation(val, options)),
        E.succeed(input) as E.Effect<string, ValidationError>
      );
    })
  };

  return schema;
} 