const { string, number, boolean, object } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const validString = 'test string';
const validNumber = 42;
const validObject = { name: 'John', age: 30 };
const undefinedValue = undefined;
const nullValue = null;
const incompleteObject = { name: 'Jane' };

// Default string validation
function defaultStringValidation() {
  const validator = string().default('default value').toValidator();
  return validator.safeParse(undefinedValue);
}

// Default number validation
function defaultNumberValidation() {
  const validator = number().default(0).toValidator();
  return validator.safeParse(undefinedValue);
}

// Default with function
function defaultFunctionValidation() {
  const validator = string()
    .default(() => new Date().toISOString())
    .toValidator();

  return validator.safeParse(undefinedValue);
}

// Optional string validation (defined)
function optionalStringDefinedValidation() {
  const validator = string().optional().toValidator();
  return validator.safeParse(validString);
}

// Optional string validation (undefined)
function optionalStringUndefinedValidation() {
  const validator = string().optional().toValidator();
  return validator.safeParse(undefinedValue);
}

// Nullable string validation (string)
function nullableStringValidation() {
  const validator = string().nullable().toValidator();
  return validator.safeParse(validString);
}

// Nullable string validation (null)
function nullableStringNullValidation() {
  const validator = string().nullable().toValidator();
  return validator.safeParse(nullValue);
}

// Nullish string validation (string)
function nullishStringValidation() {
  const validator = string().nullish().toValidator();
  return validator.safeParse(validString);
}

// Nullish string validation (undefined or null)
function nullishStringUndefinedValidation() {
  const validator = string().nullish().toValidator();
  return validator.safeParse(undefinedValue);
}

// Object with optional fields
function optionalFieldsValidation() {
  const validator = object({
    name: string(),
    age: number().optional(),
    active: boolean().optional(),
  }).toValidator();

  return validator.safeParse(incompleteObject);
}

// Object with default fields
function defaultFieldsValidation() {
  const validator = object({
    name: string(),
    age: number().default(25),
    active: boolean().default(true),
  }).toValidator();

  return validator.safeParse(incompleteObject);
}

// Object with nullable fields
function nullableFieldsValidation() {
  const validator = object({
    name: string(),
    age: number().nullable(),
    active: boolean().nullable(),
  }).toValidator();

  return validator.safeParse({ name: 'John', age: null, active: null });
}

// Run benchmarks for default/optional/nullable validation
console.log('\n=== Default/Optional/Nullable Validation Benchmarks ===\n');

runSuite(
  'string().default().safeParse',
  { veffect: defaultStringValidation },
  20000
);
console.log('\n');

runSuite(
  'number().default().safeParse',
  { veffect: defaultNumberValidation },
  20000
);
console.log('\n');

runSuite(
  'string().default(fn).safeParse',
  { veffect: defaultFunctionValidation },
  20000
);
console.log('\n');

runSuite(
  'string().optional() with string',
  { veffect: optionalStringDefinedValidation },
  20000
);
console.log('\n');

runSuite(
  'string().optional() with undefined',
  { veffect: optionalStringUndefinedValidation },
  20000
);
console.log('\n');

runSuite(
  'string().nullable() with string',
  { veffect: nullableStringValidation },
  20000
);
console.log('\n');

runSuite(
  'string().nullable() with null',
  { veffect: nullableStringNullValidation },
  20000
);
console.log('\n');

runSuite(
  'string().nullish() with string',
  { veffect: nullishStringValidation },
  20000
);
console.log('\n');

runSuite(
  'string().nullish() with undefined',
  { veffect: nullishStringUndefinedValidation },
  20000
);
console.log('\n');

runSuite(
  'object() with optional fields',
  { veffect: optionalFieldsValidation },
  20000
);
console.log('\n');

runSuite(
  'object() with default fields',
  { veffect: defaultFieldsValidation },
  20000
);
console.log('\n');

runSuite(
  'object() with nullable fields',
  { veffect: nullableFieldsValidation },
  20000
);
