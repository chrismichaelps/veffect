/**
 * Unknown Schema implementation
 */
import { Schema, RefinableSchema, TransformableSchema } from '../types';
import * as E from '../internal/effect';
import { createEffectValidator } from '../validator';

export interface UnknownSchema extends
  Schema<unknown>,
  RefinableSchema<unknown, UnknownSchema>,
  TransformableSchema<unknown, UnknownSchema> {
  readonly _tag: 'UnknownSchema';
}

// This is a special transformed schema interface for supporting chaining
export interface TransformedUnknownSchema<T> extends Schema<T> {
  readonly _tag: 'TransformedSchema';
  // Chain refinements
  refine: (
    refinement: (value: T) => boolean | Promise<boolean>,
    message?: string | ((value: T) => string)
  ) => TransformedUnknownSchema<T>;
  // Chain transforms
  transform: <U>(transformer: (value: T) => U) => TransformedUnknownSchema<U>;
}

/**
 * Creates a schema that validates unknown values (accepts any value but preserves type safety)
 *
 * @returns A schema that validates unknown values
 *
 * @example
 * const unknownSchema = unknown();
 * unknownSchema.toValidator().parse("anything"); // => "anything" as unknown
 */
export function unknown(): UnknownSchema {
  // Create a custom transformer implementation to bridge incompatible interfaces
  const transformSchema = <U>(validator: (input: unknown, options?: any) => E.Effect<U, any>): Schema<U> => {
    return {
      _tag: 'TransformedSchema',
      toValidator: () => createEffectValidator(validator)
    };
  };

  const schema: UnknownSchema = {
    _tag: 'UnknownSchema',

    toValidator: () => createEffectValidator((input, _options) => {
      return E.succeed(input);
    }),

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
      } as UnknownSchema;
    },

    // Transform implementation that returns a schema that satisfies the interface
    transform: <U>(transformer: (value: unknown) => U) => {
      // Create a transformed schema that maintains chainability
      const makeTransformedSchema = <V>(validate: (input: unknown, options?: any) => E.Effect<V, any>): TransformedUnknownSchema<V> => {
        const transformed: TransformedUnknownSchema<V> = {
          _tag: 'TransformedSchema',

          toValidator: () => createEffectValidator((input, options) =>
            validate(input, options)
          ),

          // Allow chained refinements
          refine: (refinement, message) => {
            return makeTransformedSchema((input, options) =>
              E.pipe(
                validate(input, options),
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
              )
            );
          },

          // Allow chained transforms
          transform: <W>(nextTransformer: (value: V) => W) => {
            return makeTransformedSchema((input, options) =>
              E.pipe(
                validate(input, options),
                E.map(value => nextTransformer(value))
              )
            );
          }
        };

        return transformed;
      };

      // Create the initial transformed schema
      const transformed = makeTransformedSchema((input, options) =>
        E.pipe(
          schema.toValidator().validate(input, options),
          E.map(value => transformer(value))
        )
      );

      // This cast is needed to bridge between the two interface types
      // TransformedUnknownSchema<U> implements Schema<U> so it's safe
      return transformed as any;
    }
  };

  return schema;
}
