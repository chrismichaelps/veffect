/**
 * Any Schema implementation
 */
import { Schema, Validator, ValidationResult } from '../types';
import * as E from '../internal/effect';

export interface AnySchema extends Schema<any> {
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
    })
  };

  return schema;
}
