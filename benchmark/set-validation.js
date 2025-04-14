const { set, string, number } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const stringSet = new Set(['apple', 'banana', 'cherry', 'date', 'elderberry']);
const numberSet = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const mixedSet = new Set(['a', 1, 'b', 2, 'c', 3]);

// Basic Set validation (string set)
function stringSetValidation() {
  const validator = set(string()).toValidator();
  return validator.safeParse(stringSet);
}

// Number Set validation
function numberSetValidation() {
  const validator = set(number().positive()).toValidator();
  return validator.safeParse(numberSet);
}

// Set with size constraints
function setSizeValidation() {
  const validator = set(string()).minSize(3).maxSize(10).toValidator();
  return validator.safeParse(stringSet);
}

// Set with element refinement
function setRefinementValidation() {
  const validator = set(string().minLength(4)).toValidator();
  return validator.safeParse(stringSet);
}

// Set with transformation
function setTransformValidation() {
  const validator = set(number())
    .transform((s) => new Set([...s].map((n) => n * 2)))
    .toValidator();

  return validator.safeParse(numberSet);
}

// Set with non-empty constraint
function nonEmptySetValidation() {
  const validator = set(string()).nonEmpty().toValidator();
  return validator.safeParse(stringSet);
}

// Run benchmarks for each type of set validation
console.log('\n=== Set Validation Benchmarks ===\n');

runSuite('set(string()).safeParse', { veffect: stringSetValidation }, 20000);
console.log('\n');

runSuite('set(number()).safeParse', { veffect: numberSetValidation }, 20000);
console.log('\n');

runSuite('set() with size constraints', { veffect: setSizeValidation }, 20000);
console.log('\n');

runSuite(
  'set() with element refinement',
  { veffect: setRefinementValidation },
  20000
);
console.log('\n');

runSuite(
  'set() with transformations',
  { veffect: setTransformValidation },
  20000
);
console.log('\n');

runSuite(
  'set().nonEmpty().safeParse',
  { veffect: nonEmptySetValidation },
  20000
);
