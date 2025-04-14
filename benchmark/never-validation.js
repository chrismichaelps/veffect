const { never } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const stringValue = 'test string';
const numberValue = 42;
const objectValue = { key: 'value' };

// Never validation - always fails
function neverValidation() {
  const validator = never().toValidator();

  try {
    return validator.safeParse(stringValue);
  } catch (error) {
    // We expect this to fail, but we're measuring the performance
    return { success: false, error };
  }
}

// Never validation with a number
function neverNumberValidation() {
  const validator = never().toValidator();

  try {
    return validator.safeParse(numberValue);
  } catch (error) {
    return { success: false, error };
  }
}

// Never validation with an object
function neverObjectValidation() {
  const validator = never().toValidator();

  try {
    return validator.safeParse(objectValue);
  } catch (error) {
    return { success: false, error };
  }
}

// Run benchmarks for never validation
console.log('\n=== Never Validation Benchmarks ===\n');

runSuite('never().safeParse(string)', { veffect: neverValidation }, 20000);
console.log('\n');

runSuite(
  'never().safeParse(number)',
  { veffect: neverNumberValidation },
  20000
);
console.log('\n');

runSuite(
  'never().safeParse(object)',
  { veffect: neverObjectValidation },
  20000
);
