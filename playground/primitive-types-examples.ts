/**
 * Primitive Types Examples
 *
 * This playground demonstrates the usage of all primitive types in VEffect,
 * with a focus on the newly added primitives.
 */

import {
  any,
  symbol,
  nullType,
  undefinedType,
  voidType,
  unknown,
  never
} from '../dist';

console.log('VEffect Primitive Types Playground');
console.log('==================================');

// -------------------------------------------------------------------------
// Symbol Type
// -------------------------------------------------------------------------
console.log('\n📌 Symbol Type');

const symbolSchema = symbol();
const testSymbol = Symbol('test');

try {
  console.log('Validating a Symbol:', symbolSchema.toValidator().parse(testSymbol));
  console.log('Attempting to validate a string as Symbol...');
  symbolSchema.toValidator().parse('not a symbol');

} catch (error) {
  console.log('Error:', error);
}

// -------------------------------------------------------------------------
// Null Type
// -------------------------------------------------------------------------
console.log('\n📌 Null Type');

const nullSchema = nullType();

try {
  console.log('Validating null:', nullSchema.toValidator().parse(null));
  console.log('Attempting to validate undefined as null...');
  nullSchema.toValidator().parse(undefined);
} catch (error) {
  console.log('Error:', error);
}

// -------------------------------------------------------------------------
// Undefined Type
// -------------------------------------------------------------------------
console.log('\n📌 Undefined Type');

const undefinedSchema = undefinedType();

try {
  console.log('Validating undefined:', undefinedSchema.toValidator().parse(undefined) === undefined ? 'undefined' : 'not undefined');
  console.log('Attempting to validate null as undefined...');
  undefinedSchema.toValidator().parse(null);
} catch (error) {
  console.log('Error:', error);
}

// -------------------------------------------------------------------------
// Void Type
// -------------------------------------------------------------------------
console.log('\n📌 Void Type');

const voidSchema = voidType();

try {
  console.log('Validating undefined as void:', voidSchema.toValidator().parse(undefined) === undefined ? 'void (undefined)' : 'not void');
  console.log('Attempting to validate null as void...');
  voidSchema.toValidator().parse(null);
} catch (error) {
  console.log('Error:', error);
}

// -------------------------------------------------------------------------
// Unknown Type
// -------------------------------------------------------------------------
console.log('\n📌 Unknown Type');

const unknownSchema = unknown();

// Unknown type accepts any value but maintains type safety
console.log('Validating string as unknown:', unknownSchema.toValidator().parse('string'));
console.log('Validating number as unknown:', unknownSchema.toValidator().parse(123));
console.log('Validating null as unknown:', unknownSchema.toValidator().parse(null));
console.log('Validating undefined as unknown:', unknownSchema.toValidator().parse(undefined) === undefined ? 'undefined' : 'not undefined');
console.log('Validating object as unknown:', unknownSchema.toValidator().parse({ hello: 'world' }));

// -------------------------------------------------------------------------
// Never Type
// -------------------------------------------------------------------------
console.log('\n📌 Never Type');

const neverSchema = never();

try {
  console.log('Attempting to validate string as never...');
  neverSchema.toValidator().parse('anything');
} catch (error) {
  console.log('Error:', error);
}

// -------------------------------------------------------------------------
// Comparison with Any Type
// -------------------------------------------------------------------------
console.log('\n📌 Comparison: Any vs Unknown');

const anySchema = any();
const value = anySchema.toValidator().parse('hello');
// With any, TypeScript allows you to do anything without type checking
console.log('Any allows operations without type checking:', value.toUpperCase());

const unknownValue = unknownSchema.toValidator().parse('hello');
// With unknown, you need to perform type checking before operations
// The following line would cause a TypeScript compilation error:
// console.log('Unknown requires type checking:', unknownValue.toUpperCase());

// Correct usage with type checking
if (typeof unknownValue === 'string') {
  console.log('Unknown with type checking:', unknownValue.toUpperCase());
}

// -------------------------------------------------------------------------
// Practical Usage Examples
// -------------------------------------------------------------------------
console.log('\n📌 Practical Examples');

// Example 1: Function that accepts any primitive type
function validatePrimitive(value: unknown) {
  // Create a union of all primitive types
  const primitiveSchema = unknown();
  return primitiveSchema.toValidator().safeParse(value);
}

console.log('Validating string as primitive:', validatePrimitive('test').success);
console.log('Validating object as primitive:', validatePrimitive({}).success);

// Example 2: Symbol as unique identifier
const ADMIN_ROLE = Symbol('ADMIN');
const USER_ROLE = Symbol('USER');

function checkRole(role: symbol) {
  const roleSchema = symbol();
  // Validate that it's a symbol
  roleSchema.toValidator().parse(role);

  // Use the symbol for comparison
  if (role === ADMIN_ROLE) {
    return 'Admin access granted';
  } else if (role === USER_ROLE) {
    return 'User access granted';
  }
  return 'Access denied';
}

console.log('Admin role check:', checkRole(ADMIN_ROLE));
console.log('User role check:', checkRole(USER_ROLE));

try {
  console.log('Invalid role check:');
  // @ts-ignore - Intentional error for demonstration
  checkRole('ADMIN');
} catch (error) {
  console.log('Error:', error);
}

// Example 3: Nullable and optional fields
type UserProfile = {
  id: string;
  name: string;
  email: string | null;      // Nullable field
  phoneNumber?: string;      // Optional field (implicitly undefined)
  lastLogin: Date | void;    // Can be undefined
  settings: unknown;         // Can be any type, with proper type safety
};

// This playground showcases how VEffect supports all JavaScript primitive types,
// including the newly added symbol, null, undefined, void, unknown, and never types.
