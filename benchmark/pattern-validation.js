const {
  pattern,
  string,
  number,
  object,
  literal,
  invalid,
} = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const stringValue = 'test string';
const numberValue = 42;
const userObject = { type: 'user', name: 'John', age: 30 };
const productObject = { type: 'product', name: 'Laptop', price: 999 };
const invalidObject = { type: 'unknown', value: 'test' };

// Basic pattern matching
function basicPatternValidation() {
  const validator = pattern((input) => {
    if (typeof input === 'string') {
      return string().minLength(2);
    }
    if (typeof input === 'number') {
      return number().positive();
    }
    return invalid('Expected string or number');
  }).toValidator();

  return validator.safeParse(stringValue);
}

// Pattern matching with number
function numberPatternValidation() {
  const validator = pattern((input) => {
    if (typeof input === 'string') {
      return string().minLength(2);
    }
    if (typeof input === 'number') {
      return number().positive();
    }
    return invalid('Expected string or number');
  }).toValidator();

  return validator.safeParse(numberValue);
}

// Pattern matching with discriminated objects
function discriminatedPatternValidation() {
  const validator = pattern((input) => {
    if (typeof input === 'object' && input !== null && 'type' in input) {
      if (input.type === 'user') {
        return object({
          type: literal('user'),
          name: string(),
          age: number().positive(),
        });
      } else if (input.type === 'product') {
        return object({
          type: literal('product'),
          name: string(),
          price: number().positive(),
        });
      }
    }
    return invalid('Invalid object type');
  }).toValidator();

  return validator.safeParse(userObject);
}

// Pattern matching with product object
function productPatternValidation() {
  const validator = pattern((input) => {
    if (typeof input === 'object' && input !== null && 'type' in input) {
      if (input.type === 'user') {
        return object({
          type: literal('user'),
          name: string(),
          age: number().positive(),
        });
      } else if (input.type === 'product') {
        return object({
          type: literal('product'),
          name: string(),
          price: number().positive(),
        });
      }
    }
    return invalid('Invalid object type');
  }).toValidator();

  return validator.safeParse(productObject);
}

// Pattern matching with invalid object
function invalidPatternValidation() {
  const validator = pattern((input) => {
    if (typeof input === 'object' && input !== null && 'type' in input) {
      if (input.type === 'user') {
        return object({
          type: literal('user'),
          name: string(),
          age: number().positive(),
        });
      } else if (input.type === 'product') {
        return object({
          type: literal('product'),
          name: string(),
          price: number().positive(),
        });
      }
    }
    return invalid('Invalid object type');
  }).toValidator();

  try {
    return validator.safeParse(invalidObject);
  } catch (error) {
    return { success: false, error };
  }
}

// Run benchmarks for pattern matching
console.log('\n=== Pattern Validation Benchmarks ===\n');

runSuite('pattern() with string', { veffect: basicPatternValidation }, 20000);
console.log('\n');

runSuite('pattern() with number', { veffect: numberPatternValidation }, 20000);
console.log('\n');

runSuite(
  'pattern() with user object',
  { veffect: discriminatedPatternValidation },
  10000
);
console.log('\n');

runSuite(
  'pattern() with product object',
  { veffect: productPatternValidation },
  10000
);
console.log('\n');

runSuite(
  'pattern() with invalid object',
  { veffect: invalidPatternValidation },
  10000
);
