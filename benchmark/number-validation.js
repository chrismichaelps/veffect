const { number } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const testNumber = 42;
const negativeNumber = -10;
const floatNumber = 3.14159;

// Basic number validation
function basicNumberValidation() {
  const validator = number().toValidator();
  return validator.safeParse(testNumber);
}

// Min/max validation
function minMaxValidation() {
  const validator = number().min(0).max(100).toValidator();
  return validator.safeParse(testNumber);
}

// Integer validation
function integerValidation() {
  const validator = number().integer().toValidator();
  return validator.safeParse(testNumber);
}

// Positive number validation
function positiveValidation() {
  const validator = number().positive().toValidator();
  return validator.safeParse(testNumber);
}

// Negative number validation
function negativeValidation() {
  const validator = number().negative().toValidator();
  return validator.safeParse(negativeNumber);
}

// Multiple of validation
function multipleOfValidation() {
  const validator = number().multipleOf(2).toValidator();
  return validator.safeParse(testNumber);
}

// Float with precision validation
function floatValidation() {
  const validator = number().min(3).max(4).toValidator();
  return validator.safeParse(floatNumber);
}

// Number with transformation
function transformValidation() {
  const validator = number()
    .transform((n) => n * 2)
    .toValidator();
  return validator.safeParse(testNumber);
}

// Run benchmarks for each type of number validation
console.log('\n=== Number Validation Benchmarks ===\n');

runSuite('number().safeParse', { veffect: basicNumberValidation }, 50000);
console.log('\n');

runSuite(
  'number().min().max().safeParse',
  { veffect: minMaxValidation },
  20000
);
console.log('\n');

runSuite('number().integer().safeParse', { veffect: integerValidation }, 20000);
console.log('\n');

runSuite(
  'number().positive().safeParse',
  { veffect: positiveValidation },
  20000
);
console.log('\n');

runSuite(
  'number().negative().safeParse',
  { veffect: negativeValidation },
  20000
);
console.log('\n');

runSuite(
  'number().multipleOf().safeParse',
  { veffect: multipleOfValidation },
  20000
);
console.log('\n');

runSuite('float number validation', { veffect: floatValidation }, 20000);
console.log('\n');

runSuite('number() with transforms', { veffect: transformValidation }, 20000);
