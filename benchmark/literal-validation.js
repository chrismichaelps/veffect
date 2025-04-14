const { literal, union, string } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const stringLiteralValue = 'admin';
const numberLiteralValue = 42;
const booleanLiteralValue = true;
const nullLiteralValue = null;

// String literal validation
function stringLiteralValidation() {
  const validator = literal('admin').toValidator();
  return validator.safeParse(stringLiteralValue);
}

// Number literal validation
function numberLiteralValidation() {
  const validator = literal(42).toValidator();
  return validator.safeParse(numberLiteralValue);
}

// Boolean literal validation
function booleanLiteralValidation() {
  const validator = literal(true).toValidator();
  return validator.safeParse(booleanLiteralValue);
}

// Null literal validation
function nullLiteralValidation() {
  const validator = literal(null).toValidator();
  return validator.safeParse(nullLiteralValue);
}

// Union of literals validation (enum-like)
function unionOfLiteralsValidation() {
  const validator = union([
    literal('admin'),
    literal('user'),
    literal('guest'),
  ]).toValidator();

  return validator.safeParse(stringLiteralValue);
}

// Literal with transformations
function literalTransformValidation() {
  const validator = literal('admin')
    .transform(() => ({
      role: 'admin',
      permissions: ['read', 'write', 'delete'],
    }))
    .toValidator();

  return validator.safeParse(stringLiteralValue);
}

// Run benchmarks for each type of literal validation
console.log('\n=== Literal Validation Benchmarks ===\n');

runSuite(
  'literal(string).safeParse',
  { veffect: stringLiteralValidation },
  50000
);
console.log('\n');

runSuite(
  'literal(number).safeParse',
  { veffect: numberLiteralValidation },
  50000
);
console.log('\n');

runSuite(
  'literal(boolean).safeParse',
  { veffect: booleanLiteralValidation },
  50000
);
console.log('\n');

runSuite('literal(null).safeParse', { veffect: nullLiteralValidation }, 50000);
console.log('\n');

runSuite(
  'union of literals (enum)',
  { veffect: unionOfLiteralsValidation },
  20000
);
console.log('\n');

runSuite(
  'literal with transform',
  { veffect: literalTransformValidation },
  20000
);
