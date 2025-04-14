const { boolean } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const trueValue = true;
const falseValue = false;
const nullValue = null;

// Basic boolean validation
function basicBooleanValidation() {
  const validator = boolean().toValidator();
  return validator.safeParse(trueValue);
}

// Boolean with default validation
function defaultBooleanValidation() {
  const validator = boolean().default(false).toValidator();
  return validator.safeParse(undefined);
}

// Boolean with refinement
function refinementBooleanValidation() {
  const validator = boolean()
    .refine((val) => val === true, 'Value must be true')
    .toValidator();
  return validator.safeParse(trueValue);
}

// Boolean with transformation
function transformBooleanValidation() {
  const validator = boolean()
    .transform((val) => (val ? 'Yes' : 'No'))
    .toValidator();
  return validator.safeParse(trueValue);
}

// Run benchmarks for each type of boolean validation
console.log('\n=== Boolean Validation Benchmarks ===\n');

runSuite('boolean().safeParse', { veffect: basicBooleanValidation }, 50000);
console.log('\n');

runSuite(
  'boolean().default().safeParse',
  { veffect: defaultBooleanValidation },
  20000
);
console.log('\n');

runSuite(
  'boolean().refine().safeParse',
  { veffect: refinementBooleanValidation },
  20000
);
console.log('\n');

runSuite(
  'boolean().transform().safeParse',
  { veffect: transformBooleanValidation },
  20000
);
