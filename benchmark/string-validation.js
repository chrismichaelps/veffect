const { string } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const testString = 'Hello, world!';
const emailString = 'test@example.com';
const urlString = 'https://example.com';
const dateString = '2025-05-15';
const uuidString = '550e8400-e29b-41d4-a716-446655440000';

// Basic string validation
function basicStringValidation() {
  const validator = string().toValidator();
  return validator.safeParse(testString);
}

// Email validation
function emailValidation() {
  const validator = string().email().toValidator();
  return validator.safeParse(emailString);
}

// Regex validation
function regexValidation() {
  const validator = string()
    .regex(/^Hello, .+!$/)
    .toValidator();
  return validator.safeParse(testString);
}

// URL validation
function urlValidation() {
  const validator = string().url().toValidator();
  return validator.safeParse(urlString);
}

// Date validation
function dateValidation() {
  const validator = string().date().toValidator();
  return validator.safeParse(dateString);
}

// UUID validation
function uuidValidation() {
  const validator = string().uuid().toValidator();
  return validator.safeParse(uuidString);
}

// String with transformations
function stringTransformValidation() {
  const validator = string().toLowerCase().trim().toValidator();
  return validator.safeParse(' Test String ');
}

// Run benchmarks for each type of string validation
console.log('\n=== String Validation Benchmarks ===\n');

runSuite('string().safeParse', { veffect: basicStringValidation }, 50000);
console.log('\n');

runSuite('string().email().safeParse', { veffect: emailValidation }, 20000);
console.log('\n');

runSuite('string().regex().safeParse', { veffect: regexValidation }, 20000);
console.log('\n');

runSuite('string().url().safeParse', { veffect: urlValidation }, 20000);
console.log('\n');

runSuite('string().date().safeParse', { veffect: dateValidation }, 20000);
console.log('\n');

runSuite('string().uuid().safeParse', { veffect: uuidValidation }, 20000);
console.log('\n');

runSuite(
  'string() with transforms',
  { veffect: stringTransformValidation },
  20000
);
