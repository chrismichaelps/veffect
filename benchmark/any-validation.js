const { any } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data for different types
const stringValue = 'test string';
const numberValue = 42;
const booleanValue = true;
const objectValue = { key: 'value' };
const arrayValue = [1, 2, 3];
const nullValue = null;
const undefinedValue = undefined;

// Basic any validation
function basicAnyValidation() {
  const validator = any().toValidator();
  return validator.safeParse(stringValue);
}

// Any with refinement
function refinementAnyValidation() {
  const validator = any()
    .refine(
      (val) => val !== null && val !== undefined,
      'Value cannot be null or undefined'
    )
    .toValidator();

  return validator.safeParse(numberValue);
}

// Any with transformation
function transformAnyValidation() {
  const validator = any()
    .transform((val) => (typeof val === 'string' ? val.toUpperCase() : val))
    .toValidator();

  return validator.safeParse(stringValue);
}

// Any with object transformation
function objectTransformAnyValidation() {
  const validator = any()
    .transform((val) => {
      if (typeof val === 'object' && val !== null) {
        return { ...val, processed: true };
      }
      return val;
    })
    .toValidator();

  return validator.safeParse(objectValue);
}

// Run benchmarks for each type of any validation
console.log('\n=== Any Validation Benchmarks ===\n');

runSuite('any().safeParse', { veffect: basicAnyValidation }, 50000);
console.log('\n');

runSuite(
  'any().refine().safeParse',
  { veffect: refinementAnyValidation },
  20000
);
console.log('\n');

runSuite(
  'any() with string transform',
  { veffect: transformAnyValidation },
  20000
);
console.log('\n');

runSuite(
  'any() with object transform',
  { veffect: objectTransformAnyValidation },
  20000
);
