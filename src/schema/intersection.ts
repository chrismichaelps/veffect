/**
 * Intersection schema implementation
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
import { IntersectionValidationError } from '../errors';

// Helper type to get the intersection of an array of types
export type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

/**
 * Intersection schema interface
 */
export interface IntersectionSchema<T> extends
  Schema<T>,
  RefinableSchema<T, IntersectionSchema<T>>,
  TransformableSchema<T, IntersectionSchema<T>>,
  DefaultableSchema<T, IntersectionSchema<T>>,
  NullableSchema<T, IntersectionSchema<T>>,
  PredicateSchema<T, IntersectionSchema<T>>,
  CustomErrorsSchema<T, IntersectionSchema<T>> {
  readonly _tag: 'IntersectionSchema';
  readonly schemas: readonly Schema<any>[];
}

/**
 * Creates an intersection schema that combines multiple schemas.
 * The resulting schema validates that the input satisfies all the provided schemas.
 */
export function intersection<
  T extends [Schema<any>, ...Schema<any>[]]
>(schemas: T): IntersectionSchema<UnionToIntersection<T[number] extends Schema<infer U> ? U : never>> {
  let errorMessage: string | undefined = undefined;
  const validations: Array<(input: any, options?: ValidatorOptions) => ValidationResult<any>> = [];

  const schema: IntersectionSchema<any> = {
    _tag: 'IntersectionSchema',
    schemas,

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
    transform: <U>(transformer: (value: any) => U) => {
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
            ? (defaultValue as () => any)()
            : defaultValue;
          return E.succeed(value);
        }
        return schema.toValidator().validate(input, options);
      });

      // Return a new schema with all properties preserved
      return {
        ...schema,
        _tag: 'IntersectionSchema',
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
      // Collect validated results and errors separately
      const validatedResults: any[] = [];
      const errors: ValidationError[] = [];

      // Validate each schema using either
      for (const schemaItem of schemas) {
        const eitherResult = E.either(schemaItem.toValidator().validate(input, options));

        // We then run this synchronously to collect results
        const result = E.runSync(eitherResult);

        if (E.isRight(result)) {
          validatedResults.push(result.right);
        } else {
          errors.push(result.left as ValidationError);
        }
      }

      // If we have errors, return them
      if (errors.length > 0) {
        return E.fail(new IntersectionValidationError(
          errorMessage || 'Intersection validation failed',
          errors,
          options?.path
        ));
      }

      // Merge the valid results together
      let mergedResult: any;

      // Merge the objects - for primitive values, the last one wins
      if (typeof input !== 'object' || input === null) {
        mergedResult = validatedResults[validatedResults.length - 1];
      } else {
        // For objects, create a merged result
        mergedResult = validatedResults.reduce((merged, current) => {
          if (typeof current !== 'object' || current === null) {
            return merged;
          }
          return { ...merged, ...current };
        }, {});
      }

      // Apply additional validations from refine() calls
      return validations.reduce(
        (acc, validation) => E.flatMap(acc, val => validation(val, options)),
        E.succeed(mergedResult) as E.Effect<any, ValidationError>
      );
    })
  };

  return schema as IntersectionSchema<UnionToIntersection<T[number] extends Schema<infer U> ? U : never>>;
}
