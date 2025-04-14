const { record, string, number, boolean, union } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const stringRecord = {
  key1: 'value1',
  key2: 'value2',
  key3: 'value3',
  custom: 'special value',
};

const numberRecord = {
  count1: 10,
  count2: 20,
  count3: 30,
  total: 60,
};

const objectRecord = {
  user1: { id: 1, active: true },
  user2: { id: 2, active: false },
  user3: { id: 3, active: true },
};

// Basic record validation (string to string)
function stringRecordValidation() {
  const validator = record(string(), string()).toValidator();
  return validator.safeParse(stringRecord);
}

// Record with number values validation
function numberRecordValidation() {
  const validator = record(string(), number().positive()).toValidator();
  return validator.safeParse(numberRecord);
}

// Record with object values validation
function objectRecordValidation() {
  const validator = record(
    string(),
    record(string(), union([number(), boolean()]))
  ).toValidator();

  return validator.safeParse(objectRecord);
}

// Record with key validation using regex
function regexKeyRecordValidation() {
  const validator = record(string().regex(/^key\d+$/), string()).toValidator();

  // This will exclude the 'custom' key since it doesn't match the regex
  return validator.safeParse(stringRecord);
}

// Record with transformation
function recordTransformValidation() {
  const validator = record(string(), number())
    .transform((obj) => {
      const result = { ...obj };
      for (const key in result) {
        result[key] = result[key] * 2;
      }
      return result;
    })
    .toValidator();

  return validator.safeParse(numberRecord);
}

// Run benchmarks for each type of record validation
console.log('\n=== Record Validation Benchmarks ===\n');

runSuite(
  'record(string(), string()).safeParse',
  { veffect: stringRecordValidation },
  20000
);
console.log('\n');

runSuite(
  'record(string(), number()).safeParse',
  { veffect: numberRecordValidation },
  20000
);
console.log('\n');

runSuite(
  'record() with nested objects',
  { veffect: objectRecordValidation },
  20000
);
console.log('\n');

runSuite(
  'record() with key regex validation',
  { veffect: regexKeyRecordValidation },
  20000
);
console.log('\n');

runSuite(
  'record() with transformations',
  { veffect: recordTransformValidation },
  20000
);
