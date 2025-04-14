const { nullType, undefinedType, voidType } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const nullValue = null;
const undefinedValue = undefined;
const stringValue = 'test string';
const numberValue = 42;

// Null validation
function nullValidation() {
  const validator = nullType().toValidator();
  return validator.safeParse(nullValue);
}

// Null validation (invalid)
function nullInvalidValidation() {
  const validator = nullType().toValidator();
  return validator.safeParse(undefinedValue);
}

// Undefined validation
function undefinedValidation() {
  const validator = undefinedType().toValidator();
  return validator.safeParse(undefinedValue);
}

// Undefined validation (invalid)
function undefinedInvalidValidation() {
  const validator = undefinedType().toValidator();
  return validator.safeParse(nullValue);
}

// Void validation (accepts undefined)
function voidValidation() {
  const validator = voidType().toValidator();
  return validator.safeParse(undefinedValue);
}

// Void validation (invalid)
function voidInvalidValidation() {
  const validator = voidType().toValidator();
  return validator.safeParse(nullValue);
}

// Run benchmarks for null validation
console.log('\n=== Null/Undefined Validation Benchmarks ===\n');

runSuite('nullType().safeParse', { veffect: nullValidation }, 20000);
console.log('\n');

runSuite(
  'nullType() with invalid input',
  { veffect: nullInvalidValidation },
  20000
);
console.log('\n');

runSuite('undefinedType().safeParse', { veffect: undefinedValidation }, 20000);
console.log('\n');

runSuite(
  'undefinedType() with invalid input',
  { veffect: undefinedInvalidValidation },
  20000
);
console.log('\n');

runSuite('voidType().safeParse', { veffect: voidValidation }, 20000);
console.log('\n');

runSuite(
  'voidType() with invalid input',
  { veffect: voidInvalidValidation },
  20000
);
