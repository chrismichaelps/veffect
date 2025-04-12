/**
 * Discriminated Union Schema implementation
 */
import { Schema, Validator } from '../types';
import * as E from '../internal/effect';
import { TypeValidationError, UnionValidationError } from '../errors';

export interface DiscriminatedUnionSchema<T> extends Schema<T> {
  readonly _tag: 'DiscriminatedUnionSchema';
}

/**
 * Creates a discriminated union schema that validates and handles union types based on a discriminator property
 * 
 * @param discriminator The property that determines which schema to use
 * @param schemas Array of object schemas that each have the discriminator property
 * @returns A schema that validates against the appropriate union member based on the discriminator
 * 
 * @example
 * const userSchema = discriminatedUnion('type', [
 *   object({ type: literal('admin'), permissions: array(string()) }),
 *   object({ type: literal('user'), role: string() })
 * ]);
 */
export function discriminatedUnion<
  D extends string,
  S extends Schema<any>[],
  T = { [K in number]: S[K] extends Schema<infer U> ? U : never }[number]
>(discriminator: D, schemas: S): DiscriminatedUnionSchema<T> {
  // Validate that all schemas have the discriminator property
  for (const schema of schemas) {
    if (schema._tag !== 'ObjectSchema') {
      throw new Error(`All schemas in a discriminated union must be object schemas, but found: ${schema._tag}`);
    }
  }

  const schema: DiscriminatedUnionSchema<T> = {
    _tag: 'DiscriminatedUnionSchema',

    toValidator: (): Validator<T> => ({
      validate: (input, options) => {
        if (input === null || input === undefined || typeof input !== 'object' || Array.isArray(input)) {
          return E.fail(new TypeValidationError(
            `Expected an object for discriminated union`,
            'object',
            typeof input,
            options?.path
          ));
        }

        // Check if the input has the discriminator property
        const discriminatorValue = (input as any)[discriminator];
        if (discriminatorValue === undefined) {
          return E.fail(new TypeValidationError(
            `Expected object with '${discriminator}' property for discriminated union`,
            `object with '${discriminator}' property`,
            `object without '${discriminator}' property`,
            options?.path
          ));
        }

        // Try each schema and collect errors
        const errors: Array<any> = [];

        for (const schema of schemas) {
          const validator = schema.toValidator();
          const result = validator.validate(input, options);

          // Check if this schema succeeded with the input
          const resultEither = E.runSync(E.either(result));

          if (E.isRight(resultEither)) {
            return result; // Found a matching schema
          } else {
            errors.push(resultEither.left);
          }
        }

        // If we get here, none of the schemas matched
        return E.fail(new UnionValidationError(
          `No schema matched for discriminated union with '${discriminator}' value: ${discriminatorValue}`,
          errors,
          options?.path
        ));
      },

      parse: (input) => {
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