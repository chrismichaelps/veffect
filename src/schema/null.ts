/**
 * Null Schema implementation
 */
import { Schema } from '../types';
import * as E from '../internal/effect';
import { TypeValidationError } from '../errors';
import { createEffectValidator } from '../validator';

export interface NullSchema extends Schema<null> {
  readonly _tag: 'NullSchema';
}

/**
 * Creates a schema that validates null values
 *
 * @returns A schema that validates null values
 *
 * @example
 * const nullSchema = nullType();
 * nullSchema.toValidator().parse(null); // => null
 */
export function nullType(): NullSchema {
  const schema: NullSchema = {
    _tag: 'NullSchema',

    toValidator: () => createEffectValidator((input, options) => {
      if (input !== null) {
        return E.fail(new TypeValidationError(
          `Expected null, received ${input === null ? 'null' : typeof input}`,
          'null',
          input === null ? 'null' : typeof input,
          options?.path
        ));
      }
      return E.succeed(input);
    })
  };

  return schema;
}
