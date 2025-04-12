import { object, string, number, ValidationError } from '../dist';

console.log('Simple Path Tracking Example:');
console.log('----------------------------');

// Create a simple object schema
const personSchema = object({
  name: string().minLength(3),
  age: number().min(18)
});

// Create a validator
const validator = personSchema.toValidator();

// Test with invalid data
const invalidPerson = {
  name: 'Jo', // Too short
  age: 15    // Too young
};

// Standard validation
const result = validator.safeParse(invalidPerson);
console.log('Standard validation result:');
console.log(JSON.stringify(result, null, 2));

// Validation with custom path - use parse method to see the error thrown
console.log('\nValidation with parse method (will throw error):');
try {
  validator.parse(invalidPerson);
} catch (error: unknown) {
  const validationError = error as ValidationError;
  console.log(JSON.stringify(validationError, null, 2));
}

// Run with: npx ts-node playground/simple-path-demo.ts 