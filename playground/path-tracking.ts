import { string, number, boolean, object, array, ValidationError } from '../dist';

console.log('Path Tracking in Validation Errors:');
console.log('----------------------------------');

// Function to recursively extract and display errors with their paths
function displayErrors(error: ValidationError, indent = 0) {
  const padding = ' '.repeat(indent);

  if (error._tag === 'ObjectValidationError' && 'errors' in error && Array.isArray((error as any).errors)) {
    console.log(`${padding}Object validation errors:`);
    for (const err of (error as any).errors) {
      displayErrors(err, indent + 2);
    }
  } else {
    const path = error.path ? error.path.join('.') : 'unknown path';
    console.log(`${padding}Path: ${path}`);
    console.log(`${padding}Error: ${error.message}`);
    console.log(`${padding}Type: ${error._tag}`);
    console.log();
  }
}

// Create a deeply nested schema
const addressSchema = object({
  street: string(),
  city: string(),
  zipCode: string().regex(/^\d{5}$/, 'Zip code must be 5 digits')
});

const contactSchema = object({
  email: string().email('Invalid email address'),
  phone: string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  address: addressSchema
});

const userSchema = object({
  name: string().minLength(2),
  age: number().integer().min(18).max(120),
  isActive: boolean(),
  contacts: array(contactSchema)
});

// Create invalid data with errors at different levels
const invalidUser = {
  name: 'J', // Too short
  age: 16, // Too young
  isActive: true,
  contacts: [
    {
      email: 'valid@example.com',
      phone: '1234567890',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        zipCode: '12345'
      }
    },
    {
      email: 'invalid-email', // Invalid email
      phone: '123', // Invalid phone
      address: {
        street: '456 Oak St',
        city: 'Somewhere',
        zipCode: 'ABC12' // Invalid zip code
      }
    }
  ]
};

const validator = userSchema.toValidator();
const result = validator.safeParse(invalidUser);

// Display the validation result
console.log('Validation Result:', result);

// If validation failed, extract and display path information
if (!result.success) {
  console.log('\nFormatted Error Information:');
  displayErrors(result.error);
}

// Now try with a custom root path
console.log('\nValidation with custom root path:');
const customPathResult = validator.safeParse(invalidUser);

console.log('Custom path result:', customPathResult);

if (!customPathResult.success) {
  console.log('\nFormatted Error Information (with custom root path):');
  displayErrors(customPathResult.error);
}

// Run with: npx ts-node playground/path-tracking.ts 