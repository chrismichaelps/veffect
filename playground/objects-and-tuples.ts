import { string, number, boolean, object, tuple, array } from '../dist';

console.log('Object and Tuple Validation Examples:');
console.log('-----------------------------------');

// Define an object schema for a user profile
const userSchema = object({
  id: string().uuid(),
  name: string().minLength(2).maxLength(100),
  email: string().email(),
  age: number().integer().positive(),
  isActive: boolean(),
  tags: array(string()),
  metadata: object({
    lastLogin: string().datetime(),
    preferences: object({
      theme: string().default('light'),
      notifications: boolean().default(true)
    }).optional()
  }).optional()
});

const userValidator = userSchema.toValidator();

// Valid user object
const validUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30,
  isActive: true,
  tags: ['developer', 'typescript'],
  metadata: {
    lastLogin: '2023-07-15T14:30:00Z',
    preferences: {
      theme: 'dark',
      notifications: false
    }
  }
};

console.log('Valid user object:');
console.log(userValidator.safeParse(validUser));

// Invalid user object
const invalidUser = {
  id: 'not-a-uuid',
  name: 'J', // Too short
  email: 'not-an-email',
  age: -5, // Negative age
  isActive: 'yes', // Not a boolean
  tags: ['developer', 123], // Not all strings
  metadata: {
    lastLogin: 'not-a-date',
    preferences: {
      theme: null, // Not a string
      notifications: 0 // Not a boolean
    }
  }
};

console.log('\nInvalid user object (with path information):');
const validationResult = userValidator.safeParse(invalidUser);
console.log('Result with path:', validationResult);

// Regular safeParse example
console.log('\nStandard validation (no path):');
console.log(userValidator.safeParse(invalidUser));

// Tuple schema examples
console.log('\nTuple Validation Examples:');
console.log('-------------------------');

// Define a tuple schema for a point with validation
const pointSchema = tuple(number(), number())
  .refine(
    ([x, y]) => Math.sqrt(x * x + y * y) <= 100,
    ([x, y]) => `Point (${x}, ${y}) is too far from origin`
  );

const pointValidator = pointSchema.toValidator();

console.log('Valid point (in range):');
console.log(pointValidator.safeParse([30, 40]));

console.log('\nInvalid point (out of range):');
console.log(pointValidator.safeParse([80, 80]));

console.log('\nInvalid point (wrong type):');
console.log(pointValidator.safeParse(['30', 40]));

// Tuple with nested object
const personLocationSchema = tuple(
  // Person
  object({
    name: string(),
    age: number().integer()
  }),
  // Location
  tuple(number(), number()),
  // Additional info
  object({
    timestamp: string().datetime(),
    accuracy: number()
  })
);

const personLocationValidator = personLocationSchema.toValidator();

console.log('\nComplex tuple with nested objects:');
console.log(personLocationValidator.safeParse([
  { name: 'Jane Doe', age: 28 },
  [35.6895, 139.6917], // Tokyo coordinates
  { timestamp: '2023-07-15T14:30:00Z', accuracy: 5.2 }
]));

// Object with default values
const configSchema = object({
  apiUrl: string().default('https://api.example.com'),
  timeout: number().integer().min(100).default(1000),
  debug: boolean().default(false),
  retryCount: number().integer().min(0).default(3)
});

const configValidator = configSchema.toValidator();

console.log('\nObject with default values:');
console.log('Empty config (all defaults):', configValidator.safeParse({}));
console.log('Partial config:', configValidator.safeParse({ timeout: 2000, debug: true }));

// Run with: npx ts-node playground/objects-and-tuples.ts 