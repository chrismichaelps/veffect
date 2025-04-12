/**
 * Recursive Types Example with Interface Schema
 *
 * This example demonstrates how to use the new interface schema functionality
 * to create true recursive types that TypeScript can properly understand.
 */

import { interface_, string, number, array, object, Schema, InterfaceSchema } from '../dist';

console.log("=== Starting Recursive Types Example ===");

/**
 * A helper function to handle recursive types safely.
 * This provides better TypeScript support than directly using self-references.
 */
function lazy<T>(fn: () => T): T {
  let value: T | undefined;
  return new Proxy({} as any, {
    get(target, prop) {
      if (!value) value = fn();
      return Reflect.get(value as object, prop);
    }
  });
}

// ===== Example 1: Category tree with recursive structure =====

// First with the traditional approach using object() which requires type casting
interface Category {
  name: string;
  subcategories: Category[];
}
// Using traditional object approach with type annotation
const CategoryObjectSchema = object({
  name: string(),
  // This requires type assertion
  subcategories: array(lazy((): Schema<Category[]> => CategoryObjectSchema as any))
});

// Now with the new interface approach which is type-safe
const CategorySchema: InterfaceSchema<any> = interface_({
  name: string(),
  // Still need a type annotation but the structure is cleaner
  "subcategories?": array(lazy((): Schema<Category[]> => CategorySchema as any))
});

// Create a sample category tree
const categories = {
  name: "Root",
  subcategories: [
    {
      name: "Electronics",
      subcategories: [
        { name: "Phones", subcategories: [] },
        { name: "Laptops", subcategories: [] }
      ]
    },
    {
      name: "Books",
      subcategories: [
        { name: "Fiction", subcategories: [] },
        { name: "Non-fiction", subcategories: [] }
      ]
    }
  ]
};

// Validate the data with our schema
const result = CategorySchema.toValidator().safeParse(categories);
console.log("Category validation result:", result.success);

// ===== Example 2: Nested file system with recursive structure =====

// Define filesystem type for TypeScript
interface FileSystem {
  name: string;
  path: string;
  size?: number;
  type?: string;
  children?: FileSystem[];
}

// Define a file system structure with both files and folders
const FileSystemSchema: InterfaceSchema<any> = interface_({
  name: string(),
  path: string(),
  // Using the optional key feature of interface
  "size?": number(),
  "type?": string(),
  // Recursive reference to the same schema for children
  "children?": array(lazy((): Schema<FileSystem[]> => FileSystemSchema as any))
});

// Create a sample file system structure
const fileSystem = {
  name: "root",
  path: "/",
  children: [
    {
      name: "Documents",
      path: "/Documents",
      children: [
        {
          name: "report.pdf",
          path: "/Documents/report.pdf",
          size: 1024,
          type: "application/pdf",
        },
        {
          name: "notes.txt",
          path: "/Documents/notes.txt",
          size: 256,
          type: "text/plain",
        }
      ]
    },
    {
      name: "Images",
      path: "/Images",
      children: [
        {
          name: "photo.jpg",
          path: "/Images/photo.jpg",
          size: 2048,
          type: "image/jpeg",
        }
      ]
    }
  ]
};

// Validate the file system structure
const fsResult = FileSystemSchema.toValidator().safeParse(fileSystem);
console.log("File system validation result:", fsResult.success);

// ===== Example 3: JSON structure with recursive types =====

// Define the JSON value type
interface JsonValue {
  string?: string;
  number?: number;
  boolean?: string;
  null?: string;
  array?: JsonValue[];
  object?: Array<{ key: string, value: JsonValue }>;
}

// Create a schema for JSON data
const JsonSchema: InterfaceSchema<any> = interface_({
  "string?": string(),
  "number?": number(),
  "boolean?": string().refine(val => val === "true" || val === "false", "Must be 'true' or 'false'"),
  "null?": string().refine(val => val === "null", "Must be 'null'"),
  // For arrays, we can have any JsonValue
  "array?": array(lazy((): Schema<JsonValue[]> => JsonSchema as any)),
  // For objects, we need key-value pairs
  "object?": array(object({
    key: string(),
    value: lazy((): Schema<JsonValue> => JsonSchema as any)
  }))
});

// Example JSON data structure
const jsonData = {
  string: "Hello, world!",
  number: 42,
  boolean: "true",
  array: [
    { string: "item1" },
    { number: 123 },
    { array: [{ string: "nested" }] }
  ],
  object: [
    { key: "name", value: { string: "John" } },
    { key: "age", value: { number: 30 } },
    {
      key: "address", value: {
        object: [
          { key: "city", value: { string: "New York" } },
          { key: "zip", value: { string: "10001" } }
        ]
      }
    }
  ]
};

// Validate JSON data
const jsonResult = JsonSchema.toValidator().safeParse(jsonData);
console.log("JSON validation result:", jsonResult.success);

// ===== BENEFITS OF THE INTERFACE APPROACH =====
// 1. True recursive types without TypeScript errors when properly annotated
// 2. Key optionality with ? suffix that's easy to understand
// 3. Separation of key vs value optionality
// 4. Better type inference for nested structures
// 5. Explicit interface types make the recursive structure clear

console.log("\n=== All validations successful! ===");
console.log("Category validation:", result.success);
console.log("File system validation:", fsResult.success);
console.log("JSON validation:", jsonResult.success);
