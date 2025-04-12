/**
 * Core types for the validation library
 */
import type { Effect } from './internal/effect';

/**
 * Represents the result of a validation operation
 */
export type ValidationResult<T> = Effect<T, ValidationError>;

/**
 * Base interface for validation errors
 */
export interface ValidationError {
  readonly _tag: string;
  readonly message: string;
  readonly path?: string[];
}

/**
 * Configuration options for validators
 */
export interface ValidatorOptions {
  readonly path?: string[];
  readonly stopOnFirstError?: boolean;
}

/**
 * Core validator interface
 */
export interface Validator<T, I = unknown> {
  /**
   * Validates input and returns an Effect (internal implementation)
   */
  readonly validate: (input: I, options?: ValidatorOptions) => ValidationResult<T>;

  /**
   * Synchronously parses and validates input
   * Throws an error if validation fails
   */
  readonly parse: (input: I) => T | never;

  /**
   * Synchronously parses and validates input
   * Returns a result object indicating success or failure
   */
  readonly safeParse: (input: I) => { success: true; data: T } | { success: false; error: ValidationError };

  /**
   * Asynchronously validates input
   * Returns a Promise that resolves with the validated data or rejects with a validation error
   */
  readonly validateAsync: (input: I, options?: ValidatorOptions) => Promise<T>;
}

/**
 * Schema definition interface
 */
export interface Schema<T, I = unknown> {
  readonly _tag: string;
  readonly toValidator: () => Validator<T, I>;
}

/**
 * Generic interface for schemas supporting refinement
 */
export interface RefinableSchema<T, S extends Schema<T>> {
  /**
   * Add a refinement to validate the output further
   */
  readonly refine: (
    refinement: (value: T) => boolean,
    message?: string | ((value: T) => string)
  ) => S;
}

/**
 * Generic interface for schemas that can be transformed
 */
export interface TransformableSchema<T, S> {
  /**
   * Transform the output of this schema
   */
  readonly transform: <U>(transformer: (value: T) => U) => Schema<U, unknown>;
}

/**
 * Generic interface for schemas that can have default values
 */
export interface DefaultableSchema<T, S extends Schema<T>> {
  /**
   * Define a default value if the input is undefined
   */
  readonly default: (defaultValue: T | (() => T)) => S;
}

/**
 * Generic interface for schemas that can be optional or nullable
 */
export interface NullableSchema<T, S extends Schema<T>> {
  /**
   * Make this schema accept null values
   */
  readonly nullable: () => Schema<T | null>;

  /**
   * Make this schema accept undefined values
   */
  readonly optional: () => Schema<T | undefined>;

  /**
   * Make this schema accept null or undefined values
   */
  readonly nullish: () => Schema<T | null | undefined>;
}

/**
 * Generic interface for schemas with specific string or number validations
 */
export interface PredicateSchema<T, S extends Schema<T>> {
  /**
   * Validate with a custom predicate function
   */
  readonly predicate: (
    predicate: (value: T) => boolean,
    message?: string | ((value: T) => string)
  ) => S;
}

/**
 * Generic interface for schemas that can have custom error messages
 */
export interface CustomErrorsSchema<T, S extends Schema<T>> {
  /**
   * Override error message for this schema
   */
  readonly error: (message: string) => S;
}

/**
 * Catch-all union schema interface
 */
export interface CatchAllSchema<T> extends Schema<T> {
  readonly catchAll: <U>(fallback: U | ((error: ValidationError) => U)) => Schema<T | U>;
}

/**
 * Boolean schema interface
 */
export interface BooleanSchema extends
  Schema<boolean>,
  RefinableSchema<boolean, BooleanSchema>,
  TransformableSchema<boolean, BooleanSchema>,
  DefaultableSchema<boolean, BooleanSchema>,
  NullableSchema<boolean, BooleanSchema> {
  readonly _tag: 'BooleanSchema';
}

/**
 * String schema interface
 */
export interface StringSchema extends
  Schema<string>,
  RefinableSchema<string, StringSchema>,
  TransformableSchema<string, StringSchema>,
  DefaultableSchema<string, StringSchema>,
  NullableSchema<string, StringSchema> {
  readonly _tag: 'StringSchema';

  // String specific validations
  readonly minLength: (min: number, message?: string) => StringSchema;
  readonly maxLength: (max: number, message?: string) => StringSchema;
  readonly length: (length: number, message?: string) => StringSchema;
  readonly regex: (pattern: RegExp, message?: string) => StringSchema;
  readonly email: (message?: string) => StringSchema;
  readonly url: (message?: string) => StringSchema;

  // String transformations
  readonly trim: (message?: string) => StringSchema;
  readonly toLowerCase: () => StringSchema;
  readonly toUpperCase: () => StringSchema;
}

/**
 * Number schema interface
 */
export interface NumberSchema extends
  Schema<number>,
  RefinableSchema<number, NumberSchema>,
  TransformableSchema<number, NumberSchema>,
  DefaultableSchema<number, NumberSchema>,
  NullableSchema<number, NumberSchema> {
  readonly _tag: 'NumberSchema';

  // Number specific validations
  readonly min: (min: number, message?: string) => NumberSchema;
  readonly max: (max: number, message?: string) => NumberSchema;
  readonly integer: (message?: string) => NumberSchema;
  readonly positive: (message?: string) => NumberSchema;
  readonly negative: (message?: string) => NumberSchema;
}

/**
 * Array schema interface
 */
export interface ArraySchema<T> extends
  Schema<T[]>,
  RefinableSchema<T[], ArraySchema<T>>,
  TransformableSchema<T[], ArraySchema<T>>,
  DefaultableSchema<T[], ArraySchema<T>>,
  NullableSchema<T[], ArraySchema<T>> {
  readonly _tag: 'ArraySchema';
  readonly elementSchema: Schema<T>;

  // Array specific validations
  readonly minLength: (min: number, message?: string) => ArraySchema<T>;
  readonly maxLength: (max: number, message?: string) => ArraySchema<T>;
  readonly length: (length: number, message?: string) => ArraySchema<T>;
}

/**
 * Object schema interface
 */
export interface ObjectSchema<T extends Record<string, any>> extends
  Schema<T>,
  RefinableSchema<T, ObjectSchema<T>>,
  TransformableSchema<T, ObjectSchema<T>>,
  DefaultableSchema<T, ObjectSchema<T>>,
  NullableSchema<T, ObjectSchema<T>> {
  readonly _tag: 'ObjectSchema';
  readonly properties: { [K in keyof T]: Schema<T[K]> };
} 