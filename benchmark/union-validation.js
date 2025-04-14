const {
  union,
  discriminatedUnion,
  literal,
  object,
  string,
  number,
  boolean,
  array,
} = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const stringValue = 'test string';
const numberValue = 42;
const booleanValue = true;

// Shape data for discriminated union
const circleShape = { type: 'circle', radius: 10 };
const rectangleShape = { type: 'rectangle', width: 20, height: 30 };
const triangleShape = { type: 'triangle', base: 15, height: 25 };

// Result data
const successResult = { status: 'success', data: { id: 123, name: 'Test' } };
const errorResult = { status: 'error', message: 'Something went wrong' };

// Simple union validation
function simpleUnionValidation() {
  const validator = union([string(), number(), boolean()]).toValidator();
  return validator.safeParse(stringValue);
}

// Union with different types validation
function multiTypeUnionValidation() {
  const validator = union([
    string(),
    number(),
    boolean(),
    object({ key: string() }),
    array(number()),
  ]).toValidator();

  return validator.safeParse(numberValue);
}

// Discriminated union validation for shapes
function shapeDiscriminatedUnionValidation() {
  const validator = discriminatedUnion('type', [
    object({
      type: literal('circle'),
      radius: number().positive(),
    }),
    object({
      type: literal('rectangle'),
      width: number().positive(),
      height: number().positive(),
    }),
    object({
      type: literal('triangle'),
      base: number().positive(),
      height: number().positive(),
    }),
  ]).toValidator();

  return validator.safeParse(rectangleShape);
}

// Discriminated union for API results
function resultDiscriminatedUnionValidation() {
  const validator = discriminatedUnion('status', [
    object({
      status: literal('success'),
      data: object({
        id: number(),
        name: string(),
      }),
    }),
    object({
      status: literal('error'),
      message: string(),
    }),
  ]).toValidator();

  return validator.safeParse(successResult);
}

// Run benchmarks for each type of union validation
console.log('\n=== Union Validation Benchmarks ===\n');

runSuite('simple union validation', { veffect: simpleUnionValidation }, 20000);
console.log('\n');

runSuite(
  'multi-type union validation',
  { veffect: multiTypeUnionValidation },
  20000
);
console.log('\n');

runSuite(
  'discriminated union (shapes)',
  { veffect: shapeDiscriminatedUnionValidation },
  20000
);
console.log('\n');

runSuite(
  'discriminated union (API results)',
  { veffect: resultDiscriminatedUnionValidation },
  20000
);
