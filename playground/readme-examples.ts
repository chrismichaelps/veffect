/**
 * This file contains examples that match the code shown in the README.md documentation.
 * It serves as a verification that the examples in the documentation are correct and working.
 */

import {
  string,
  number,
  boolean,
  object,
  array,
  tuple,
  record,
  literal,
  union,
  discriminatedUnion,
  any
} from '../dist';

console.log('📝 VEffect Validation Examples from README.md');
console.log('==============================================\n');

// =====================================================
// Basic Usage Example
// =====================================================
console.log('🚀 Basic Usage Example');
console.log('-----------------------');

const userSchema = object({
  id: number().integer(),
  name: string().minLength(2),
  email: string().email(),
  isActive: boolean()
});

// Create a validator from the schema
const validator = userSchema.toValidator();

// Validate data (safe method - returns result object)
const result = validator.safeParse({
  id: 123,
  name: "Jane Doe",
  email: "jane@example.com",
  isActive: true
});

console.log('Valid user result:', result);

// Invalid example
const invalidResult = validator.safeParse({
  id: "not-a-number",
  name: "J", // too short
  email: "not-an-email",
  isActive: "not-a-boolean"
});

console.log('Invalid user result:', invalidResult);
console.log('\n');

// =====================================================
// Primitive Types Examples
// =====================================================
console.log('📝 Primitive Types Examples');
console.log('--------------------------');

// String Schema
console.log('\n🔤 String Schema Example');
const usernameSchema = string()
  .minLength(3, "Username must be at least 3 characters")
  .maxLength(20, "Username must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscore");

const usernameValidator = usernameSchema.toValidator();
console.log('Valid username:', usernameValidator.safeParse("user_123"));
console.log('Invalid username (too short):', usernameValidator.safeParse("ab"));
console.log('Invalid username (invalid chars):', usernameValidator.safeParse("user@123"));

// Number Schema
console.log('\n🔢 Number Schema Example');
const percentSchema = number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100");

const percentValidator = percentSchema.toValidator();
console.log('Valid percentage:', percentValidator.safeParse(75));
console.log('Invalid percentage (negative):', percentValidator.safeParse(-10));
console.log('Invalid percentage (too high):', percentValidator.safeParse(150));

// Boolean Schema
console.log('\n🔘 Boolean Schema Example');
const agreeToTermsSchema = boolean()
  .refine(value => value === true, "You must agree to the terms");

const agreeValidator = agreeToTermsSchema.toValidator();
console.log('Valid agreement:', agreeValidator.safeParse(true));
console.log('Invalid agreement:', agreeValidator.safeParse(false));

// =====================================================
// Complex Types Examples
// =====================================================
console.log('\n🏗️ Complex Types Examples');
console.log('-------------------------');

// Object Schema
console.log('\n📋 Object Schema Example');
const addressSchema = object({
  street: string(),
  city: string(),
  zipCode: string().regex(/^\d{5}$/, "Invalid zip code format"),
  country: string()
});

const addressValidator = addressSchema.toValidator();
console.log('Valid address:', addressValidator.safeParse({
  street: "123 Main St",
  city: "Anytown",
  zipCode: "12345",
  country: "USA"
}));

console.log('Invalid address (bad zipcode):', addressValidator.safeParse({
  street: "123 Main St",
  city: "Anytown",
  zipCode: "ABC12",
  country: "USA"
}));

// Array Schema
console.log('\n📚 Array Schema Example');
const tagsSchema = array(string())
  .minLength(1, "At least one tag is required")
  .maxLength(5, "Cannot have more than 5 tags");

const tagsValidator = tagsSchema.toValidator();
console.log('Valid tags:', tagsValidator.safeParse(["typescript", "validation"]));
console.log('Invalid tags (empty):', tagsValidator.safeParse([]));
console.log('Invalid tags (too many):', tagsValidator.safeParse([
  "tag1", "tag2", "tag3", "tag4", "tag5", "tag6"
]));

// Tuple Schema
console.log('\n🧩 Tuple Schema Example');
const pointSchema = tuple(number(), number());  // [x, y]

const pointValidator = pointSchema.toValidator();
console.log('Valid point:', pointValidator.safeParse([10, 20]));
console.log('Invalid point (wrong types):', pointValidator.safeParse(["10", 20]));
console.log('Invalid point (too many items):', pointValidator.safeParse([10, 20, 30]));

// Record Schema
console.log('\n📝 Record Schema Example');
const scoreMapSchema = record(string(), number());

const scoreValidator = scoreMapSchema.toValidator();
console.log('Valid scores:', scoreValidator.safeParse({
  'john': 85,
  'mary': 92,
  'bob': 78
}));
console.log('Invalid scores:', scoreValidator.safeParse({
  'john': 85,
  'mary': "A+"  // Not a number
}));

// =====================================================
// Special Types Examples
// =====================================================
console.log('\n🌟 Special Types Examples');
console.log('------------------------');

// Literal Schema
console.log('\n🎯 Literal Schema Example');
const adminRoleSchema = literal('admin');

const adminValidator = adminRoleSchema.toValidator();
console.log('Valid admin role:', adminValidator.safeParse('admin'));
console.log('Invalid admin role:', adminValidator.safeParse('user'));

// Discriminated Union Schema
console.log('\n🔀 Discriminated Union Schema Example');
const circleSchema = object({
  type: literal('circle'),
  radius: number().positive()
});

const rectangleSchema = object({
  type: literal('rectangle'),
  width: number().positive(),
  height: number().positive()
});

const shapeSchema = discriminatedUnion('type', [
  circleSchema,
  rectangleSchema
]);

const shapeValidator = shapeSchema.toValidator();
console.log('Valid circle:', shapeValidator.safeParse({
  type: 'circle',
  radius: 5
}));
console.log('Valid rectangle:', shapeValidator.safeParse({
  type: 'rectangle',
  width: 10,
  height: 20
}));
console.log('Invalid shape (unknown type):', shapeValidator.safeParse({
  type: 'triangle',
  base: 10,
  height: 15
}));

// =====================================================
// Composition Types Examples
// =====================================================
console.log('\n🧩 Composition Types Examples');
console.log('----------------------------');

// Union Schema
console.log('\n🔀 Union Schema Example');
const idSchema = union([
  string().regex(/^\d{9}$/, "Must be a 9-digit string"),
  number().integer().positive()
]);

const idValidator = idSchema.toValidator();
console.log('Valid ID (string):', idValidator.safeParse("123456789"));
console.log('Valid ID (number):', idValidator.safeParse(42));

// Note: The handling of invalid inputs for union schemas can be implementation-specific
const invalidIdResult = idValidator.safeParse("abc123");
console.log('Invalid ID result:', invalidIdResult);
console.log('(Note: Union behavior with invalid inputs may vary)');

// =====================================================
// Advanced Features Examples
// =====================================================
console.log('\n🧰 Advanced Features Examples');
console.log('---------------------------');

// Custom Validation with Refine
console.log('\n🛠️ Custom Validation Example');
const passwordSchema = string()
  .minLength(8)
  .refine(
    password => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    password => /[0-9]/.test(password),
    "Password must contain at least one number"
  );

const passwordValidator = passwordSchema.toValidator();
console.log('Valid password:', passwordValidator.safeParse("Password123"));
console.log('Invalid password (no uppercase):', passwordValidator.safeParse("password123"));
console.log('Invalid password (no number):', passwordValidator.safeParse("Password"));

// Transformations
console.log('\n🔄 Transformations Example');
const lowercaseEmailSchema = string()
  .email()
  .transform(email => email.toLowerCase());

const emailTransformValidator = lowercaseEmailSchema.toValidator();
const emailResult = emailTransformValidator.safeParse('User@Example.com');
console.log('Transformed email:', emailResult);

// Optional, Nullable, Default
console.log('\n⚙️ Optional and Default Examples');
// Using method chaining for optional and default
const userSettingsSchema = object({
  theme: string().default("light"),
  fontSize: number().default(14),
  notifications: boolean().default(true),
  email: string().email().optional()
});

const settingsValidator = userSettingsSchema.toValidator();
const settingsResult = settingsValidator.safeParse({
  theme: "dark",
  // Other fields get default values
  email: undefined  // optional
});

console.log('Settings with defaults:', settingsResult);
console.log('Expected result:');
console.log({
  theme: "dark",
  fontSize: 14,
  notifications: true,
  email: undefined
});

console.log('\nExample validation completed!'); 