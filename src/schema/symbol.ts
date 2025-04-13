/**
 * Symbol Schema implementation
 */
import { Schema, Validator, ValidationResult } from '../types';
import * as E from '../internal/effect';
import { TypeValidationError } from '../errors';
import { createEffectValidator } from '../validator';

export interface SymbolSchema extends Schema<symbol> {
  readonly _tag: 'SymbolSchema';
}

/**
 * Creates a schema that validates Symbol values
 *
 * @returns A schema that validates Symbol values
 *
 * @example
 * const symbolSchema = symbol();
 * const mySymbol = Symbol('test');
 * symbolSchema.toValidator().parse(mySymbol); // => mySymbol
 */
export function symbol(): SymbolSchema {
  const schema: SymbolSchema = {
    _tag: 'SymbolSchema',

    toValidator: () => createEffectValidator((input, options) => {
      if (typeof input !== 'symbol') {
        return E.fail(new TypeValidationError(
          `Expected a symbol, received ${typeof input}`,
          'symbol',
          typeof input,
          options?.path
        ));
      }
      return E.succeed(input);
    })
  };

  return schema;
}
