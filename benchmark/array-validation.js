const { array, string, number, object } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const stringArray = ['one', 'two', 'three', 'four', 'five'];
const numberArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const objectArray = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Bob' },
  { id: 4, name: 'Alice' },
];
const nestedArray = [
  ['a', 'b', 'c'],
  [1, 2, 3],
  [true, false],
];

// Basic array of strings validation
function stringArrayValidation() {
  const validator = array(string()).toValidator();
  return validator.safeParse(stringArray);
}

// Array of numbers validation
function numberArrayValidation() {
  const validator = array(number().positive()).toValidator();
  return validator.safeParse(numberArray);
}

// Array of objects validation
function objectArrayValidation() {
  const validator = array(
    object({
      id: number(),
      name: string(),
    })
  ).toValidator();

  return validator.safeParse(objectArray);
}

// Array with length constraints
function arrayLengthValidation() {
  const validator = array(string()).minLength(3).maxLength(10).toValidator();
  return validator.safeParse(stringArray);
}

// Array with non-empty constraint
function nonEmptyArrayValidation() {
  const validator = array(string()).nonEmpty().toValidator();
  return validator.safeParse(stringArray);
}

// Array with transformation
function arrayTransformValidation() {
  const validator = array(number())
    .transform((arr) => arr.map((n) => n * 2))
    .toValidator();

  return validator.safeParse(numberArray);
}

// Array with element refinement
function arrayRefinementValidation() {
  const validator = array(
    string().refine(
      (s) => s.length >= 3,
      'String must be at least 3 characters'
    )
  ).toValidator();

  return validator.safeParse(stringArray);
}

// Run benchmarks for each type of array validation
console.log('\n=== Array Validation Benchmarks ===\n');

runSuite(
  'array(string()).safeParse',
  { veffect: stringArrayValidation },
  20000
);
console.log('\n');

runSuite(
  'array(number()).safeParse',
  { veffect: numberArrayValidation },
  20000
);
console.log('\n');

runSuite(
  'array(object()).safeParse',
  { veffect: objectArrayValidation },
  20000
);
console.log('\n');

runSuite(
  'array() with length constraints',
  { veffect: arrayLengthValidation },
  20000
);
console.log('\n');

runSuite(
  'array().nonEmpty().safeParse',
  { veffect: nonEmptyArrayValidation },
  20000
);
console.log('\n');

runSuite(
  'array() with transformations',
  { veffect: arrayTransformValidation },
  20000
);
console.log('\n');

runSuite(
  'array() with refinements',
  { veffect: arrayRefinementValidation },
  20000
);
