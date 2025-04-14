const { map, string, number, boolean } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const stringToStringMap = new Map([
  ['key1', 'value1'],
  ['key2', 'value2'],
  ['key3', 'value3'],
]);

const stringToNumberMap = new Map([
  ['count1', 10],
  ['count2', 20],
  ['count3', 30],
]);

const numberToBooleanMap = new Map([
  [1, true],
  [2, false],
  [3, true],
]);

// Basic Map validation (string to string)
function basicMapValidation() {
  const validator = map(string(), string()).toValidator();
  return validator.safeParse(stringToStringMap);
}

// Map with number values validation
function mapWithNumbersValidation() {
  const validator = map(string(), number().positive()).toValidator();
  return validator.safeParse(stringToNumberMap);
}

// Map with number keys validation
function mapWithNumberKeysValidation() {
  const validator = map(number(), boolean()).toValidator();
  return validator.safeParse(numberToBooleanMap);
}

// Map with minimum size validation
function mapSizeValidation() {
  const validator = map(string(), string()).minSize(2).maxSize(5).toValidator();
  return validator.safeParse(stringToStringMap);
}

// Map with transformation
function mapTransformValidation() {
  const validator = map(string(), number())
    .transform((m) => {
      const result = new Map();
      for (const [key, value] of m.entries()) {
        result.set(key, value * 2);
      }
      return result;
    })
    .toValidator();

  return validator.safeParse(stringToNumberMap);
}

// Run benchmarks for each type of map validation
console.log('\n=== Map Validation Benchmarks ===\n');

runSuite(
  'map(string(), string()).safeParse',
  { veffect: basicMapValidation },
  20000
);
console.log('\n');

runSuite(
  'map(string(), number()).safeParse',
  { veffect: mapWithNumbersValidation },
  20000
);
console.log('\n');

runSuite(
  'map(number(), boolean()).safeParse',
  { veffect: mapWithNumberKeysValidation },
  20000
);
console.log('\n');

runSuite('map() with size constraints', { veffect: mapSizeValidation }, 20000);
console.log('\n');

runSuite(
  'map() with transformations',
  { veffect: mapTransformValidation },
  20000
);
