/**
 * Optional schema implementation
 */
import * as E from '../internal/effect';
import { Schema, ValidationError } from '../types';
import { createEffectValidator } from '../validator';

/**
 * Create a schema for optional values
 */
export function optional<T>(schema: Schema<T>): Schema<T | undefined> {
  return {
    _tag: 'OptionalSchema',

    toValidator: () => createEffectValidator((input, options) => {
      if (input === undefined) {
        return E.succeed(undefined);
      }

      const validator = schema.toValidator();
      return validator.validate(input, options);
    })
  };
} 