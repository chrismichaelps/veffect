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

- [Features](#-features)
- [Installation](#-installation)
- [Core Concepts](#-core-concepts)
- [Basic Usage](#-basic-usage)
- [Schema Types](#-schema-types)
  - [Primitive Types](#primitive-types)
  - [Complex Types](#complex-types)
  - [Special Types](#special-types)
  - [Composition Types](#composition-types)
  - [Extended Types](#extended-types)
- [Schema Methods](#-schema-methods)
- [Advanced Features](#-advanced-features)
- [Error Handling](#-error-handling)
- [Type Inference](#-type-inference)
- [Contributing](#handshake-contributing)
- [Troubleshooting](#anger-troubleshootings)
- [Show Your Support](#heart-show-your-support)
- [Author](#robot-author)

## ✨ Features

- **🔍 Type-Safe** - Full TypeScript integration with inferred types
- **⚡ High Performance** - Built on a functional core for speed and reliability
- **🛡️ Comprehensive Validation** - Rich set of validators for common use cases
- **🧩 Composable** - Build complex schemas from simple building blocks
- **🔄 Functional** - Clean API that encourages immutable operations
- **💬 Detailed Errors** - Helpful error messages with path tracking
- **🔀 Pattern Matching** - Dynamic schema selection based on input values
- **⚖️ Discriminated Unions** - First-class support for TypeScript's discriminated unions

## 🚀 Installation

```bash
npm install veffect
```

## 🧠 Core Concepts

VEffect provides a straightforward approach to validation:

1. **Create a schema** - Define the shape and constraints of your data
2. **Generate a validator** - Convert your schema into a validator
3. **Validate data** - Use the validator to check if data conforms to your schema

## 🔰 Basic Usage

```typescript
import { object, string, number } from "veffect";

// Define a schema
const userSchema = object({
  name: string().minLength(2).maxLength(50),
  age: number().min(18).max(120),
});

// Create a validator
const validator = userSchema.toValidator();

// Validate data
const validResult = validator.safeParse({
  name: "Alice",
  age: 30,
});
// { success: true, data: { name: "Alice", age: 30 } }

const invalidResult = validator.safeParse({
  name: "B",
  age: 16,
});
// {
//   success: false,
//   error: {
//     _tag: 'ObjectValidationError',
//     message: 'Object validation failed',
//     errors: [
//       {
//         _tag: 'StringValidationError',
//         message: 'String must be at least 2 characters',
//         path: ['name']
//       },
//       {
//         _tag: 'NumberValidationError',
//         message: 'Number must be at least 18',
//         path: ['age']
//       }
//     ]
//   }
// }
```

## 📊 Schema Types

### Primitive Types

#### String Schema

```typescript
import { string } from "veffect";

// Basic string validation
const nameSchema = string();

// String with constraints
const usernameSchema = string()
  .minLength(3)
  .maxLength(20)
  .regex(/^[a-zA-Z0-9_]+$/);

// Email validation
const emailSchema = string().email();

// URL validation
const websiteSchema = string().url();

// UUID validation
const idSchema = string().uuid();

// Datetime validation
const dateSchema = string().datetime();
const isoDateSchema = string().datetime({ precision: 3 });

// String validation with other methods
const pathSchema = string().startsWith("/").includes("api");
const codeSchema = string().endsWith(".ts").nonempty();

// String transformations
const normalizedEmailSchema = string().email().toLowerCase().trim();
```

#### Number Schema

```typescript
import { number } from "veffect";

// Basic number validation
const ageSchema = number();

// Number with constraints
const percentSchema = number().min(0).max(100);

// Integer validation
const countSchema = number().integer();

// Sign constraints
const positiveSchema = number().positive(); // > 0
const negativeSchema = number().negative(); // < 0
const nonnegativeSchema = number().nonnegative(); // >= 0
const nonpositiveSchema = number().nonpositive(); // <= 0

// Multiple of validation
const evenSchema = number().multipleOf(2);
const quarterSchema = number().step(0.25); // step is alias for multipleOf

// Other validations
const finiteSchema = number().finite();
const safeSchema = number().safe();
const portSchema = number().port(); // validates 1-65535 range for network ports

// Refinement with custom message
const evenNumberSchema = number()
  .integer()
  .refine((n) => n % 2 === 0, "Number must be even");
```

#### Boolean Schema

```typescript
import { boolean } from "veffect";

// Basic boolean validation
const isActiveSchema = boolean();

// With refinement
const termsAcceptedSchema = boolean().refine(
  (val) => val === true,
  "Terms must be accepted"
);
```

#### BigInt Schema

```typescript
import { bigint } from "veffect";

// Basic BigInt validation
const bigIntSchema = bigint();

// With constraints
const positiveSchema = bigint().positive(); // Only positive BigInts (> 0)
const nonNegativeSchema = bigint().nonNegative(); // Zero or positive BigInts (>= 0)
const rangeSchema = bigint().min(BigInt(10)).max(BigInt(100));
const multipleSchema = bigint().multipleOf(BigInt(5));

// Converting strings to BigInt
const fromStringSchema = bigint().fromString();
const result = fromStringSchema.toValidator().safeParse("12345");
// { success: true, data: 12345n }

// Refinements
const evenSchema = bigint().refine(
  (n) => n % BigInt(2) === BigInt(0),
  "BigInt must be even"
);

// Practical example: User with balance
const userSchema = object({
  id: string(),
  username: string().minLength(3).maxLength(20),
  balance: bigint().nonNegative(),
});

// Large number handling
const LARGE_BIGINT = BigInt("1234567890123456789012345678901234567890");
// BigInts can represent numbers of arbitrary precision, unlike regular numbers
```

### Complex Types

#### Object Schema

```typescript
import { object, string, number, boolean, array } from "veffect";

// Basic object validation
const userSchema = object({
  name: string(),
  age: number(),
  isActive: boolean(),
});

// Nested objects
const profileSchema = object({
  user: userSchema,
  preferences: object({
    theme: string(),
    notifications: boolean(),
  }),
});

// Optional fields
const postSchema = object({
  title: string(),
  content: string(),
  tags: array(string()).optional(),
  publishedAt: string().datetime().optional(),
});
```

#### Array Schema

```typescript
import { array, string, number } from "veffect";

// Array of strings
const tagsSchema = array(string());

// Array with constraints
const topScoresSchema = array(number()).minLength(1).maxLength(10);

// Nested arrays
const matrixSchema = array(array(number()));

// Non-empty array
const requiredTagsSchema = array(string()).nonEmpty();
```

#### Map Schema

```typescript
import { map, string, number, set } from "veffect";

// Basic Map validation
const userScoreMap = map(string(), number());
const scoreValidator = userScoreMap.toValidator();

const validScores = new Map([
  ["alice", 95],
  ["bob", 87],
  ["charlie", 92],
]);

// Map with size constraints
const teamMap = map(string(), array(string())).minSize(2).maxSize(5);

// Map operations
const configMap = map(string(), string());
const dbConfigValidator = configMap.hasKey("database").toValidator();
const redisConfigValidator = configMap.hasValue("redis").toValidator();
const requiredEntriesValidator = configMap
  .entries([
    ["host", "localhost"],
    ["port", "6379"],
  ])
  .toValidator();

// Nested validation
const userPermissionsMap = map(
  string(),
  set(
    string().refine(
      (s) => ["read", "write", "delete", "admin"].includes(s),
      "Permission must be one of: read, write, delete, admin"
    )
  )
);

// Map transformations
const sumScoresSchema = map(string(), number()).transform((m) =>
  [...m.values()].reduce((sum, score) => sum + score, 0)
);

// Map to object transformation
const mapToObjectSchema = map(string(), number()).transform((m) => {
  const obj: Record<string, number> = {};
  m.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
});
```

#### Set Schema

```typescript
import { set, string, number } from "veffect";

// Basic Set validation
const namesSet = set(string());
const namesValidator = namesSet.toValidator();

const validNames = new Set(["Alice", "Bob", "Charlie"]);

// Set with size constraints
const teamSet = set(string()).minSize(2).maxSize(5);

// Set operations
const adminRolesSet = set(string());
const hasAdminValidator = adminRolesSet.has("admin").toValidator();
const supersetValidator = adminRolesSet
  .superset(new Set(["user", "admin"]))
  .toValidator();
const subsetValidator = adminRolesSet
  .subset(new Set(["user", "admin", "moderator"]))
  .toValidator();

// Set validations with constraints
const positiveNumbersSet = set(number().positive());
const evenNumbersSet = set(number()).refine(
  (s) => [...s].every((n) => n % 2 === 0),
  "Set must contain only even numbers"
);

// Set transformations
const sumSetSchema = set(number()).transform((s) =>
  [...s].reduce((sum, n) => sum + n, 0)
);
const toArraySchema = set(string()).transform((s) => [...s].sort());
```

#### Tuple Schema

```typescript
import { tuple, string, number, boolean } from "veffect";

// Basic tuple validation
const pointSchema = tuple([number(), number()]);

// Mixed types tuple
const userDataSchema = tuple([
  string(), // id
  string(), // name
  number(), // age
  boolean(), // isActive
]);

// With optional values
const rangeSchema = tuple([
  number(), // min
  number(), // max
  number().optional(), // step
]);
```

#### Record Schema

```typescript
import { record, string, number } from "veffect";

// Record with string keys and number values
const scoresByUserSchema = record(string(), number());

// Record with validation
const positiveScoresByUserSchema = record(string(), number().positive());
```

### Special Types

#### Any Schema

```typescript
import { any } from "veffect";

// Accepts any value
const dataSchema = any();

// Can still be refined
const nonNullSchema = any().refine(
  (val) => val !== null && val !== undefined,
  "Value cannot be null or undefined"
);
```

#### Literal Schema

```typescript
import { literal, union } from "veffect";

// Literal values
const trueSchema = literal(true);
const adminSchema = literal("admin");

// Combined with union for enums
const roleSchema = union([literal("admin"), literal("user"), literal("guest")]);
```

### Composition Types

#### Union Schema

```typescript
import { union, string, number, literal, object } from "veffect";

// Simple union
const stringOrNumberSchema = union([string(), number()]);

// ID that can be string or number
const idSchema = union([string(), number()]);

// Status enum using literals
const statusSchema = union([
  literal("pending"),
  literal("active"),
  literal("completed"),
  literal("failed"),
]);

// Advanced pattern
const resultSchema = union([
  object({
    success: literal(true),
    data: string(),
  }),
  object({
    success: literal(false),
    error: string(),
  }),
]);
```

#### Discriminated Union Schema

```typescript
import { discriminatedUnion, object, string, number, literal } from "veffect";

// Shape types with discriminator field
const circleSchema = object({
  type: literal("circle"),
  radius: number().positive(),
});

const rectangleSchema = object({
  type: literal("rectangle"),
  width: number().positive(),
  height: number().positive(),
});

// Combine them in a discriminated union
const shapeSchema = discriminatedUnion("type", [circleSchema, rectangleSchema]);

// Usage
const validator = shapeSchema.toValidator();

const validCircle = validator.safeParse({
  type: "circle",
  radius: 5,
}); // Success

const validRectangle = validator.safeParse({
  type: "rectangle",
  width: 10,
  height: 20,
}); // Success

const invalidShape = validator.safeParse({
  type: "triangle",
  sides: 3,
}); // Error: Unknown discriminator value
```

#### Intersection Schema

```typescript
import { intersection, object, string, number } from "veffect";

// Base schemas to combine
const personSchema = object({
  name: string(),
  age: number(),
});

const employeeSchema = object({
  company: string(),
  role: string(),
});

// Combine them to create an employee profile
const employeeProfileSchema = intersection([personSchema, employeeSchema]);

// Usage
const validator = employeeProfileSchema.toValidator();

const validEmployee = validator.safeParse({
  name: "John",
  age: 30,
  company: "Acme Inc",
  role: "Developer",
}); // Success

const invalidEmployee = validator.safeParse({
  name: "Jane",
  company: "Acme Inc",
}); // Error: Missing required fields
```

### Extended Types

#### Optional Schema

```typescript
import { string, number, object, array } from "veffect";

// Optional fields in objects
const userSchema = object({
  name: string(),
  email: string().email(),
  phone: string().optional(),
  age: number().optional(),
});

// Making any schema optional
const tagsSchema = array(string()).optional();
```

#### Nullable Schema

```typescript
import { string, number, object } from "veffect";

// Nullable fields
const userSchema = object({
  name: string(),
  email: string().email(),
  phone: string().nullable(), // can be string or null
  age: number().nullable(), // can be number or null
});

// Making any schema nullable
const scoreSchema = number().positive().nullable();
```

#### Default Schema

```typescript
import { string, number, boolean, object } from "veffect";

// Default values
const userSettingsSchema = object({
  theme: string().default("light"),
  notifications: boolean().default(true),
  itemsPerPage: number().min(5).max(100).default(10),
});

// Function as default value
const postSchema = object({
  title: string(),
  content: string(),
  createdAt: string()
    .datetime()
    .default(() => new Date().toISOString()),
});
```

#### Nullish Schema

```typescript
import { string, number, object, array } from "veffect";

// Nullish fields (accepts both null and undefined)
const userSchema = object({
  name: string(),
  email: string().email(),
  phone: string().nullish(), // can be string, null or undefined
  age: number().nullish(), // can be number, null or undefined
});

// Making any schema nullish
const tagsSchema = array(string()).nullish();

// Validating nullish values
const validator = string().nullish().toValidator();
console.log(validator.safeParse("hello")); // Success: string
console.log(validator.safeParse(null)); // Success: null
console.log(validator.safeParse(undefined)); // Success: undefined
```

## 🔧 Schema Methods

### Refinements

```typescript
import { number, string, object, array } from "veffect";

// Simple refinement
const positiveSchema = number().refine((n) => n > 0, "Number must be positive");

// Refinement with dynamic message
const passwordSchema = string().refine(
  (pwd) => pwd.length >= 8,
  (pwd) =>
    `Password too short, needs at least ${8 - pwd.length} more characters`
);

// Object-level refinement
const credentialsSchema = object({
  username: string(),
  password: string(),
  confirmPassword: string(),
  securityQuestions: array(string()).minLength(2),
}).refine(
  (obj) => obj.password === obj.confirmPassword,
  "Passwords do not match"
);
```

### Transformations

```typescript
import { string, number, object, array } from "veffect";

// String transformations
const normalizedEmailSchema = string()
  .email()
  .transform((email) => email.toLowerCase().trim());

// Number transformation
const celsiusToFahrenheitSchema = number().transform((c) => (c * 9) / 5 + 32);

// Array transformation
const sortedArraySchema = array(number()).transform((arr) =>
  [...arr].sort((a, b) => a - b)
);

// Complex transformation
const userStatsSchema = object({
  scores: array(number()),
}).transform((obj) => ({
  scores: obj.scores,
  total: obj.scores.reduce((a, b) => a + b, 0),
  average: obj.scores.reduce((a, b) => a + b, 0) / obj.scores.length,
  min: Math.min(...obj.scores),
  max: Math.max(...obj.scores),
}));
```

### Error Customization

```typescript
import { string, number, object } from "veffect";

// Custom error messages
const usernameSchema = string()
  .minLength(3, "Username must have at least 3 characters")
  .maxLength(20, "Username cannot exceed 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

// Top-level error message
const userSchema = object({
  username: string(),
  email: string(),
  password: string(),
}).error("Invalid user data provided");
```

## 🔍 Advanced Features

### Async Validation

```typescript
import { string, object } from "veffect";

// Real API function to check username availability
async function checkUsernameAvailability(username: string) {
  console.log(`Checking if username "${username}" is available...`);

  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users?username=${username}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error while checking username availability:", error);
    throw error;
  }
}

// Schema with async validation
const usernameSchema = string().refine(async (username) => {
  try {
    const data = await checkUsernameAvailability(username);

    // If the API returns any results, consider the username taken
    const isAvailable = data.length === 0;
    console.log(
      `Username "${username}" is ${isAvailable ? "available" : "already taken"}`
    );

    return isAvailable;
  } catch (error) {
    // Handle API errors gracefully
    console.error("Error in username validation:", error);
    return false; // Fail validation if API check fails
  }
}, "Username is already taken or could not be verified");

// Usage with validateAsync
const validator = usernameSchema.toValidator();

try {
  const result = await validator.validateAsync("uniqueUsername");
  console.log("Username is valid:", result);
} catch (error) {
  console.error("Validation failed:", error.message);
}

// User registration with multiple async validations
const userRegistrationSchema = object({
  username: string().refine(async (username) => {
    try {
      const data = await checkUsernameAvailability(username);
      return data.length === 0; // Available if no matches found
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
    }
  }, "Username is already taken or could not be verified"),

  email: string()
    .email()
    .refine(async (email) => {
      try {
        // API call to check email availability
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users?email=${email}`
        );
        const data = await response.json();
        return data.length === 0; // Available if no matches found
      } catch (error) {
        console.error("Error checking email:", error);
        return false;
      }
    }, "Email is already registered or could not be verified"),

  password: string().minLength(8),
});

// With retry logic for transient API failures
async function fetchWithRetry(fetchFn, maxRetries = 3, delayMs = 500) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error("All retry attempts failed");
}

// Schema with retry logic
const retrySchema = string().refine(async (value) => {
  try {
    // Use fetchWithRetry to handle transient failures
    const result = await fetchWithRetry(async () => {
      const data = await checkUsernameAvailability(value);
      return data.length === 0;
    });

    return result;
  } catch (error) {
    console.error("All retries failed:", error);
    return false;
  }
}, "Validation failed after multiple retry attempts");
```

### Pattern Matching

```typescript
import {
  pattern,
  string,
  number,
  literal,
  object,
  any,
  invalid,
} from "veffect";

// Choose schema based on input value
const dataSchema = pattern((input) => {
  // String input - validate as email
  if (typeof input === "string") {
    return string().email();
  }

  // Number input - validate as positive
  if (typeof input === "number") {
    return number().positive();
  }

  // Object with type field - use appropriate schema
  if (typeof input === "object" && input && "type" in input) {
    switch (input.type) {
      case "user":
        return object({
          type: literal("user"),
          name: string(),
          email: string().email(),
        });
      case "product":
        return object({
          type: literal("product"),
          name: string(),
          price: number().positive(),
        });
    }
  }

  // Use invalid() to reject inputs that don't match any pattern
  return invalid("Invalid input type");
});

// Examples of usage
const validator = dataSchema.toValidator();

// Valid examples
validator.safeParse("user@example.com"); // Validates as email
validator.safeParse(42); // Validates as positive number
validator.safeParse({
  // Validates as user object
  type: "user",
  name: "Alice",
  email: "alice@example.com",
});

// Invalid examples
validator.safeParse("not-an-email"); // Fails email validation
validator.safeParse(-5); // Fails positive number validation
validator.safeParse({}); // Fails because missing 'type' field
validator.safeParse(null); // Fails with 'Invalid input type'
```

### Path Tracking

```typescript
import { object, string, number, array } from "veffect";

// Complex nested schema
const userListSchema = array(
  object({
    name: string(),
    email: string().email(),
    addresses: array(
      object({
        street: string(),
        city: string(),
        zipCode: string(),
      })
    ),
  })
);

// When validation fails, errors include the exact path to the invalid field
const validator = userListSchema.toValidator();
const result = validator.safeParse([
  {
    name: "John",
    email: "not-an-email",
    addresses: [
      {
        street: "123 Main St",
        city: "Anytown",
        zipCode: "12345",
      },
    ],
  },
]);

// Error will include path: [0, 'email']
// indicating the first user's email field is invalid
```

## 🚨 Error Handling

VEffect provides detailed error information when validation fails:

```typescript
import { object, string, number } from "veffect";

const userSchema = object({
  name: string().minLength(2),
  age: number().min(18),
});

const validator = userSchema.toValidator();
const result = validator.safeParse({
  name: "A",
  age: 16,
});

if (!result.success) {
  console.log(result.error);
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
  //       _tag: 'NumberValidationError',
  //       message: 'Number must be at least 18',
  //       path: ['age']
  //     }
  //   ],
  //   path: []
  // }
}
```

## 🔄 Type Inference

VEffect provides powerful type inference utilities inspired by Zod but built on Effect's foundation:

```typescript
import { string, number, object, Infer, Input, Output } from "veffect";

const UserSchema = object({
  id: number().integer(),
  name: string().minLength(2),
  age: number().min(18),
});

// Extract the TypeScript type from the schema
type User = Infer<typeof UserSchema>;
// Equivalent to: { id: number; name: string; age: number }

// With transformations, you can extract input and output types separately
const TransformedSchema = string().transform((val) => parseInt(val, 10));
type StringInput = Input<typeof TransformedSchema>; // string
type NumberOutput = Output<typeof TransformedSchema>; // number
```

## 📚 Examples

The repository includes several example files in the `playground` directory

---

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
