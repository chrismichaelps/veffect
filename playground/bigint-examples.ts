/**
 * BigInt Schema Examples
 *
 * This file demonstrates the usage of BigInt schema, including:
 * - Basic validation
 * - Numeric constraints (min, max, positive, negative, etc.)
 * - String conversions
 * - Refinements and transformations
 * - Optional, nullable, and default values
 */

import { bigint, object, string } from '../dist';

console.log('======== BigInt Schema Examples ========');

// Basic BigInt validation
const bigIntSchema = bigint();
const validator = bigIntSchema.toValidator();

console.log('\n1. Basic BigInt validation:');
console.log('Valid BigInt:', validator.safeParse(BigInt(123)));
console.log('Invalid number:', validator.safeParse(123));
console.log('Invalid string:', validator.safeParse('123'));

// Constraints
const positiveSchema = bigint().positive();
const negativeSchema = bigint().negative();
const rangeSchema = bigint().min(BigInt(10)).max(BigInt(100));
const multipleSchema = bigint().multipleOf(BigInt(5));

console.log('\n2. Constraints:');
console.log('Positive (valid):', positiveSchema.toValidator().safeParse(BigInt(42)));
console.log('Positive (invalid):', positiveSchema.toValidator().safeParse(BigInt(0)));
console.log('Negative (valid):', negativeSchema.toValidator().safeParse(BigInt(-42)));
console.log('Negative (invalid):', negativeSchema.toValidator().safeParse(BigInt(0)));
console.log('Range (valid):', rangeSchema.toValidator().safeParse(BigInt(50)));
console.log('Range (too small):', rangeSchema.toValidator().safeParse(BigInt(5)));
console.log('Range (too large):', rangeSchema.toValidator().safeParse(BigInt(200)));
console.log('Multiple of 5 (valid):', multipleSchema.toValidator().safeParse(BigInt(25)));
console.log('Multiple of 5 (invalid):', multipleSchema.toValidator().safeParse(BigInt(26)));

// From String conversion
const fromStringSchema = bigint().fromString();
const stringValidator = fromStringSchema.toValidator();

console.log('\n3. String conversion:');
console.log('Valid string to BigInt:', stringValidator.safeParse('12345'));
console.log('Invalid string to BigInt:', stringValidator.safeParse('not a number'));
console.log('Invalid type (number):', stringValidator.safeParse(12345));

// Refinements
const evenSchema = bigint().refine(
  n => n % BigInt(2) === BigInt(0),
  'BigInt must be even'
);

console.log('\n4. Refinements:');
console.log('Even number (valid):', evenSchema.toValidator().safeParse(BigInt(42)));
console.log('Odd number (invalid):', evenSchema.toValidator().safeParse(BigInt(43)));

// Transformations
const toString = bigint().transform(n => n.toString());
const toNumber = bigint().transform(n => Number(n));
const doubled = bigint().transform(n => n * BigInt(2));

console.log('\n5. Transformations:');
console.log('To string:', toString.toValidator().safeParse(BigInt(42)));
console.log('To number:', toNumber.toValidator().safeParse(BigInt(42)));
console.log('Doubled:', doubled.toValidator().safeParse(BigInt(50)));

// Optional, Nullable, and Default values
const optionalSchema = bigint().optional();
const nullableSchema = bigint().nullable();
const nullishSchema = bigint().nullish();
const defaultSchema = bigint().default(BigInt(42));

console.log('\n6. Optional, Nullable, and Default:');
console.log('Optional with value:', optionalSchema.toValidator().safeParse(BigInt(123)));
console.log('Optional with undefined:', optionalSchema.toValidator().safeParse(undefined));
console.log('Optional with null (invalid):', optionalSchema.toValidator().safeParse(null));

console.log('Nullable with value:', nullableSchema.toValidator().safeParse(BigInt(123)));
console.log('Nullable with null:', nullableSchema.toValidator().safeParse(null));
console.log('Nullable with undefined (invalid):', nullableSchema.toValidator().safeParse(undefined));

console.log('Nullish with value:', nullishSchema.toValidator().safeParse(BigInt(123)));
console.log('Nullish with null:', nullishSchema.toValidator().safeParse(null));
console.log('Nullish with undefined:', nullishSchema.toValidator().safeParse(undefined));

console.log('Default with value:', defaultSchema.toValidator().safeParse(BigInt(123)));
console.log('Default with undefined:', defaultSchema.toValidator().safeParse(undefined));

// Practical example: User with balance
const userSchema = object({
  id: string(),
  username: string().minLength(3).maxLength(20),
  balance: bigint().nonNegative()
});

const validUser = {
  id: 'user123',
  username: 'johndoe',
  balance: BigInt(1000)
};

const invalidUser = {
  id: 'user456',
  username: 'jane',
  balance: BigInt(-50) // Negative balance not allowed
};

console.log('\n7. Practical Example - User with Balance:');
console.log('Valid user:', userSchema.toValidator().safeParse(validUser));
console.log('Invalid user (negative balance):', userSchema.toValidator().safeParse(invalidUser));

// Performance comparison
const LARGE_BIGINT = BigInt('1234567890123456789012345678901234567890');
const LARGE_NUMBER = 12345678901234567890; // Will lose precision

console.log('\n8. Large Number Handling:');
console.log('Large BigInt:', LARGE_BIGINT);
console.log('Large Number (loses precision):', LARGE_NUMBER);
console.log('BigInt validation of large value:', validator.safeParse(LARGE_BIGINT));

// Combining validations
const combinedSchema = bigint()
  .min(BigInt(0))
  .max(BigInt(1000))
  .multipleOf(BigInt(10))
  .refine(n => (n / BigInt(10)) % BigInt(2) === BigInt(0), 'Tens digit must be even');

console.log('\n9. Combined Validations:');
console.log('Valid combined (20):', combinedSchema.toValidator().safeParse(BigInt(20)));
console.log('Valid combined (200):', combinedSchema.toValidator().safeParse(BigInt(200)));
console.log('Invalid combined (10):', combinedSchema.toValidator().safeParse(BigInt(10)));
console.log('Invalid combined (30):', combinedSchema.toValidator().safeParse(BigInt(30)));

console.log('\nBigInt schema examples completed!');
