/**
 * Never Schema implementation
 */
import { Schema } from '../types';
import * as E from '../internal/effect';
import { TypeValidationError } from '../errors';
import { createEffectValidator } from '../validator';

export interface NeverSchema extends Schema<never> {
  readonly _tag: 'NeverSchema';
}

/**
 * Creates a schema that validates never type (rejects all values)
 *
 * @returns A schema that validates never type
 *
 * @example
 * const neverSchema = never();
 * // All inputs will fail validation
 */
export function never(): NeverSchema {
  const schema: NeverSchema = {
    _tag: 'NeverSchema',

    toValidator: () => createEffectValidator((input, options) => {
      return E.fail(new TypeValidationError(
        'Never type schema never accepts any value',
        'never',
        typeof input,
        options?.path
      ));
    })
  };

  return schema;
}
