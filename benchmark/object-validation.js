const { object, string, number, boolean, array } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const simpleObject = {
  name: 'John Doe',
  age: 30,
};

const complexObject = {
  id: '12345',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  isActive: true,
  preferences: {
    theme: 'dark',
    notifications: true,
    language: 'en-US',
  },
  tags: ['user', 'premium'],
  address: {
    street: '123 Main St',
    city: 'New York',
    zipCode: '10001',
    country: 'USA',
    coordinates: {
      lat: 40.7128,
      lng: -74.006,
    },
  },
};

// Simple object validation
function simpleObjectValidation() {
  const validator = object({
    name: string(),
    age: number().min(18),
  }).toValidator();

  return validator.safeParse(simpleObject);
}

// Complex nested object validation
function complexObjectValidation() {
  const validator = object({
    id: string(),
    name: string().minLength(2),
    email: string().email(),
    age: number().min(18).max(120),
    isActive: boolean(),
    preferences: object({
      theme: string(),
      notifications: boolean(),
      language: string(),
    }),
    tags: array(string()),
    address: object({
      street: string(),
      city: string(),
      zipCode: string(),
      country: string(),
      coordinates: object({
        lat: number(),
        lng: number(),
      }),
    }),
  }).toValidator();

  return validator.safeParse(complexObject);
}

// Object with optional fields
function optionalFieldsValidation() {
  const validator = object({
    name: string(),
    age: number().optional(),
    email: string().email().optional(),
  }).toValidator();

  return validator.safeParse(simpleObject);
}

// Object with strict validation (no extra properties)
function strictObjectValidation() {
  const validator = object({
    name: string(),
    age: number(),
  }).toValidator();

  return validator.safeParse(simpleObject);
}

// Object with transformations
function objectTransformValidation() {
  const validator = object({
    name: string(),
    age: number(),
  })
    .transform((obj) => ({
      ...obj,
      isAdult: obj.age >= 18,
      nameUpper: obj.name.toUpperCase(),
    }))
    .toValidator();

  return validator.safeParse(simpleObject);
}

// Run benchmarks for each type of object validation
console.log('\n=== Object Validation Benchmarks ===\n');

runSuite(
  'simple object validation',
  { veffect: simpleObjectValidation },
  20000
);
console.log('\n');

runSuite(
  'complex nested object validation',
  { veffect: complexObjectValidation },
  10000
);
console.log('\n');

runSuite(
  'object with optional fields',
  { veffect: optionalFieldsValidation },
  20000
);
console.log('\n');

runSuite(
  'strict object validation',
  { veffect: strictObjectValidation },
  20000
);
console.log('\n');

runSuite(
  'object with transformations',
  { veffect: objectTransformValidation },
  20000
);
