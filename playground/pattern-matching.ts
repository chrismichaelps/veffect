import { object, string, pattern, invalid, literal, any, ValidationError } from '../dist';

console.log('Pattern Matching Schema Example:');
console.log('-------------------------------');

// Helper function to format error messages with paths
function formatErrorWithPath(error: ValidationError): string {
  if (error._tag === 'ObjectValidationError' && 'errors' in error && Array.isArray((error as any).errors)) {
    return (error as any).errors.map(formatErrorWithPath).join('\n');
  }

  const pathStr = error.path ? error.path.join('.') : 'root';
  return `Error at ${pathStr}: ${error.message}`;
}

// Define a pattern schema for API responses
type ResponseType =
  | { status: 'success'; data: any }
  | { status: 'error'; message: string; code: string }
  | { status: 'pending'; id: string };

const responseSchema = pattern<ResponseType>(input => {
  if (typeof input !== 'object' || input === null) {
    return invalid('Expected an object');
  }

  // Check the status property to determine the shape
  const status = (input as any).status;

  if (status === 'success') {
    return object({
      status: literal('success'),
      data: any() // Accept any data structure
    });
  }

  if (status === 'error') {
    return object({
      status: literal('error'),
      message: string(),
      code: string()
    });
  }

  if (status === 'pending') {
    return object({
      status: literal('pending'),
      id: string()
    });
  }

  return invalid(`Unknown status type: ${status}`);
});

// Create a validator
const validator = responseSchema.toValidator();

// Valid examples
const successResponse = {
  status: 'success',
  data: { user: { id: 123, name: 'Test User' } }
};

const errorResponse = {
  status: 'error',
  message: 'Something went wrong',
  code: 'ERR_SERVER'
};

const pendingResponse = {
  status: 'pending',
  id: 'job-123'
};

// Invalid examples
const invalidStatus = {
  status: 'unknown', // Not one of our defined statuses
  data: {}
};

const invalidErrorResponse = {
  status: 'error',
  // Missing required message field
  code: 'ERR_SERVER'
};

const notAnObject = 'just a string';

console.log('\nValidating valid examples:');
console.log('Success response:', validator.safeParse(successResponse).success);
console.log('Error response:', validator.safeParse(errorResponse).success);
console.log('Pending response:', validator.safeParse(pendingResponse).success);

console.log('\nValidating invalid examples:');
const invalidStatusResult = validator.safeParse(invalidStatus);
if (!invalidStatusResult.success) {
  console.log('\nInvalid Status Error:');
  console.log(formatErrorWithPath(invalidStatusResult.error));
}

const invalidErrorResult = validator.safeParse(invalidErrorResponse);
if (!invalidErrorResult.success) {
  console.log('\nInvalid Error Response:');
  console.log(formatErrorWithPath(invalidErrorResult.error));
}

const notObjectResult = validator.safeParse(notAnObject);
if (!notObjectResult.success) {
  console.log('\nNot an Object Error:');
  console.log(formatErrorWithPath(notObjectResult.error));
}

// Run with: npx ts-node playground/pattern-matching.ts 