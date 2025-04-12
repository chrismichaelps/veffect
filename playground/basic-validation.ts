import { string, number, boolean, object, ValidationError } from '../dist';

console.log('Basic Schema Validation Examples:');
console.log('--------------------------------');

// String schema with constraints
const emailSchema = string().email();
const validator = emailSchema.toValidator();

console.log('Email validation:');
console.log('Valid email:', validator.safeParse('test@example.com'));
console.log('Invalid email:', validator.safeParse('not-an-email'));

// Number schema with constraints
const ageSchema = number().integer().min(18).max(120);
const ageValidator = ageSchema.toValidator();

console.log('\nAge validation:');
console.log('Valid age:', ageValidator.safeParse(25));
console.log('Invalid age (not a number):', ageValidator.safeParse('25'));
console.log('Invalid age (too low):', ageValidator.safeParse(16));
console.log('Invalid age (too high):', ageValidator.safeParse(150));
console.log('Invalid age (decimal):', ageValidator.safeParse(25.5));

// Boolean schema
const booleanSchema = boolean();
const booleanValidator = booleanSchema.toValidator();

console.log('\nBoolean validation:');
console.log('Valid boolean (true):', booleanValidator.safeParse(true));
console.log('Valid boolean (false):', booleanValidator.safeParse(false));
console.log('Invalid boolean (string):', booleanValidator.safeParse('true'));
console.log('Invalid boolean (number):', booleanValidator.safeParse(1));

// Using default values
const colorSchema = string().default('blue');
const colorValidator = colorSchema.toValidator();

console.log('\nDefault values:');
console.log('With value provided:', colorValidator.safeParse('red'));
console.log('With undefined (uses default):', colorValidator.safeParse(undefined));

// Nullable and Optional schemas
const nullableSchema = string().nullable();
const optionalSchema = string().optional();
const nullishSchema = string().nullish();

console.log('\nNullable, Optional, and Nullish:');
console.log('Nullable with null:', nullableSchema.toValidator().safeParse(null));
console.log('Nullable with undefined:', nullableSchema.toValidator().safeParse(undefined));
console.log('Optional with undefined:', optionalSchema.toValidator().safeParse(undefined));
console.log('Optional with null:', optionalSchema.toValidator().safeParse(null));
console.log('Nullish with null:', nullishSchema.toValidator().safeParse(null));
console.log('Nullish with undefined:', nullishSchema.toValidator().safeParse(undefined));

console.log('\n\nPath Tracking in Validation Errors:');
console.log('----------------------------------');

// Create a simple object schema
const personSchema = object({
  name: string().minLength(3),
  email: string().email()
});

// Invalid data
const invalidPerson = {
  name: 'Jo', // Too short
  email: 'not-an-email' // Invalid email
};

// Standard validation
const personResult = personSchema.toValidator().safeParse(invalidPerson);
console.log('Standard validation path:');
if (!personResult.success) {
  console.log(`Error message: ${personResult.error.message}`);
  console.log(`Error path: ${JSON.stringify(personResult.error.path)}`);

  // Helper function to format error messages with paths
  function formatErrorWithPath(error: ValidationError): string {
    if (error._tag === 'ObjectValidationError' && 'errors' in error && Array.isArray((error as any).errors)) {
      return (error as any).errors.map(formatErrorWithPath).join('\n');
    }

    const pathStr = error.path ? error.path.join('.') : 'root';
    return `Error at ${pathStr}: ${error.message}`;
  }

  console.log('\nFormatted error:');
  console.log(formatErrorWithPath(personResult.error));
}

// Run with: npx ts-node playground/basic-validation.ts 