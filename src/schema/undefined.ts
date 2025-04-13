/**
 * Undefined Schema implementation
 */
import { Schema } from '../types';
import * as E from '../internal/effect';
import { TypeValidationError } from '../errors';
import { createEffectValidator } from '../validator';

export interface UndefinedSchema extends Schema<undefined> {
  readonly _tag: 'UndefinedSchema';
}

/**
 * Creates a schema that validates undefined values
 *
 * @returns A schema that validates undefined values
 *
 * @example
 * const undefinedSchema = undefinedType();
 * undefinedSchema.toValidator().parse(undefined); // => undefined
 */
export function undefinedType(): UndefinedSchema {
  const schema: UndefinedSchema = {
    _tag: 'UndefinedSchema',

    toValidator: () => createEffectValidator((input, options) => {
      if (input !== undefined) {
        return E.fail(new TypeValidationError(
          `Expected undefined, received ${typeof input}`,
          'undefined',
          typeof input,
          options?.path
        ));
      }
      return E.succeed(input);
    })
  };

  return schema;
}
