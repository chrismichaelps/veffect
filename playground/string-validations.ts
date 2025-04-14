/**
 * Examples of the enhanced string validation functions
 */
import { string } from '../dist';

// Function to test and display validation results
function testValidation(name: string, schema: any, validValues: any[], invalidValues: any[]) {
  console.log(`\n----- Testing ${name} validation -----`);

  // Create validator from schema
  const validator = schema.toValidator();

  console.log("Valid values:");
  for (const value of validValues) {
    const result = validator.safeParse(value);
    console.log(`  ${value}: ${result.success ? 'PASS' : 'FAIL - ' + result.error.message}`);
  }

  console.log("Invalid values:");
  for (const value of invalidValues) {
    const result = validator.safeParse(value);
    console.log(`  ${value}: ${result.success ? 'FAIL - Should be invalid' : 'PASS - ' + result.error.message}`);
  }
}

// Test datetime validation with local option
testValidation(
  'Datetime (local)',
  string().datetime({ local: true }),
  ['2025-01-01T12:00:00', '2025-01-01T12:00:00.123'],
  ['2025-01-01', '2025-01-01 12:00:00', '2025-01-01T12:00:00Z']
);

// Test datetime validation with offset
testValidation(
  'Datetime (with offset)',
  string().datetime({ offset: true }),
  ['2025-01-01T12:00:00Z', '2025-01-01T12:00:00+02:00', '2025-01-01T12:00:00.123-05:00'],
  ['2025-01-01T12:00:00', '2025/01/01T12:00:00Z']
);

// Test datetime validation with precision
testValidation(
  'Datetime (with precision)',
  string().datetime({ precision: 3 }),
  ['2025-01-01T12:00:00.123Z'],
  ['2025-01-01T12:00:00Z', '2025-01-01T12:00:00.12Z', '2025-01-01T12:00:00.1234Z']
);

// Test emoji validation
testValidation(
  'Emoji',
  string().emoji(),
  ['😀', '🚀', '👨‍👩‍👧‍👦'],
  ['abc', 'test 😀', '123']
);

// Test nanoid validation
testValidation(
  'Nanoid',
  string().nanoid(),
  ['abcdef123', 'ABC123xyz', 'a1b2c3-_'],
  ['abc$def', 'test/123']
);

// Test CIDR validation
testValidation(
  'CIDR',
  string().cidr(),
  ['192.168.0.0/24', '10.0.0.0/8', '2001:db8::/32'],
  ['192.168.0.0', '192.168.0.0/33', 'invalid']
);

// Test IPv4 CIDR validation
testValidation(
  'CIDR (IPv4)',
  string().cidr({ version: 'v4' }),
  ['192.168.0.0/24', '10.0.0.0/8'],
  ['2001:db8::/32', '192.168.0.0', '192.168.0.0/33']
);

// Test base64 validation
testValidation(
  'Base64',
  string().base64(),
  ['aGVsbG8=', 'YWJjMTIz', 'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY='],
  ['abc==', 'abc=def', 'Hello, world!']
);

// Test date format validation
testValidation(
  'Date',
  string().date(),
  ['2025-01-01', '2025-12-31', '2024-02-29'],
  ['2025-13-01', '2025/01/01', '2025-01-32', '20250101']
);

// Test time format validation
testValidation(
  'Time',
  string().time(),
  ['00:00:00', '12:30:45', '23:59:59', '12:34:56.789'],
  ['24:00:00', '12:60:00', '12:00:60', '12:00']
);

// Test time with precision validation
testValidation(
  'Time (with precision)',
  string().time({ precision: 3 }),
  ['12:34:56.789'],
  ['12:34:56', '12:34:56.78', '12:34:56.7890']
);

// Test duration validation
testValidation(
  'Duration',
  string().duration(),
  ['P1Y', 'P1M', 'P1D', 'PT1H', 'PT1M', 'PT1S', 'P1Y2M3DT4H5M6S'],
  ['1Y', 'PT', 'P', 'P1S1Y', 'Invalid']
);

// Combined validation example
const emailSchema = string()
  .email()
  .nonempty()
  .toLowerCase();

testValidation(
  'Combined Email validation + transformation',
  emailSchema,
  ['user@example.com', 'USER@EXAMPLE.COM'],
  ['', '@example.com', 'user@', 'user@.com']
);

console.log("\nAll tests completed!");
