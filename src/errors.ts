/**
 * Error definitions for the validation library
 */
import { ValidationError } from './types';

/**
 * Create a validation error
 */
export const createValidationError = (
  tag: string,
  message: string,
  path?: string[]
): ValidationError => ({
  _tag: tag,
  message,
  path
});

/**
 * Type validation error
 */
export class TypeValidationError implements ValidationError {
  readonly _tag = 'TypeValidationError';
  constructor(
    readonly message: string,
    readonly expected: string,
    readonly received: string,
    readonly path?: string[]
  ) { }
}

/**
 * String validation error
 */
export class StringValidationError implements ValidationError {
  readonly _tag = 'StringValidationError';
  constructor(
    readonly message: string,
    readonly path?: string[]
  ) { }
}

/**
 * Number validation error
 */
export class NumberValidationError implements ValidationError {
  readonly _tag = 'NumberValidationError';
  constructor(
    readonly message: string,
    readonly path?: string[]
  ) { }
}

/**
 * Object validation error
 */
export class ObjectValidationError implements ValidationError {
  readonly _tag = 'ObjectValidationError';
  constructor(
    readonly message: string,
    readonly errors: ValidationError[],
    readonly path?: string[]
  ) { }
}

/**
 * Array validation error
 */
export class ArrayValidationError implements ValidationError {
  readonly _tag = 'ArrayValidationError';
  constructor(
    readonly message: string,
    readonly errors: ValidationError[],
    readonly path?: string[]
  ) { }
}

/**
 * Date validation error
 */
export class DateValidationError implements ValidationError {
  readonly _tag = 'DateValidationError';
  constructor(
    readonly message: string,
    readonly path?: string[]
  ) { }
}

/**
 * Union validation error
 */
export class UnionValidationError implements ValidationError {
  readonly _tag = 'UnionValidationError';
  constructor(
    readonly message: string,
    readonly unionErrors: ValidationError[],
    readonly path?: string[]
  ) { }
}

/**
 * Tuple validation error
 */
export class TupleValidationError implements ValidationError {
  readonly _tag = 'TupleValidationError';
  constructor(
    readonly message: string,
    readonly errors: ValidationError[],
    readonly path?: string[]
  ) { }
}

/**
 * Record/Map validation error
 */
export class RecordValidationError implements ValidationError {
  readonly _tag = 'RecordValidationError';
  constructor(
    readonly message: string,
    readonly errors: ValidationError[],
    readonly path?: string[]
  ) { }
}

/**
 * Refinement validation error
 */
export class RefinementValidationError implements ValidationError {
  readonly _tag = 'RefinementValidationError';
  constructor(
    readonly message: string,
    readonly path?: string[]
  ) { }
}

/**
 * Custom validation error
 */
export class CustomValidationError implements ValidationError {
  readonly _tag = 'CustomValidationError';
  constructor(
    readonly message: string,
    readonly path?: string[]
  ) { }
} 