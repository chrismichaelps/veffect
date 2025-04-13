/**
 * Void Schema implementation (accepts undefined)
 */
import { Schema } from '../types';
import * as E from '../internal/effect';
import { TypeValidationError } from '../errors';
import { createEffectValidator } from '../validator';

export interface VoidSchema extends Schema<void> {
  readonly _tag: 'VoidSchema';
}

/**
 * Creates a schema that validates void values (accepts undefined)
 *
 * @returns A schema that validates void values
 *
 * @example
 * const voidSchema = voidType();
 * voidSchema.toValidator().parse(undefined); // => undefined
 */
export function voidType(): VoidSchema {
  const schema: VoidSchema = {
    _tag: 'VoidSchema',

    toValidator: () => createEffectValidator((input, options) => {
      if (input !== undefined) {
        return E.fail(new TypeValidationError(
          `Expected void (undefined), received ${typeof input}`,
          'void',
          typeof input,
          options?.path
        ));
      }
      return E.succeed(input as void);
    })
  };

  return schema;
}
