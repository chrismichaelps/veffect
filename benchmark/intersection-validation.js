const { intersection, object, string, number, boolean } = require('../dist');
const { runSuite } = require('./benchUtil');

// Test data
const personData = {
  name: 'John Doe',
  age: 30,
};

const employeeData = {
  name: 'John Doe',
  age: 30,
  company: 'ACME Inc',
  role: 'Developer',
  salary: 75000,
};

const invalidData = {
  name: 'Jane Smith',
  company: 'Tech Co',
};

// Base schemas for intersection
const personSchema = object({
  name: string(),
  age: number().positive(),
});

const employeeSchema = object({
  company: string(),
  role: string(),
  salary: number().positive(),
});

// Simple intersection validation
function simpleIntersectionValidation() {
  const validator = intersection([personSchema, employeeSchema]).toValidator();

  return validator.safeParse(employeeData);
}

// Intersection with transformation
function transformIntersectionValidation() {
  const validator = intersection([personSchema, employeeSchema])
    .transform((data) => ({
      ...data,
      fullName: data.name,
      yearlySalary: data.salary,
      taxBracket: data.salary > 50000 ? 'High' : 'Standard',
    }))
    .toValidator();

  return validator.safeParse(employeeData);
}

// Multiple intersection
function multipleIntersectionValidation() {
  const addressSchema = object({
    street: string(),
    city: string(),
    zipCode: string(),
  });

  const contactSchema = object({
    email: string().email(),
    phone: string(),
  });

  const validator = intersection([
    personSchema,
    employeeSchema,
    addressSchema,
    contactSchema,
  ]).toValidator();

  return validator.safeParse({
    ...employeeData,
    street: '123 Main St',
    city: 'Anytown',
    zipCode: '12345',
    email: 'john@example.com',
    phone: '555-1234',
  });
}

// Intersection with refinement
function refinementIntersectionValidation() {
  const validator = intersection([personSchema, employeeSchema])
    .refine((data) => data.age >= 18, 'Employee must be at least 18 years old')
    .toValidator();

  return validator.safeParse(employeeData);
}

// Invalid intersection validation
function invalidIntersectionValidation() {
  const validator = intersection([personSchema, employeeSchema]).toValidator();

  try {
    return validator.safeParse(invalidData);
  } catch (error) {
    return { success: false, error };
  }
}

// Run benchmarks for intersection validation
console.log('\n=== Intersection Validation Benchmarks ===\n');

runSuite(
  'intersection() simple',
  { veffect: simpleIntersectionValidation },
  20000
);
console.log('\n');

runSuite(
  'intersection() with transform',
  { veffect: transformIntersectionValidation },
  20000
);
console.log('\n');

runSuite(
  'intersection() multiple schemas',
  { veffect: multipleIntersectionValidation },
  10000
);
console.log('\n');

runSuite(
  'intersection() with refinement',
  { veffect: refinementIntersectionValidation },
  20000
);
console.log('\n');

runSuite(
  'intersection() with invalid data',
  { veffect: invalidIntersectionValidation },
  20000
);
