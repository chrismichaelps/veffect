/**
 * Unknown Schema implementation
 */
import { Schema } from '../types';
import * as E from '../internal/effect';
import { createEffectValidator } from '../validator';

export interface UnknownSchema extends Schema<unknown> {
  readonly _tag: 'UnknownSchema';
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
  const schema: UnknownSchema = {
    _tag: 'UnknownSchema',

    toValidator: () => createEffectValidator((input, _options) => {
      return E.succeed(input);
    })
  };

  return schema;
}
