const { tuple, string, number, boolean, array, any } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const simpleTuple = ['John Doe', 30];
const complexTuple = ['user123', 'John Doe', 30, true, ['admin', 'editor']];
const coordinatesTuple = [40.7128, -74.006];
const personTuple = ['John', 'Doe', 35, true];

// Basic tuple validation
function simpleTupleValidation() {
  const validator = tuple([string(), number()]).toValidator();
  return validator.safeParse(simpleTuple);
}

// Complex tuple validation with different types
function complexTupleValidation() {
  const validator = tuple([
    string(), // id
    string(), // name
    number().min(18), // age
    boolean(), // active status
    array(string()), // roles
  ]).toValidator();

  return validator.safeParse(complexTuple);
}

// Coordinates tuple validation
function coordinatesTupleValidation() {
  const validator = tuple([
    number().min(-90).max(90), // latitude
    number().min(-180).max(180), // longitude
  ]).toValidator();

  return validator.safeParse(coordinatesTuple);
}

// Tuple with optional elements
function restTupleValidation() {
  const validator = tuple([string(), string(), any()]).toValidator();
  return validator.safeParse(personTuple);
}

// Tuple with transformation
function tupleTranformValidation() {
  const validator = tuple([string(), string(), number()])
    .transform(([first, last, age]) => ({
      fullName: `${first} ${last}`,
      age,
      isAdult: age >= 18,
    }))
    .toValidator();

  return validator.safeParse(personTuple.slice(0, 3));
}

// Run benchmarks for each type of tuple validation
console.log('\n=== Tuple Validation Benchmarks ===\n');

runSuite(
  'tuple([string(), number()]).safeParse',
  { veffect: simpleTupleValidation },
  20000
);
console.log('\n');

runSuite(
  'complex tuple validation',
  { veffect: complexTupleValidation },
  20000
);
console.log('\n');

runSuite(
  'coordinates tuple validation',
  { veffect: coordinatesTupleValidation },
  20000
);
console.log('\n');

runSuite('tuple with rest elements', { veffect: restTupleValidation }, 20000);
console.log('\n');

runSuite(
  'tuple with transformation',
  { veffect: tupleTranformValidation },
  20000
);
