/**
 * Map schema implementation
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
import { TypeValidationError, MapValidationError } from '../errors';

/**
 * Map schema interface
 */
export interface MapSchema<K, V> extends
  Schema<Map<K, V>>,
  RefinableSchema<Map<K, V>, MapSchema<K, V>>,
  TransformableSchema<Map<K, V>, MapSchema<K, V>>,
  DefaultableSchema<Map<K, V>, MapSchema<K, V>>,
  NullableSchema<Map<K, V>, MapSchema<K, V>>,
  PredicateSchema<Map<K, V>, MapSchema<K, V>>,
  CustomErrorsSchema<Map<K, V>, MapSchema<K, V>> {
  readonly _tag: 'MapSchema';
  readonly keySchema: Schema<K>;
  readonly valueSchema: Schema<V>;

  // Map specific validations
  readonly minSize: (min: number, message?: string) => MapSchema<K, V>;
  readonly maxSize: (max: number, message?: string) => MapSchema<K, V>;
  readonly size: (size: number, message?: string) => MapSchema<K, V>;
  readonly nonEmpty: (message?: string) => MapSchema<K, V>;
  readonly hasKey: (key: K, message?: string) => MapSchema<K, V>;
  readonly hasValue: (value: V, message?: string) => MapSchema<K, V>;
  readonly entries: (entries: [K, V][], message?: string) => MapSchema<K, V>;
}

/**
 * Create a map schema
 */
export function map<K, V>(keySchema: Schema<K>, valueSchema: Schema<V>): MapSchema<K, V> {
  const validations: Array<(input: Map<K, V>, options?: ValidatorOptions) => ValidationResult<Map<K, V>>> = [];
  let errorMessage: string | undefined = undefined;

  const schema: MapSchema<K, V> = {
    _tag: 'MapSchema',
    keySchema,
    valueSchema,

    minSize: (min, message) => {
      validations.push((input, options) =>
        input.size >= min
          ? E.succeed(input)
          : E.fail(new MapValidationError(
            message || `Map must contain at least ${min} entries`,
            undefined,
            options?.path
          ))
      );
      return schema;
    },

    maxSize: (max, message) => {
      validations.push((input, options) =>
        input.size <= max
          ? E.succeed(input)
          : E.fail(new MapValidationError(
            message || `Map must contain at most ${max} entries`,
            undefined,
            options?.path
          ))
      );
      return schema;
    },

    size: (size, message) => {
      validations.push((input, options) =>
        input.size === size
          ? E.succeed(input)
          : E.fail(new MapValidationError(
            message || `Map must contain exactly ${size} entries`,
            undefined,
            options?.path
          ))
      );
      return schema;
    },

    nonEmpty: (message) => {
      validations.push((input, options) =>
        input.size > 0
          ? E.succeed(input)
          : E.fail(new MapValidationError(
            message || `Map must not be empty`,
            undefined,
            options?.path
          ))
      );
      return schema;
    },

    hasKey: (key, message) => {
      validations.push((input, options) => {
        // Simplified key comparison - in practice would need better equals implementation
        let hasKey = false;
        input.forEach((_, k) => {
          if (JSON.stringify(k) === JSON.stringify(key)) {
            hasKey = true;
          }
        });

        return hasKey
          ? E.succeed(input)
          : E.fail(new MapValidationError(
            message || `Map must contain the specified key`,
            undefined,
            options?.path
          ));
      });
      return schema;
    },

    hasValue: (value, message) => {
      validations.push((input, options) => {
        // Simplified value comparison - in practice would need better equals implementation
        let hasValue = false;
        input.forEach((v) => {
          if (JSON.stringify(v) === JSON.stringify(value)) {
            hasValue = true;
          }
        });

        return hasValue
          ? E.succeed(input)
          : E.fail(new MapValidationError(
            message || `Map must contain the specified value`,
            undefined,
            options?.path
          ));
      });
      return schema;
    },

    entries: (entries, message) => {
      validations.push((input, options) => {
        // Check if all entries in the provided array exist in the input map
        for (const [entryKey, entryValue] of entries) {
          let found = false;

          input.forEach((v, k) => {
            if (
              JSON.stringify(k) === JSON.stringify(entryKey) &&
              JSON.stringify(v) === JSON.stringify(entryValue)
            ) {
              found = true;
            }
          });

          if (!found) {
            return E.fail(new MapValidationError(
              message || `Map must contain all specified entries`,
              undefined,
              options?.path
            ));
          }
        }

        return E.succeed(input);
      });
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
    transform: <U>(transformer: (value: Map<K, V>) => U) => {
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
            ? (defaultValue as () => Map<K, V>)()
            : defaultValue;
          return E.succeed(value);
        }
        return schema.toValidator().validate(input, options);
      });

      // Return a new schema with all properties preserved
      return {
        ...schema,
        _tag: 'MapSchema',
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
      // Type validation
      if (!(input instanceof Map)) {
        return E.fail(new TypeValidationError(
          errorMessage || 'Value must be a Map',
          'Map',
          typeof input,
          options?.path
        ));
      }

      // Validate all keys and values in the map
      const validatedEntries: Array<ValidationResult<[K, V]>> = [];
      const keyValidator = keySchema.toValidator();
      const valueValidator = valueSchema.toValidator();

      input.forEach((value, key) => {
        const keyPath = options?.path ? [...options.path, '[key]'] : ['[key]'];
        const valuePath = options?.path ? [...options.path, '*'] : ['*'];

        // Validate key and value separately, then combine results
        const keyResult = keyValidator.validate(key, { ...options, path: keyPath });
        const valueResult = valueValidator.validate(value, { ...options, path: valuePath });

        const entryResult = E.pipe(
          E.all([keyResult, valueResult]),
          E.map(([validKey, validValue]) => [validKey, validValue] as [K, V])
        );

        validatedEntries.push(entryResult);
      });

      // Handle empty map case
      if (validatedEntries.length === 0) {
        // Apply additional validations
        return validations.reduce(
          (acc, validation) => E.flatMap(acc, val => validation(val, options)),
          E.succeed(input) as E.Effect<Map<K, V>, ValidationError>
        );
      }

      // Combine validation results
      return E.pipe(
        E.all(validatedEntries),
        E.map(validEntries => new Map(validEntries)),
        E.flatMap(validMap =>
          validations.reduce(
            (acc, validation) => E.flatMap(acc, val => validation(val, options)),
            E.succeed(validMap) as E.Effect<Map<K, V>, ValidationError>
          )
        )
      );
    })
  };

  return schema;
}
