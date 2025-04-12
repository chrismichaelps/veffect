/**
 * Record schema implementation
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
import { TypeValidationError, RecordValidationError } from '../errors';

/**
 * Record schema interface
 */
export interface RecordSchema<K extends string | number | symbol, V> extends
  Schema<Record<K, V>>,
  RefinableSchema<Record<K, V>, RecordSchema<K, V>>,
  TransformableSchema<Record<K, V>, RecordSchema<K, V>>,
  DefaultableSchema<Record<K, V>, RecordSchema<K, V>>,
  NullableSchema<Record<K, V>, RecordSchema<K, V>> {
  readonly _tag: 'RecordSchema';
  readonly keySchema: Schema<K>;
  readonly valueSchema: Schema<V>;

  // Record specific validations
  readonly minSize: (min: number, message?: string) => RecordSchema<K, V>;
  readonly maxSize: (max: number, message?: string) => RecordSchema<K, V>;
  readonly exactSize: (size: number, message?: string) => RecordSchema<K, V>;
}

/**
 * Create a record schema
 */
export function record<K extends string, V>(
  keySchema: Schema<K>,
  valueSchema: Schema<V>
): RecordSchema<K, V> {
  const validations: Array<(input: Record<K, V>, options?: ValidatorOptions) => ValidationResult<Record<K, V>>> = [];

  const schema: RecordSchema<K, V> = {
    _tag: 'RecordSchema',
    keySchema,
    valueSchema,

    minSize: (min, message) => {
      validations.push((input, options) => {
        const size = Object.keys(input).length;
        return size >= min
          ? E.succeed(input)
          : E.fail(new RecordValidationError(
            message || `Record must have at least ${min} entries, got ${size}`,
            [],
            options?.path
          ));
      });
      return schema;
    },

    maxSize: (max, message) => {
      validations.push((input, options) => {
        const size = Object.keys(input).length;
        return size <= max
          ? E.succeed(input)
          : E.fail(new RecordValidationError(
            message || `Record must have at most ${max} entries, got ${size}`,
            [],
            options?.path
          ));
      });
      return schema;
    },

    exactSize: (size, message) => {
      validations.push((input, options) => {
        const actualSize = Object.keys(input).length;
        return actualSize === size
          ? E.succeed(input)
          : E.fail(new RecordValidationError(
            message || `Record must have exactly ${size} entries, got ${actualSize}`,
            [],
            options?.path
          ));
      });
      return schema;
    },

    // Refinement implementation
    refine: (refinement, message) => {
      validations.push((input, options) =>
        refinement(input)
          ? E.succeed(input)
          : E.fail(new RecordValidationError(
            typeof message === 'function'
              ? message(input)
              : message || 'Failed refinement',
            [],
            options?.path
          ))
      );
      return schema;
    },

    // Transformation implementation
    transform: <U>(transformer: (value: Record<K, V>) => U) => {
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
            ? (defaultValue as () => Record<K, V>)()
            : defaultValue;
          return E.succeed(value);
        }
        return schema.toValidator().validate(input, options);
      });

      // Return a new schema with all properties preserved
      return {
        ...schema,
        _tag: 'RecordSchema',
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

    toValidator: () => createEffectValidator((input, options) => {
      // Check if input is an object (not null, not array)
      if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        return E.fail(new TypeValidationError(
          'Expected an object for record validation',
          'object',
          typeof input,
          options?.path
        ));
      }

      // Validate each entry
      const entries = Object.entries(input);
      const keyValidator = keySchema.toValidator();
      const valueValidator = valueSchema.toValidator();

      type KeyValuePair = { key: K; value: V };

      // Validate all keys and values
      const entryValidations = entries.map(([key, value]) => {
        const keyPath = options?.path ? [...options.path, 'keys', key] : ['keys', key];
        const valuePath = options?.path ? [...options.path, key] : [key];

        return E.pipe(
          // Validate key
          keyValidator.validate(key as any, { ...options, path: keyPath }),
          // Then validate value if key is valid
          E.flatMap(validKey =>
            E.pipe(
              valueValidator.validate(value, { ...options, path: valuePath }),
              E.map(validValue => ({ key: validKey, value: validValue } as KeyValuePair))
            )
          )
        );
      });

      // Combine all validations
      return E.pipe(
        E.all(entryValidations),
        E.map(validPairs => {
          const result = {} as Record<K, V>;
          for (const { key, value } of validPairs) {
            result[key] = value;
          }
          return result;
        }),
        (validRecordEffect: E.Effect<Record<K, V>, ValidationError>) =>
          validations.reduce(
            (acc, validation) => E.flatMap(acc, val => validation(val, options)),
            validRecordEffect
          )
      );
    })
  };

  return schema;
}

/**
 * Create a record schema with string keys
 */
export function map<V>(valueSchema: Schema<V>): RecordSchema<string, V> {
  // Use a pass-through string schema
  const keySchema: Schema<string> = {
    _tag: 'StringKeySchema',
    toValidator: () => createEffectValidator((input) => {
      if (typeof input !== 'string') {
        return E.fail(new TypeValidationError(
          'Record key must be a string',
          'string',
          typeof input,
          undefined
        ));
      }
      return E.succeed(input);
    })
  };

  return record(keySchema, valueSchema);
} 