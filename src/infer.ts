/**
 * Type inference utilities for VEffect
 * This module provides type utilities to extract TypeScript types from schemas,
 */
import type { Schema } from './types';

/**
 * Extracts the output type from a schema
 * This is the primary type utility most users will use.
 *
 * @example
 * ```ts
 * const UserSchema = object({
 *   id: number().integer(),
 *   name: string().minLength(2),
 *   email: string().email()
 * });
 *
 * type User = Infer<typeof UserSchema>;
 * // equivalent to:
 * // type User = {
 * //   id: number;
 * //   name: string;
 * //   email: string;
 * // }
 * ```
 */
export type Infer<T extends Schema<any, any>> = T extends Schema<infer O, any> ? O : never;

/**
 * Extracts the input type from a schema
 * This is useful when working with schemas that have input/output type differences
 * due to transformations.
 *
 * @example
 * ```ts
 * const StringToNumber = string().transform(val => parseInt(val, 10));
 *
 * type Input = Input<typeof StringToNumber>; // string
 * type Output = Infer<typeof StringToNumber>; // number
 * ```
 */
export type Input<T extends Schema<any, any>> = T extends Schema<any, infer I> ? I : never;

/**
 * Extracts the output type from a schema
 * This is an alias for Infer for users who prefer more explicit naming.
 */
export type Output<T extends Schema<any, any>> = Infer<T>;

/**
 * Type utility for creating schema transformation functions
 * that preserve proper typing.
 *
 * @example
 * ```ts
 * function inferSchema<T extends SchemaType>(schema: T): T {
 *   return schema;
 * }
 * ```
 */
export type SchemaType = Schema<any, any>;

/**
 * Type utility for schema-processing functions that need to
 * preserve the specific schema subtype.
 *
 * @example
 * ```ts
 * function processSchema<T extends SchemaType>(schema: T): T {
 *   // Process the schema while preserving its specific type
 *   return schema;
 * }
 * ```
 */
export type PreserveSchema<T extends SchemaType> = T;

/**
 * Helper type to extract the inferred type from a schema or a plain type.
 * Allows working with either schemas or direct TypeScript types.
 *
 * @example
 * ```ts
 * // With a schema
 * type A = InferOrType<typeof MySchema>; // Extract schema's inferred type
 *
 * // With a direct type
 * type B = InferOrType<string>; // string
 * ```
 */
export type InferOrType<T> = T extends SchemaType ? Infer<T> : T;

