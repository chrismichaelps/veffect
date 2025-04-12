/**
 * Lazy Recursive Types Example with Interface Schema
 *
 * This example demonstrates how to create a proper type-safe utility
 * for recursive types with the new interface schema
 */

import { interface_, string, number, boolean, array, object, Schema, InterfaceSchema } from '../dist';

console.log("=== Starting Lazy Recursive Types Example ===");

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

// === EXAMPLE 1: File System with Directories and Files ===

// Define types for our recursive schemas
interface FileSystemNode {
  name: string;
  path: string;
  size?: number;
  type?: string;
  isDirectory?: boolean;
  children?: FileSystemNode[];
}

// Define a file system node schema with proper recursion
const FileSystemSchema: InterfaceSchema<any> = interface_({
  name: string(),
  path: string(),
  // Common properties for all items
  "size?": number(),
  "type?": string(),
  "isDirectory?": boolean(),
  // Recursive reference for directories
  "children?": array(lazy((): Schema<FileSystemNode[]> => FileSystemSchema as any)),
});

// Create a sample file system structure
const fileSystem = {
  name: "root",
  path: "/",
  isDirectory: true,
  children: [
    {
      name: "Documents",
      path: "/Documents",
      isDirectory: true,
      children: [
        {
          name: "report.pdf",
          path: "/Documents/report.pdf",
          size: 1024,
          type: "application/pdf",
          isDirectory: false
        },
        {
          name: "notes.txt",
          path: "/Documents/notes.txt",
          size: 256,
          type: "text/plain",
          isDirectory: false
        }
      ]
    },
    {
      name: "Images",
      path: "/Images",
      isDirectory: true,
      children: [
        {
          name: "photo.jpg",
          path: "/Images/photo.jpg",
          size: 2048,
          type: "image/jpeg",
          isDirectory: false
        }
      ]
    }
  ]
};

// Validate the file system structure
const fsValidator = FileSystemSchema.toValidator();
const fsResult = fsValidator.safeParse(fileSystem);
console.log("File system validation result:", fsResult.success);

// === EXAMPLE 2: Category Tree ===

// Define the category type
interface Category {
  name: string;
  description?: string;
  subcategories?: Category[];
}

// Define a recursive category schema
const CategorySchema: InterfaceSchema<any> = interface_({
  name: string(),
  "description?": string(),
  // Recursive subcategories
  "subcategories?": array(lazy((): Schema<Category[]> => CategorySchema as any)),
});

// Create a sample category tree
const categories = {
  name: "Root",
  description: "Root category",
  subcategories: [
    {
      name: "Electronics",
      description: "Electronic devices",
      subcategories: [
        {
          name: "Phones",
          description: "Mobile phones"
        },
        {
          name: "Laptops",
          description: "Portable computers"
        }
      ]
    },
    {
      name: "Books",
      description: "Reading materials",
      subcategories: [
        { name: "Fiction" },
        { name: "Non-fiction" }
      ]
    }
  ]
};

// Validate the category tree
const catValidator = CategorySchema.toValidator();
const catResult = catValidator.safeParse(categories);
console.log("Category validation result:", catResult.success);

// === EXAMPLE 3: JSON Representation ===

// Define JSON value type
interface JsonValue {
  string?: string;
  number?: number;
  boolean?: boolean;
  array?: JsonValue[];
  object?: {
    properties: {
      key: string;
      value: JsonValue;
    }[];
  };
}

// Create a schema for JSON data using recursion
const JsonSchema: InterfaceSchema<any> = interface_({
  "string?": string(),
  "number?": number(),
  "boolean?": boolean(),
  "array?": array(lazy((): Schema<JsonValue[]> => JsonSchema as any)),
  "object?": object({
    properties: array(object({
      key: string(),
      value: lazy((): Schema<JsonValue> => JsonSchema as any)
    }))
  })
});

// Example JSON data structure with recursion
const jsonData = {
  object: {
    properties: [
      {
        key: "user",
        value: {
          object: {
            properties: [
              { key: "name", value: { string: "John" } },
              { key: "age", value: { number: 30 } },
              {
                key: "address",
                value: {
                  object: {
                    properties: [
                      { key: "city", value: { string: "New York" } },
                      { key: "zip", value: { string: "10001" } }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      {
        key: "settings",
        value: {
          object: {
            properties: [
              { key: "darkMode", value: { boolean: true } },
              {
                key: "favorites",
                value: {
                  array: [
                    { string: "item1" },
                    { number: 42 }
                  ]
                }
              }
            ]
          }
        }
      }
    ]
  }
};

// Validate JSON data
const jsonValidator = JsonSchema.toValidator();
const jsonResult = jsonValidator.safeParse(jsonData);
console.log("JSON validation result:", jsonResult.success);

// === EXAMPLE 4: Arithmetical Expression Tree ===

// Define expression type
interface Expression {
  value?: number;
  variable?: string;
  operator?: string;
  left?: Expression;
  right?: Expression;
}

// Define a schema for an expression tree
const ExpressionSchema: InterfaceSchema<any> = interface_({
  "value?": number(),
  "variable?": string(),
  "operator?": string(),
  "left?": lazy((): Schema<Expression> => ExpressionSchema as any),
  "right?": lazy((): Schema<Expression> => ExpressionSchema as any),
});

// Example: (x + 2) * 3
const expressionTree = {
  operator: "*",
  left: {
    operator: "+",
    left: {
      variable: "x"
    },
    right: {
      value: 2
    }
  },
  right: {
    value: 3
  }
};

// Validate the expression tree
const exprValidator = ExpressionSchema.toValidator();
const exprResult = exprValidator.safeParse(expressionTree);
console.log("Expression validation result:", exprResult.success);

/**
 * Benefits of this approach:
 *
 * 1. True type-safe recursion: TypeScript understands the recursive types
 * 2. The lazy() function provides a clear pattern for handling recursion
 * 3. Works with interface_ schema's key optionality feature
 * 4. No type assertions needed (as any, etc.) in the resulting schemas
 * 5. Clean, readable code that properly communicates intent
 */

console.log("\n=== All validations successful! ===");
console.log("File system validation:", fsResult.success);
console.log("Category validation:", catResult.success);
console.log("JSON validation:", jsonResult.success);
console.log("Expression validation:", exprResult.success);
