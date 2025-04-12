/**
 * Interface schema implementation - inspired by Zod 4's approach but with Effect style
 * This allows more precise control over key vs value optionality and supports recursive types
 */
import * as E from '../internal/effect';
import * as EffectMod from 'effect/Effect';
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
import { TypeValidationError, ObjectValidationError, CustomValidationError } from '../errors';

// Extract required and optional property keys
type PropertyKey = string;
type OptionalKey = `${string}?`;
type PropertyKeys<T> = Extract<keyof T, PropertyKey>;
type OptionalPropertyKeys<T> = Extract<keyof T, OptionalKey>;

// Create a type that correctly maps the schema properties to their value types
type InterfaceShape<T> = {
  [K in PropertyKeys<T>]: T[K] extends Schema<infer V> ? V : never;
} & {
  [K in OptionalPropertyKeys<T> as K extends `${infer Base}?` ? Base : never]?:
  T[K] extends Schema<infer V> ? V : never;
};

/**
 * Interface schema type - adds key optionality capabilities to object schema
 */
export interface InterfaceSchema<T extends Record<string, Schema<any>>> extends
  Schema<InterfaceShape<T>>,
  RefinableSchema<InterfaceShape<T>, InterfaceSchema<T>>,
  TransformableSchema<InterfaceShape<T>, InterfaceSchema<T>>,
  DefaultableSchema<InterfaceShape<T>, InterfaceSchema<T>>,
  NullableSchema<InterfaceShape<T>, InterfaceSchema<T>> {
  readonly _tag: 'InterfaceSchema';
  readonly properties: T;
}

/**
 * Create an interface schema with explicit control over key optionality
 * Keys with a ? suffix are treated as optional keys (not values)
 *
 * @example
 * ```ts
 * // Key optional (property can be omitted)
 * const userSchema = interface({
 *  "name?": string(),
 *  age: number()
 * });
 * // type is { name?: string; age: number }
 *
 * // Value optional (property must exist but can be undefined)
 * const configSchema = interface({
 *   name: string(),
 *   timeout: number().optional()
 * });
 * // type is { name: string; timeout: number | undefined }
 * ```
 */
export function interface_<T extends Record<string, Schema<any>>>(
  properties: T
): InterfaceSchema<T> {
  const schema: InterfaceSchema<T> = {
    _tag: 'InterfaceSchema',
    properties,

    // Refinement implementation
    refine: (refinement, message) => {
      return {
        ...schema,
        toValidator: () => createEffectValidator((input, options) => {
          const baseValidator = schema.toValidator();

          return E.pipe(
            baseValidator.validate(input, options),
            E.flatMap(value => {
              try {
                const result = refinement(value);

                if (result instanceof Promise) {
                  // For async refinements, we'll create a handler for them
                  return EffectMod.tryPromise({
                    try: async () => {
                      try {
                        const passes = await result;
                        if (passes) {
                          return value;
                        } else {
                          throw new CustomValidationError(
                            typeof message === 'function' ? message(value) : message || 'Failed refinement',
                            options?.path
                          );
                        }
                      } catch (error) {
                        if (error && typeof error === 'object' && '_tag' in error) {
                          throw error; // Already ValidationError
                        }
                        throw new CustomValidationError(
                          error instanceof Error ? error.message : 'Error in async refinement',
                          options?.path
                        );
                      }
                    },
                    catch: (error: unknown) => {
                      if (error && typeof error === 'object' && '_tag' in error) {
                        return error as ValidationError;
                      }
                      return new CustomValidationError(
                        error instanceof Error ? error.message : 'Error in async refinement',
                        options?.path
                      );
                    }
                  });
                }

                // For synchronous refinements
                return result
                  ? E.succeed(value)
                  : E.fail(new CustomValidationError(
                    typeof message === 'function'
                      ? message(value)
                      : message || 'Failed refinement',
                    options?.path
                  ));
              } catch (error) {
                if (error && typeof error === 'object' && '_tag' in error) {
                  return E.fail(error as ValidationError);
                }

                return E.fail(new CustomValidationError(
                  error instanceof Error ? error.message : 'Error in refinement',
                  options?.path
                ));
              }
            })
          );
        })
      } as InterfaceSchema<T>;
    },

    // Transform implementation
    transform: <U>(transformer: (value: InterfaceShape<T>) => U) => {
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
              ? (defaultValue as () => InterfaceShape<T>)()
              : defaultValue;
            return E.succeed(value);
          }
          return schema.toValidator().validate(input, options);
        })
      } as InterfaceSchema<T>;
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
      } as Schema<InterfaceShape<T> | null>;
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

      // Process keys and identify which ones are optional
      const requiredProperties: Record<string, Schema<any>> = {};
      const optionalProperties: Record<string, Schema<any>> = {};

      // First pass: categorize properties as required or optional
      for (const key in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, key)) {
          // The key is optional if it ends with ? and is not a literal key containing ?
          // (In a literal key with a ?, the ? would need to be escaped as \?)
          if (key.endsWith('?')) {
            // Check if this is an optional property marker or just a key with ? in it
            // We determine this based on if the property name ends with ? but doesn't have a literal ?
            // in the property name (which would be escaped as \?)

            // This logic treats "name?" as optional property "name"
            // But treats "exists\?" as required property "exists?"

            // If the ? is escaped with a \, it's a literal ? in the key name
            const isLiteralQuestionMark = key.length > 1 && key[key.length - 2] === '\\';

            if (!isLiteralQuestionMark) {
              // This is a key with optional property marker
              const baseKey = key.slice(0, -1); // Remove trailing ?
              optionalProperties[baseKey] = properties[key];
            } else {
              // This is a key with a literal ? in the name
              const actualKey = key.slice(0, -2) + '?'; // Replace \? with ?
              requiredProperties[actualKey] = properties[key];
            }
          } else {
            // This is a regular required property
            requiredProperties[key] = properties[key];
          }
        }
      }

      // Check for missing required properties
      const missingKeys = [];
      for (const key in requiredProperties) {
        if (!(key in input)) {
          missingKeys.push(key);
        }
      }

      if (missingKeys.length > 0) {
        return E.fail(new ObjectValidationError(
          `Missing required properties: ${missingKeys.join(', ')}`,
          missingKeys.map(key => ({
            _tag: 'MissingPropertyError',
            message: `Missing required property: ${key}`,
            path: options?.path ? [...options.path, key] : [key],
          })),
          options?.path
        ));
      }

      // Validate all properties (required and optional if present)
      type KeyValuePair = [string, any];
      const validationResults: Array<E.Effect<KeyValuePair, ValidationError>> = [];

      // Validate required properties
      for (const key in requiredProperties) {
        const path = options?.path ? [...options.path, key] : [key];
        const validator = requiredProperties[key].toValidator();

        validationResults.push(E.map(
          validator.validate((input as any)[key], { ...options, path }),
          validValue => [key, validValue] as KeyValuePair
        ));
      }

      // Validate optional properties if present
      for (const key in optionalProperties) {
        if (key in input) {
          const path = options?.path ? [...options.path, key] : [key];
          const validator = optionalProperties[key].toValidator();

          validationResults.push(E.map(
            validator.validate((input as any)[key], { ...options, path }),
            validValue => [key, validValue] as KeyValuePair
          ));
        }
      }

      return E.pipe(
        E.all(validationResults, {
          concurrency: options?.stopOnFirstError ? 1 : 'unbounded'
        }),
        E.map(entries => {
          const result = {} as any;
          for (const [key, value] of entries) {
            result[key] = value;
          }
          return result as InterfaceShape<T>;
        })
      );
    })
  };

  return schema;
}

// Alias for nicer syntax (since interface is a reserved keyword)
export { interface_ as interface };
