/**
 * Main schema exports
 */

// Export all schema types
export * from './schema/string';
export * from './schema/number';
export * from './schema/boolean';
export * from './schema/array';
export * from './schema/tuple';
export * from './schema/record';
export * from './schema/union';
export * from './schema/date';
export * from './schema/literal';
export * from './schema/optional';
export * from './schema/custom';
export * from './schema/object';
export * from './schema/discriminatedUnion';
export * from './schema/pattern';
export * from './schema/any';

// Direct exports of common functions needed by example.ts
export { string } from './schema/string';
export { number } from './schema/number';
export { boolean } from './schema/boolean';
export { array } from './schema/array';
export { object } from './schema/object';
export { optional } from './schema/optional';
export { discriminatedUnion } from './schema/discriminatedUnion';
export { pattern, invalid } from './schema/pattern';
export { any } from './schema/any';

// Re-export types
export {
  Schema,
  Validator,
  ValidatorOptions,
  ValidationResult,
  ValidationError,
  BooleanSchema,
  StringSchema,
  NumberSchema,
  ArraySchema,
  ObjectSchema
} from './types'; 