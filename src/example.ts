/**
 * Example usage of the validation library
 */
import { string } from './schema/string';
import { number } from './schema/number';
import { boolean } from './schema/boolean';
import { object } from './schema/object';
import { array } from './schema/array';
import { optional } from './schema/optional';
import { ValidationError } from './types';

// Define a User schema
const UserSchema = object({
  id: number().integer(),
  name: string().minLength(2).maxLength(50),
  email: string().email(),
  isActive: boolean(),
  tags: array(string()),
  metadata: optional(object({
    lastLogin: string(),
    preferences: object({
      theme: string(),
      notifications: boolean()
    })
  }))
});

// Type inference for the validated user
type User = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  tags: string[];
  metadata?: {
    lastLogin: string;
    preferences: {
      theme: string;
      notifications: boolean;
    }
  };
};

// Example valid data
const validUser = {
  id: 123,
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  tags: ["user", "customer"],
  metadata: {
    lastLogin: "2023-04-10",
    preferences: {
      theme: "dark",
      notifications: true
    }
  }
};

// Example invalid data
const invalidUser = {
  id: 456.7, // Not an integer
  name: "J", // Too short
  email: "not-an-email", // Invalid email
  isActive: "yes", // Not a boolean
  tags: "user", // Not an array
  metadata: {
    lastLogin: 12345, // Not a string
    preferences: {
      theme: "dark",
      notifications: "yes" // Not a boolean
    }
  }
};

// Create a validator from the schema
const userValidator = UserSchema.toValidator();

// Validate the valid user
console.log("Validating valid user:");
const validResult = userValidator.safeParse(validUser);
console.log(validResult);

// Validate the invalid user
console.log("\nValidating invalid user:");
const invalidResult = userValidator.safeParse(invalidUser);
console.log(invalidResult);

// Using try/catch with parse for validation
console.log("\nUsing try/catch with parse:");
try {
  const validatedUser = userValidator.parse(validUser);
  console.log("Valid user:", validatedUser);
} catch (error) {
  console.error("Validation error:", error);
}

// Using async validation with promises
console.log("\nUsing async validation with Promise.resolve:");
userValidator
  .validateAsync(validUser)
  .then((validatedUser: User) => {
    console.log("Valid user (async):", validatedUser);
  })
  .catch((error: ValidationError) => {
    console.error("Validation error (async):", error);
  }); 