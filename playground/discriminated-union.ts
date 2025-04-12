import { object, string, array, literal, discriminatedUnion, number, ValidationError } from '../dist';

console.log('Discriminated Union Schema Example:');
console.log('----------------------------------');

// Helper function to format error messages with paths
function formatErrorWithPath(error: ValidationError): string {
  if (error._tag === 'ObjectValidationError' && 'errors' in error && Array.isArray((error as any).errors)) {
    return (error as any).errors.map(formatErrorWithPath).join('\n');
  }

  const pathStr = error.path ? error.path.join('.') : 'root';
  return `Error at ${pathStr}: ${error.message}`;
}

// Define a discriminated union schema for different types of users
const userSchema = discriminatedUnion('role', [
  // Admin schema
  object({
    role: literal('admin'),
    name: string(),
    permissions: array(string())
  }),

  // Regular user schema
  object({
    role: literal('user'),
    name: string(),
    age: number().min(18)
  }),

  // Guest schema
  object({
    role: literal('guest'),
    visitorId: string()
  })
]);

// Create a validator
const validator = userSchema.toValidator();

// Valid examples
const admin = {
  role: 'admin',
  name: 'Admin User',
  permissions: ['read', 'write', 'delete']
};

const user = {
  role: 'user',
  name: 'Regular User',
  age: 25
};

const guest = {
  role: 'guest',
  visitorId: 'visitor-123'
};

// Invalid examples
const invalidAdmin = {
  role: 'admin',
  name: 'Invalid Admin',
  // Missing permissions array
};

const invalidUser = {
  role: 'user',
  name: 'Young User',
  age: 16 // Below minimum age
};

const invalidRole = {
  role: 'superuser', // Role not defined in our schemas
  name: 'Unknown User'
};

const missingDiscriminator = {
  // Missing 'role' property
  name: 'No Role User'
};

console.log('\nValidating valid examples:');
console.log('Admin validation:', validator.safeParse(admin).success);
console.log('User validation:', validator.safeParse(user).success);
console.log('Guest validation:', validator.safeParse(guest).success);

console.log('\nValidating invalid examples:');
const adminResult = validator.safeParse(invalidAdmin);
if (!adminResult.success) {
  console.log('\nInvalid Admin Error:');
  console.log(formatErrorWithPath(adminResult.error));
}

const userResult = validator.safeParse(invalidUser);
if (!userResult.success) {
  console.log('\nInvalid User Error:');
  console.log(formatErrorWithPath(userResult.error));
}

const roleResult = validator.safeParse(invalidRole);
if (!roleResult.success) {
  console.log('\nInvalid Role Error:');
  console.log(formatErrorWithPath(roleResult.error));
}

const missingResult = validator.safeParse(missingDiscriminator);
if (!missingResult.success) {
  console.log('\nMissing Discriminator Error:');
  console.log(formatErrorWithPath(missingResult.error));
}

// Run with: npx ts-node playground/discriminated-union.ts 