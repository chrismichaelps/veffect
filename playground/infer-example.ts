/**
 * Example usage of the type inference utilities
 */
import { string, number, boolean, object, array, Infer, Input, Output, InferOrType, SchemaType } from '../dist';

// Example 1: Basic Schema with Infer
const UserSchema = object({
  id: number().integer(),
  name: string().minLength(2).maxLength(50),
  email: string().email(),
  isActive: boolean(),
  tags: array(string())
});

// Type inference using Infer
type User = Infer<typeof UserSchema>;
// Equivalent to:
// type User = {
//   id: number;
//   name: string;
//   email: string;
//   isActive: boolean;
//   tags: string[];
// }

// Example 2: Schema with transformation
const StringToNumberSchema = string().transform(val => parseInt(val, 10));

// Demonstrating Input and Output types with transformed schemas
type StringInput = Input<typeof StringToNumberSchema>; // string
type NumberOutput = Output<typeof StringToNumberSchema>; // number

// Example 3: Using InferOrType for flexibility
const directType: InferOrType<string> = "Hello"; // Works with direct types
const schemaType: InferOrType<typeof UserSchema> = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  isActive: true,
  tags: ["user", "admin"]
}; // Works with schema types

// Example 4: Generic function that works with schema inference
function validateData<T extends object>(data: T, schema: { parse: (data: unknown) => T }): T {
  return schema.parse(data);
}

// Use it with our schema and inferred type
const userData: User = {
  id: 1,
  name: "Bob",
  email: "bob@example.com",
  isActive: true,
  tags: ["user"]
};

const validatedUser = validateData(userData, UserSchema.toValidator());
console.log("Validated user:", validatedUser);

// Example 5: Generic schema function with SchemaType
function processSchema<T extends SchemaType>(
  schema: T,
  data: unknown
): Infer<T> {
  return schema.toValidator().parse(data) as Infer<T>;
}

// Example 6: Primitive type inference
const StringSchema = string();
const NumberSchema = number();
const BooleanSchema = boolean();
const ArraySchema = array(string());

type StringType = Infer<typeof StringSchema>; // string
type NumberType = Infer<typeof NumberSchema>; // number
type BooleanType = Infer<typeof BooleanSchema>; // boolean
type StringArrayType = Infer<typeof ArraySchema>; // string[]

// Runtime examples showing the inferred types in action
const strValue: StringType = 'test';
const numValue: NumberType = 123;
const boolValue: BooleanType = true;
const arrayValue: StringArrayType = ['a', 'b', 'c'];

console.log("String value:", strValue);
console.log("Number value:", numValue);
console.log("Boolean value:", boolValue);
console.log("Array value:", arrayValue);

// Example 7: Handling transformations
const TransformedSchema = string().transform(val => parseInt(val, 10));
const parseResult = TransformedSchema.toValidator().parse('123');
console.log("Transformed value:", parseResult); // 123 (as a number)

// Example 8: Using a generic schema function
const result = processSchema(NumberSchema, 42);
console.log("Processed number:", result); // 42

const userResult = processSchema(UserSchema, {
  id: 2,
  name: 'Alice',
  email: 'alice@example.com',
  isActive: true,
  tags: ['user']
});
console.log("Processed user:", userResult);

// Example 9: Working with nested objects
const NestedSchema = object({
  user: UserSchema,
  settings: object({
    theme: string(),
    notifications: boolean()
  })
});

type NestedType = Infer<typeof NestedSchema>;
// Equivalent to:
// type NestedType = {
//   user: User;
//   settings: {
//     theme: string;
//     notifications: boolean;
//   }
// }

const nestedData: NestedType = {
  user: {
    id: 3,
    name: 'Bob',
    email: 'bob@example.com',
    isActive: true,
    tags: ['user']
  },
  settings: {
    theme: 'dark',
    notifications: false
  }
};

console.log("Nested data:", nestedData);

// Example 10: Complex schema with multiple transformations
const ComplexSchema = object({
  user: UserSchema,
  metadata: object({
    createdAt: string().transform(val => new Date(val)),
    updatedAt: string().transform(val => new Date(val))
  }),
  counts: string().transform(val => parseInt(val, 10))
});

type ComplexType = Infer<typeof ComplexSchema>;
// Equivalent to:
// type ComplexType = {
//   user: User;
//   metadata: {
//     createdAt: Date;
//     updatedAt: Date;
//   };
//   counts: number;
// }

// Input type is different due to transforms
type ComplexInput = Input<typeof ComplexSchema>;
// Equivalent to:
// type ComplexInput = {
//   user: User;
//   metadata: {
//     createdAt: string;
//     updatedAt: string;
//   };
//   counts: string;
// }

// Using the schema
const complexData = {
  user: userData,
  metadata: {
    createdAt: "2023-05-15T12:00:00Z",
    updatedAt: "2023-05-16T14:30:00Z"
  },
  counts: "42"
};

const parsedComplex = ComplexSchema.toValidator().parse(complexData);
console.log("Complex schema result:", parsedComplex);
// The dates are now Date objects and counts is a number

// How to run this example:
// npx ts-node src/examples/infer-example.ts
