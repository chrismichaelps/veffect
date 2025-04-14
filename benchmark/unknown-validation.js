const { unknown } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data for different types
const stringValue = 'test string';
const numberValue = 42;
const booleanValue = true;
const objectValue = { key: 'value' };
const arrayValue = [1, 2, 3];
const nullValue = null;
const undefinedValue = undefined;

// Basic unknown validation
function basicUnknownValidation() {
  const validator = unknown().toValidator();
  return validator.safeParse(stringValue);
}

// Unknown with refinement
function refinementUnknownValidation() {
  const validator = unknown()
    .refine(
      (val) => val !== null && val !== undefined,
      'Value cannot be null or undefined'
    )
    .toValidator();

  return validator.safeParse(numberValue);
}

// Unknown with transformation
function transformUnknownValidation() {
  const validator = unknown()
    .transform((val) => {
      if (typeof val === 'string') {
        return val.toUpperCase();
      }
      return val;
    })
    .toValidator();

  return validator.safeParse(stringValue);
}

// Unknown with type-checking transformation
function typeCheckUnknownValidation() {
  const validator = unknown()
    .transform((val) => {
      if (typeof val === 'number') {
        return val * 2;
      } else if (typeof val === 'string') {
        return val.toUpperCase();
      } else if (Array.isArray(val)) {
        return [...val, 'extra'];
      } else if (typeof val === 'object' && val !== null) {
        return { ...val, processed: true };
      }
      return val;
    })
    .toValidator();

  return validator.safeParse(objectValue);
}

// Run benchmarks for each type of unknown validation
console.log('\n=== Unknown Validation Benchmarks ===\n');

runSuite('unknown().safeParse', { veffect: basicUnknownValidation }, 50000);
console.log('\n');

runSuite(
  'unknown().refine().safeParse',
  { veffect: refinementUnknownValidation },
  20000
);
console.log('\n');

runSuite(
  'unknown() with transform',
  { veffect: transformUnknownValidation },
  20000
);
console.log('\n');

runSuite(
  'unknown() with type-check transform',
  { veffect: typeCheckUnknownValidation },
  20000
);
