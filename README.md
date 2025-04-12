# VEffect

<div align="center">
  <img src="https://img.shields.io/npm/v/veffect" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/veffect" alt="npm downloads" />
  <img src="https://img.shields.io/github/license/chrismperez/veffect" alt="license" />
  <img src="https://img.shields.io/github/stars/chrismperez/veffect" alt="stars" />
</div>

## 🌟 Overview

**VEffect Validation** is a powerful TypeScript validation library built on the robust foundation of [Effect](https://effect.website), combining exceptional type safety, high performance, and developer experience. Taking inspiration from Effect's functional principles, VEffect delivers a balanced approach that excels at all three.

- **🔒 Best-in-class Type Safety**: Achieve end-to-end type inference from schema to validated data without TypeScript gymnastics.
- **🚀 Superior Performance**: Built on functional principles with optimized validation paths that leverage Effect's optimized architecture.
- **💎 Outstanding DX**: Intuitive, chainable API that's easy to learn yet powerful enough for complex validation scenarios.
- **⚙️ Effect-Powered**: Harnesses the power of Effect's functional approach for reliable, predictable validations.
- **🔧 Extensible**: Create custom validators, transformations, and error messages with ease.

**Completely free and open source** under the MIT license, VEffect Validation provides enterprise-grade validation for projects of any size without compromising on quality or performance.

## 📋 Contents

- [Features](#features)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [Basic Usage](#basic-usage)
- [Schema Types](#schema-types)
  - [Primitive Types](#primitive-types)
  - [Complex Types](#complex-types)
  - [Special Types](#special-types)
  - [Composition Types](#composition-types)
  - [Extended Types](#extended-types)
- [Schema Methods](#schema-methods)
- [Advanced Features](#advanced-features)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## ✨ Features

- **🔍 Type-Safe** - Full TypeScript integration with inferred types
- **⚡ High Performance** - Built on a functional core for speed and reliability
- **🛡️ Comprehensive Validation** - Rich set of validators for common use cases
- **🧩 Composable** - Build complex schemas from simple building blocks
- **🔄 Functional** - Clean API that encourages immutable operations
- **💬 Detailed Errors** - Helpful error messages with path tracking
- **🔀 Pattern Matching** - Dynamic schema selection based on input values
- **⚖️ Discriminated Unions** - First-class support for TypeScript's discriminated unions

```typescript
// Example of key features in action
import { object, string, number, union, literal } from "veffect";

// Type-safe schema with TypeScript integration
const userSchema = object({
  id: number().positive(),
  name: string().minLength(2),
  // Discriminated union for role-based permissions
  role: union([
    object({ type: literal("admin"), permissions: array(string()) }),
    object({ type: literal("user") }),
  ]),
});

// Validator with detailed error tracking
const validator = userSchema.toValidator();
const result = validator.safeParse(userData);

// Type inference works automatically
if (result.success) {
  const user = result.data;
  // TypeScript knows user.role.type is either "admin" or "user"
  if (user.role.type === "admin") {
    // TypeScript knows permissions exists only on admin
    console.log(user.role.permissions);
  }
}
```

## 📦 Installation

```bash
# npm
npm install veffect

# yarn
yarn add veffect

# pnpm
pnpm add veffect
```

## 🧠 Core Concepts

VEffect is built around the concept of **schemas** that define the shape and constraints of your data. Every schema:

- **Defines a type** - TypeScript infers the correct type from your schema
- **Can be composed** - Build complex schemas by combining simpler ones
- **Produces a validator** - Convert schemas to validators that validate data
- **Returns structured results** - Clear success/failure information

```typescript
// Example illustrating core concepts
import { string, number, object, array } from "veffect";

// 1. Define a schema that represents your data structure
const productSchema = object({
  id: string().uuid(),
  name: string().minLength(3),
  price: number().min(0),
  tags: array(string()),
});

// 2. Schema automatically defines a TypeScript type
type Product = {
  id: string;
  name: string;
  price: number;
  tags: string[];
};
// This type is inferred automatically from the schema

// 3. Create a validator from the schema
const productValidator = productSchema.toValidator();

// 4. Validate data with structured results
const result = productValidator.safeParse({
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Laptop",
  price: 999.99,
  tags: ["electronics", "computers"],
});

// Check result structure
if (result.success) {
  // Access validated data with proper type
  const product = result.data;
  console.log(`Valid product: ${product.name}`);
} else {
  // Access detailed error information
  console.error(`Validation failed: ${result.error.message}`);
}
```

## 🚀 Basic Usage

```typescript
import { object, string, number, boolean } from "veffect";

// Define a schema
const userSchema = object({
  id: number().integer(),
  name: string().minLength(2),
  email: string().email(),
  isActive: boolean(),
});

// TypeScript automatically infers this type
type User = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
};

// Create a validator from the schema
const validator = userSchema.toValidator();

// Validate data (safe method - returns result object)
const result = validator.safeParse({
  id: 123,
  name: "Jane Doe",
  email: "jane@example.com",
  isActive: true,
});

if (result.success) {
  // TypeScript knows result.data is a valid User
  console.log("Valid user:", result.data);
} else {
  // Structured error information
  console.error("Invalid user:", result.error);
}

// Alternatively, use parse (throws on error)
try {
  const user = validator.parse(input);
  // Use validated data safely
} catch (error) {
  // Handle validation error
}

// Or use async validation
await validator.validateAsync(input);
```

## 📝 Schema Types

### Primitive Types

#### String Schema

```typescript
import { string } from "veffect";

// Basic string validation
const nameSchema = string();

// String with constraints
const usernameSchema = string()
  .minLength(3, "Username must be at least 3 characters")
  .maxLength(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers and underscore"
  );

// String with common format validation
const emailSchema = string().email("Please provide a valid email address");
const urlSchema = string().url("Please provide a valid URL");
const uuidSchema = string().uuid("Please provide a valid UUID");
const isoDateSchema = string().isoDate("Please provide a valid ISO date");

// String with transformations
const normalizedSchema = string()
  .trim() // Remove whitespace
  .toLowerCase(); // Convert to lowercase

// Example usage
const validator = usernameSchema.toValidator();
const result = validator.safeParse("user_123"); // Valid
```

#### Number Schema

```typescript
import { number } from "veffect";

// Basic number validation
const ageSchema = number();

// Number with range constraints
const percentSchema = number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100");

// Integer validation
const countSchema = number().integer("Count must be a whole number");

// Positive/negative numbers
const positiveSchema = number().positive("Value must be positive");
const negativeSchema = number().negative("Value must be negative");

// Numerical constraints
const evenSchema = number().refine((n) => n % 2 === 0, "Number must be even");
const multipleOfSchema = number().multipleOf(
  5,
  "Number must be a multiple of 5"
);

// Example usage
const priceValidator = number().min(0).toValidator();
const result = priceValidator.safeParse(29.99); // Valid
```

#### Boolean Schema

```typescript
import { boolean } from "veffect";

// Boolean validation
const isActiveSchema = boolean();

// With custom refinement
const agreeToTermsSchema = boolean().refine(
  (value) => value === true,
  "You must agree to the terms"
);

// Example usage
const consentValidator = agreeToTermsSchema.toValidator();
const result = consentValidator.safeParse(true); // Valid
```

#### Date Schema

```typescript
import { date } from "veffect";

// Date validation
const dateSchema = date();

// Date with constraints
const pastDateSchema = date().past("Date must be in the past");

const futureDateSchema = date().future("Date must be in the future");

const dateRangeSchema = date()
  .min(new Date("2023-01-01"), "Date must be after Jan 1, 2023")
  .max(new Date("2023-12-31"), "Date must be before Dec 31, 2023");

// Example usage
const birthdayValidator = date().past().toValidator();
const result = birthdayValidator.safeParse(new Date("1990-01-01")); // Valid
```

#### Enum Schema

```typescript
import { enum_ } from "veffect";

// Enum validation
enum Status {
  PENDING = "pending",
  ACTIVE = "active",
  INACTIVE = "inactive",
}

const statusSchema = enum_(Status);

// Or using string literals
const colorSchema = enum_(["red", "green", "blue"]);

// Example usage
const validator = statusSchema.toValidator();
const result = validator.safeParse("active"); // Valid
```

### Complex Types

#### Object Schema

```typescript
import { object, string, number, boolean } from "veffect";

// Define an object schema
const addressSchema = object({
  street: string(),
  city: string(),
  zipCode: string().regex(/^\d{5}$/, "Invalid zip code format"),
  country: string(),
});

const userSchema = object({
  name: string(),
  age: number().min(18),
  address: addressSchema, // Nested object
  isSubscribed: boolean(),
});

// Object with refinement (cross-field validation)
const rangeSchema = object({
  min: number(),
  max: number(),
}).refine(
  (obj) => obj.min < obj.max,
  (obj) => `Minimum value (${obj.min}) must be less than maximum (${obj.max})`
);

// Example usage
const validator = userSchema.toValidator();
const result = validator.safeParse({
  name: "John Doe",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Anytown",
    zipCode: "12345",
    country: "USA",
  },
  isSubscribed: true,
}); // Valid
```

#### Array Schema

```typescript
import { array, string, number } from "veffect";

// Array of strings
const tagsSchema = array(string())
  .minLength(1, "At least one tag is required")
  .maxLength(10, "Cannot have more than 10 tags");

// Array of objects
const usersSchema = array(
  object({
    id: number(),
    name: string(),
  })
);

// Example usage
const validator = tagsSchema.toValidator();
const result = validator.safeParse(["typescript", "validation"]); // Valid
```

#### Tuple Schema

```typescript
import { tuple, string, number, boolean } from "veffect";

// Fixed-length array with specific types for each position
const pointSchema = tuple(number(), number()); // [x, y]

// Complex tuple
const userActionSchema = tuple(
  string(), // action name
  number(), // timestamp
  object({
    // metadata
    userId: number(),
    details: string(),
  })
);

// Example usage
const validator = pointSchema.toValidator();
const result = validator.safeParse([10, 20]); // Valid: [x, y]
```

#### Record Schema

```typescript
import { record, string, number } from "veffect";

// Object with string keys and number values
const scoreMapSchema = record(string(), number());

// Object with enum keys and object values
const userMapSchema = record(
  enum_(["admin", "user", "guest"]),
  object({
    permissions: array(string()),
    active: boolean(),
  })
);

// Example usage
const validator = scoreMapSchema.toValidator();
const result = validator.safeParse({
  john: 85,
  mary: 92,
  bob: 78,
}); // Valid
```

#### Map Schema

```typescript
import { map, string, number } from "veffect";

// JavaScript Map with string keys and number values
const userScoresSchema = map(string(), number());

// Example usage
const validator = userScoresSchema.toValidator();
const result = validator.safeParse(
  new Map([
    ["john", 85],
    ["mary", 92],
  ])
); // Valid
```

#### Set Schema

```typescript
import { set, string } from "veffect";

// JavaScript Set of strings
const tagsSchema = set(string())
  .minSize(1, "At least one tag is required")
  .maxSize(10, "Cannot have more than 10 tags");

// Example usage
const validator = tagsSchema.toValidator();
const result = validator.safeParse(new Set(["typescript", "validation"])); // Valid
```

### Special Types

#### Literal Schema

```typescript
import { literal, union } from "veffect";

// Exact value validation
const adminRoleSchema = literal("admin");

// Multiple literals (equivalent to union)
const statusSchema = union([
  literal("pending"),
  literal("active"),
  literal("completed"),
]);

// Example usage
const validator = adminRoleSchema.toValidator();
const result = validator.safeParse("admin"); // Valid
const result2 = validator.safeParse("user"); // Invalid
```

#### Discriminated Union Schema

```typescript
import { discriminatedUnion, object, string, number, literal } from "veffect";

// Define shapes for different types with a common discriminator
const circleSchema = object({
  type: literal("circle"),
  radius: number().positive(),
});

const rectangleSchema = object({
  type: literal("rectangle"),
  width: number().positive(),
  height: number().positive(),
});

const triangleSchema = object({
  type: literal("triangle"),
  base: number().positive(),
  height: number().positive(),
});

// Create a discriminated union schema
const shapeSchema = discriminatedUnion("type", [
  circleSchema,
  rectangleSchema,
  triangleSchema,
]);

// Example usage
const validator = shapeSchema.toValidator();

// Valid circle
const circleResult = validator.safeParse({
  type: "circle",
  radius: 5,
});

// Valid rectangle
const rectangleResult = validator.safeParse({
  type: "rectangle",
  width: 10,
  height: 20,
});

// Valid triangle
const triangleResult = validator.safeParse({
  type: "triangle",
  base: 10,
  height: 15,
});

// Invalid - unknown type
const invalidResult = validator.safeParse({
  type: "unknown",
  base: 10,
  height: 15,
});
```

#### Pattern Schema

```typescript
import { pattern, object, string, literal, any, invalid } from "veffect";

// Dynamically choose schema based on runtime value
const responseSchema = pattern((input) => {
  if (typeof input !== "object" || input === null) {
    return invalid("Expected an object");
  }

  // Dynamic schema selection based on status field
  const status = input.status;

  if (status === "success") {
    return object({
      status: literal("success"),
      data: any(),
    });
  }

  if (status === "error") {
    return object({
      status: literal("error"),
      message: string(),
      code: string(),
    });
  }

  return invalid(`Unknown status: ${status}`);
});

// Example usage
const validator = responseSchema.toValidator();

// Valid success response
const successResult = validator.safeParse({
  status: "success",
  data: { id: 123, name: "Product" },
});

// Valid error response
const errorResult = validator.safeParse({
  status: "error",
  message: "Not found",
  code: "ERR_NOT_FOUND",
});
```

#### Any Schema

```typescript
import { any } from "veffect";

// Accepts any value
const dataSchema = any();

// Any with refinement
const nonNullSchema = any().refine(
  (val) => val !== null && val !== undefined,
  "Value cannot be null or undefined"
);

// Example usage
const validator = dataSchema.toValidator();
const result = validator.safeParse("anything"); // Valid
const result2 = validator.safeParse(123); // Valid
const result3 = validator.safeParse({ foo: "bar" }); // Valid
```

#### Custom Schema

```typescript
import { custom } from "veffect";

// Create a fully custom schema with your own validation logic
const evenNumberSchema = custom((value) => {
  if (typeof value !== "number") {
    return { valid: false, message: "Value must be a number" };
  }

  if (value % 2 !== 0) {
    return { valid: false, message: "Value must be an even number" };
  }

  return { valid: true, value };
});

// Example usage
const validator = evenNumberSchema.toValidator();
const result = validator.safeParse(42); // Valid
const result2 = validator.safeParse(43); // Invalid
```

### Composition Types

#### Union Schema

```typescript
import { union, string, number, boolean } from "veffect";

// Create a union of different schemas
const idSchema = union([
  string().regex(/^\d{9}$/, "Must be a 9-digit string"),
  number().int().positive(),
]);

// Example usage
const validator = idSchema.toValidator();
const result = validator.safeParse("123456789"); // Valid
const result2 = validator.safeParse(42); // Valid

// Note: The behavior of union schemas with invalid inputs can vary
// and may not always return a simple error as you might expect
const invalidResult = validator.safeParse("abc123");
// Check the result structure to understand what happened
```

#### Intersection Schema

```typescript
import { intersection, object, string, number } from "veffect";

// Base object schema
const personSchema = object({
  name: string(),
  age: number(),
});

// Additional properties
const employeePropsSchema = object({
  employeeId: string(),
  department: string(),
});

// Combine schemas with intersection (AND)
const employeeSchema = intersection([personSchema, employeePropsSchema]);

// Example usage
const validator = employeeSchema.toValidator();
const result = validator.safeParse({
  name: "John Doe",
  age: 30,
  employeeId: "E12345",
  department: "Engineering",
}); // Valid
```

### Extended Types

#### Nullable Schema

```typescript
import { string, number, nullable } from "veffect";

// Create schemas that accept null values
const nullableStringSchema = nullable(string()); // string | null

// This is equivalent to
const nullableString2 = string().nullable();

// Example usage
const validator = nullableStringSchema.toValidator();
const result = validator.safeParse("hello"); // Valid
const result2 = validator.safeParse(null); // Valid
const result3 = validator.safeParse(123); // Invalid
```

#### Optional Schema

```typescript
import { string, object, optional } from "veffect";

// Create schemas that accept undefined values
const optionalStringSchema = optional(string()); // string | undefined

// This is equivalent to
const optionalString2 = string().optional();

// Common usage in objects
const userSchema = object({
  name: string(),
  email: string().email(),
  bio: optional(string()), // bio?: string
});

// Example usage
const validator = userSchema.toValidator();
const result = validator.safeParse({
  name: "John",
  email: "john@example.com",
  // bio is optional so can be omitted
}); // Valid
```

#### Nullish Schema

```typescript
import { string, nullish } from "veffect";

// Create schemas that accept null or undefined values
const nullishStringSchema = nullish(string()); // string | null | undefined

// This is equivalent to
const nullishString2 = string().nullish();

// Example usage
const validator = nullishStringSchema.toValidator();
const result = validator.safeParse("hello"); // Valid
const result2 = validator.safeParse(null); // Valid
const result3 = validator.safeParse(undefined); // Valid
```

#### Default Schema

```typescript
import { string, number, object, default_ } from "veffect";

// Create schemas with default values
const withDefaultSchema = default_(string(), "default value");

// This is equivalent to
const withDefault2 = string().default("default value");

// Common usage in objects
const userSettingsSchema = object({
  theme: string().default("light"),
  fontSize: number().default(14),
  notifications: boolean().default(true),
});

// Example usage
const validator = userSettingsSchema.toValidator();
const result = validator.safeParse({
  theme: "dark",
  // Other fields will get default values
});

console.log(result.data);
// {
//   theme: "dark",
//   fontSize: 14,
//   notifications: true
// }
```

## Schema Methods

All schemas in VEffect Validation share a common set of methods:

### Validator Creation

```typescript
const schema = string().email();

// Create a validator
const validator = schema.toValidator();

// Use the validator
const result = validator.safeParse(input);
```

### Refinements

```typescript
const schema = string().refine(
  (value) => value.includes("@"),
  (value) => `${value} must include an @ symbol`
);
```

### Transformations

```typescript
const schema = string().transform((value) => value.toUpperCase());
```

### Error Customization

```typescript
const schema = string()
  .email()
  .errMessage("Please provide a valid email address");
```

### Metadata

```typescript
const schema = string().description("User's email address");
```

### Composability

```typescript
// Make any schema optional, nullable, or default
const schema = string().email().optional();
const schema2 = number().min(0).nullable();
const schema3 = boolean().default(false);
```

## 🧰 Advanced Features

### Custom Validation with Refine

```typescript
import { string, number } from "veffect";

// Custom validation on single fields
const passwordSchema = string()
  .minLength(8)
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one number"
  );

// Complex validation rules
const priceSchema = number().refine(
  (price) => price % 0.25 === 0,
  "Price must be a multiple of 0.25"
);
```

### Transformations

```typescript
import { string, number } from "veffect";

// Transform validated data
const lowercaseEmailSchema = string()
  .email()
  .transform((email) => email.toLowerCase());

// Create new data structure
const coordinateSchema = string()
  .regex(/^(\d+),(\d+)$/, "Must be in format 'x,y'")
  .transform((str) => {
    const [x, y] = str.split(",");
    return { x: parseInt(x), y: parseInt(y) };
  });

// Example usage
const validator = lowercaseEmailSchema.toValidator();
const result = validator.safeParse("User@Example.com");
// result.data === 'user@example.com'
```

### Async Validation

```typescript
import { string, object } from "veffect";

const userSchema = object({
  username: string().minLength(3),
}).refineAsync(async (user) => {
  // Check if username is already taken in the database
  const exists = await checkUsernameExists(user.username);
  return !exists;
}, "Username is already taken");

// Use async validation
const validator = userSchema.toValidator();
const result = await validator.validateAsync({
  username: "john_doe",
});
```

### Custom Error Messages

```typescript
import { string, object } from "veffect";

// Custom error messages per validation
const userSchema = object({
  username: string()
    .minLength(3, "Username must be at least 3 characters")
    .maxLength(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscore"
    ),

  email: string().email("Please enter a valid email address"),
});

// Global error message for the schema
const emailSchema = string().email().errMessage("Invalid email format");
```

### Extending Schemas

```typescript
import { string } from "veffect";

// Create a reusable base schema
const baseStringSchema = string().trim().minLength(1, "Value cannot be empty");

// Extend it for specific use cases
const emailSchema = baseStringSchema.email("Invalid email");
const usernameSchema = baseStringSchema
  .regex(/^[a-zA-Z0-9_]+$/, "Invalid characters")
  .minLength(3, "Username too short");

// Create a custom schema creator
function createStringEnum(values, errorMessage) {
  return string().refine(
    (value) => values.includes(value),
    errorMessage || `Value must be one of: ${values.join(", ")}`
  );
}

// Use the custom creator
const colorSchema = createStringEnum(["red", "green", "blue"]);
```

## 🚨 Error Handling

VEffect provides detailed error information when validation fails.

```typescript
import { object, string, number } from "veffect";

const userSchema = object({
  name: string().minLength(2),
  email: string().email(),
  age: number().min(18),
});

const validator = userSchema.toValidator();
const result = validator.safeParse({
  name: "J",
  email: "not-an-email",
  age: 16,
});

if (!result.success) {
  console.log(result.error);
  // Output:
  // {
  //   _tag: 'ObjectValidationError',
  //   message: 'Object validation failed',
  //   errors: [
  //     {
  //       _tag: 'StringValidationError',
  //       message: 'String must be at least 2 characters',
  //       path: ['name']
  //     },
  //     {
  //       _tag: 'StringValidationError',
  //       message: 'Invalid email address',
  //       path: ['email']
  //     },
  //     {
  //       _tag: 'NumberValidationError',
  //       message: 'Number must be at least 18',
  //       path: ['age']
  //     }
  //   ]
  // }

  // Helper function to format errors
  function formatErrors(error) {
    if (error._tag === "ObjectValidationError" && error.errors) {
      return error.errors
        .map((err) => {
          const path = err.path?.join(".") || "unknown";
          return `${path}: ${err.message}`;
        })
        .join("\n");
    }
    return error.message;
  }

  console.log(formatErrors(result.error));
  // Output:
  // name: String must be at least 2 characters
  // email: Invalid email address
  // age: Number must be at least 18
}
```

## 📚 Examples

The repository includes several example files in the `playground` directory:

```bash
# README examples (matches this documentation)
npx ts-node playground/readme-examples.ts

# Basic validation examples
npx ts-node playground/basic-validation.ts

# Object and tuple validation
npx ts-node playground/objects-and-tuples.ts

# Discriminated union and pattern matching
npx ts-node playground/discriminated-union.ts

# Path tracking in error messages
npx ts-node playground/path-tracking.ts

# Async validation
npx ts-node playground/async-validation.ts

# Transformations and pipelines
npx ts-node playground/transformations.ts
```

## 📖 API Reference

VEffect Validation provides a comprehensive API for schema creation, validation, and transformation. This section highlights key components of the API.

### Core Functions

```typescript
import {
  string,
  number,
  boolean,
  date,
  object,
  array,
  tuple,
  record,
  map,
  set,
  literal,
  enum_,
  union,
  intersection,
  nullable,
  optional,
  nullish,
  default_,
  custom,
  any,
  invalid,
} from "veffect";

// Create schemas using these factory functions
const stringSchema = string();
const numberSchema = number();
const objectSchema = object({ name: string() });
// etc.
```

### Common Methods

All schemas share these common methods:

```typescript
const schema = string();

// Validation methods
schema.toValidator(); // Create a validator
schema.parse(data); // Validate and return data or throw
schema.safeParse(data); // Validate and return result object
schema.validateAsync(data); // Async validation

// Refinement methods
schema.refine(fn, message); // Add custom validation rules
schema.refineAsync(fn, message); // Add async validation rules

// Transformation methods
schema.transform(fn); // Transform valid data
schema.pipe(otherSchema); // Chain with another schema

// Type modifiers
schema.nullable(); // Allow null values
schema.optional(); // Allow undefined values
schema.nullish(); // Allow null or undefined
schema.default(value); // Provide default value

// Error handling
schema.errMessage(message); // Custom error message

// Documentation
schema.description(text); // Add schema description
```

### Validator Result Types

```typescript
// Result of safeParse
type SafeParseSuccess<T> = {
  success: true;
  data: T;
};

type SafeParseError = {
  success: false;
  error: ValidationError;
};

type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseError;

// ValidationError hierarchy
interface ValidationError {
  _tag: string;
  message: string;
  path?: string[];
}

interface ObjectValidationError extends ValidationError {
  _tag: "ObjectValidationError";
  errors: ValidationError[];
}

// ... other specific error types
```

For complete API documentation including all available methods, options, and types, see [API.md](./API.md) or visit the [TypeDoc documentation](https://veffect.github.io).

## 🌟 Best Practices

### Schema Organization

```typescript
// src/schemas/user.ts
import { object, string, number } from "veffect";

export const addressSchema = object({
  street: string(),
  city: string(),
  zipCode: string().regex(/^\d{5}$/),
  country: string()
});

export const userSchema = object({
  id: string().uuid(),
  name: string().minLength(2),
  email: string().email(),
  age: number().min(18).optional(),
  address: addressSchema
});

// Export inferred types
export type Address = ReturnType<typeof addressSchema.toValidator()>['_type'];
export type User = ReturnType<typeof userSchema.toValidator()>['_type'];
```

### Reusing Schemas

```typescript
import { object, string } from "veffect";
import { addressSchema } from "./user";

// Reuse schemas in different contexts
export const companySchema = object({
  name: string(),
  website: string().url(),
  headquarters: addressSchema, // Reuse address schema
});
```

### Validation in Express APIs

```typescript
import express from "express";
import { object, string } from "veffect";

const app = express();
app.use(express.json());

// Create a validator middleware
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.toValidator().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error,
      });
    }
    // Add validated data to request
    req.validatedBody = result.data;
    next();
  };
}

// Use in routes
const loginSchema = object({
  email: string().email(),
  password: string().minLength(8),
});

app.post("/login", validateBody(loginSchema), (req, res) => {
  // req.validatedBody is typed and validated
  const { email, password } = req.validatedBody;
  // Login logic...
});
```

### Error Handling Patterns

```typescript
import { object, string } from "veffect";

// Create a helper for consistent error handling
function validate(schema, data) {
  const result = schema.toValidator().safeParse(data);
  if (!result.success) {
    // Format errors into a user-friendly structure
    const formattedErrors = {};

    if (result.error._tag === "ObjectValidationError") {
      result.error.errors.forEach((err) => {
        const field = err.path?.[0] || "unknown";
        formattedErrors[field] = err.message;
      });
    } else {
      formattedErrors.general = result.error.message;
    }

    return { valid: false, errors: formattedErrors };
  }

  return { valid: true, data: result.data };
}

// Usage
const userSchema = object({
  name: string().minLength(2),
  email: string().email(),
});

const validationResult = validate(userSchema, formData);
if (!validationResult.valid) {
  // Show errors in UI
  renderFormErrors(validationResult.errors);
} else {
  // Proceed with valid data
  submitForm(validationResult.data);
}
```

...

## **:handshake: Contributing**

- Fork it!
- Create your feature branch: `git checkout -b my-new-feature`
- Commit your changes: `git commit -am 'Add some feature'`
- Push to the branch: `git push origin my-new-feature`
- Submit a pull request

---

### **:busts_in_silhouette: Credits**

- [Chris Michael](https://github.com/chrismichaelps) (Project Leader, and Developer)

---

### **:anger: Troubleshootings**

This is just a personal project created for study / demonstration purpose and to simplify my working life, it may or may
not be a good fit for your project(s).

---

### **:heart: Show your support**

Please :star: this repository if you like it or this project helped you!\
Feel free to open issues or submit pull-requests to help me improving my work.

<p>
  <a href="https://www.buymeacoffee.com/chrismichael" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" />
  </a>
  <a href="https://paypal.me/chrismperezsantiago" target="_blank">
    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" style="height: 60px !important;" />
  </a>
</p>

---

### **:robot: Author**

_*Chris M. Perez*_

> You can follow me on
> [github](https://github.com/chrismichaelps)&nbsp;&middot;&nbsp;[twitter](https://twitter.com/Chris5855M)

---

Copyright ©2025 [veffect](https://github.com/chrismichaelps/veffect).
