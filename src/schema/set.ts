/**
 * Set schema implementation
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
import { TypeValidationError, SetValidationError } from '../errors';

/**
 * Set schema interface
 */
export interface SetSchema<T> extends
  Schema<Set<T>>,
  RefinableSchema<Set<T>, SetSchema<T>>,
  TransformableSchema<Set<T>, SetSchema<T>>,
  DefaultableSchema<Set<T>, SetSchema<T>>,
  NullableSchema<Set<T>, SetSchema<T>>,
  PredicateSchema<Set<T>, SetSchema<T>>,
  CustomErrorsSchema<Set<T>, SetSchema<T>> {
  readonly _tag: 'SetSchema';
  readonly elementSchema: Schema<T>;

  // Set specific validations
  readonly minSize: (min: number, message?: string) => SetSchema<T>;
  readonly maxSize: (max: number, message?: string) => SetSchema<T>;
  readonly size: (size: number, message?: string) => SetSchema<T>;
  readonly nonEmpty: (message?: string) => SetSchema<T>;
  readonly has: (value: T, message?: string) => SetSchema<T>;
  readonly subset: (superset: Set<T>, message?: string) => SetSchema<T>;
  readonly superset: (subset: Set<T>, message?: string) => SetSchema<T>;
}

/**
 * Create a set schema
 */
export function set<T>(elementSchema: Schema<T>): SetSchema<T> {
  const validations: Array<(input: Set<T>, options?: ValidatorOptions) => ValidationResult<Set<T>>> = [];
  let errorMessage: string | undefined = undefined;

  const schema: SetSchema<T> = {
    _tag: 'SetSchema',
    elementSchema,

    minSize: (min, message) => {
      validations.push((input, options) =>
        input.size >= min
          ? E.succeed(input)
          : E.fail(new SetValidationError(
            message || `Set must contain at least ${min} elements`,
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
          : E.fail(new SetValidationError(
            message || `Set must contain at most ${max} elements`,
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
          : E.fail(new SetValidationError(
            message || `Set must contain exactly ${size} elements`,
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
          : E.fail(new SetValidationError(
            message || `Set must not be empty`,
            undefined,
            options?.path
          ))
      );
      return schema;
    },

    has: (value, message) => {
      validations.push((input, options) => {
        // We need a way to check if the set contains the value
        // This is a simplistic implementation - in practice we'd need a more robust approach
        let found = false;
        input.forEach(item => {
          if (JSON.stringify(item) === JSON.stringify(value)) {
            found = true;
          }
        });

        return found
          ? E.succeed(input)
          : E.fail(new SetValidationError(
            message || `Set must contain the specified value`,
            undefined,
            options?.path
          ));
      });
      return schema;
    },

    subset: (superset, message) => {
      validations.push((input, options) => {
        // Check if input is a subset of superset
        let isSubset = true;
        input.forEach(value => {
          let found = false;
          superset.forEach(item => {
            if (JSON.stringify(item) === JSON.stringify(value)) {
              found = true;
            }
          });
          if (!found) {
            isSubset = false;
          }
        });

        return isSubset
          ? E.succeed(input)
          : E.fail(new SetValidationError(
            message || `Set must be a subset of the specified set`,
            undefined,
            options?.path
          ));
      });
      return schema;
    },

    superset: (subset, message) => {
      validations.push((input, options) => {
        // Check if input is a superset of subset
        let isSuperset = true;
        subset.forEach(value => {
          let found = false;
          input.forEach(item => {
            if (JSON.stringify(item) === JSON.stringify(value)) {
              found = true;
            }
          });
          if (!found) {
            isSuperset = false;
          }
        });

        return isSuperset
          ? E.succeed(input)
          : E.fail(new SetValidationError(
            message || `Set must be a superset of the specified set`,
            undefined,
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
    transform: <U>(transformer: (value: Set<T>) => U) => {
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
            ? (defaultValue as () => Set<T>)()
            : defaultValue;
          return E.succeed(value);
        }
        return schema.toValidator().validate(input, options);
      });

      // Return a new schema with all properties preserved
      return {
        ...schema,
        _tag: 'SetSchema',
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
      if (!(input instanceof Set)) {
        return E.fail(new TypeValidationError(
          errorMessage || 'Value must be a Set',
          'Set',
          typeof input,
          options?.path
        ));
      }

      // Validate all elements in the set
      const validatedElements: Array<ValidationResult<T>> = [];
      const elemValidator = elementSchema.toValidator();

      input.forEach(element => {
        const newPath = options?.path ? [...options.path, '*'] : ['*'];
        validatedElements.push(elemValidator.validate(element, { ...options, path: newPath }));
      });

      // Handle empty set case
      if (validatedElements.length === 0) {
        // Apply additional validations
        return validations.reduce(
          (acc, validation) => E.flatMap(acc, val => validation(val, options)),
          E.succeed(input) as E.Effect<Set<T>, ValidationError>
        );
      }

      // Combine validation results
      return E.pipe(
        E.all(validatedElements),
        E.map(validElements => new Set(validElements)),
        E.flatMap(validSet =>
          validations.reduce(
            (acc, validation) => E.flatMap(acc, val => validation(val, options)),
            E.succeed(validSet) as E.Effect<Set<T>, ValidationError>
          )
        )
      );
    })
  };

  return schema;
}
