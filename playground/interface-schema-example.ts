/**
 * Interface Schema Example
 *
 * This example demonstrates the interface schema's unique capabilities:
 * - Key optionality with ? suffix
 * - Clear distinction between key vs value optionality
 * - Properties with question marks in their names
 * - Nested object structures
 * - Transform and refinement capabilities
 */

import {
  interface_,
  string,
  number,
  boolean,
  array,
  object,
  Schema,
  InterfaceSchema,
} from "../dist";

console.log("=== Interface Schema Example ===\n");

// Basic interface schema with key optionality
console.log("1. Basic interface schema with key optionality");

const userSchema = interface_({
  name: string(),
  email: string().email(),
  "phone?": string(),            // Optional key (can be omitted)
  "address?": string(),          // Optional key (can be omitted)
});

const validator = userSchema.toValidator();

// Valid with all fields
console.log("\nValidating complete user:");
const completeUser = {
  name: "John Doe",
  email: "john@example.com",
  phone: "555-1234",
  address: "123 Main St"
};
const completeResult = validator.safeParse(completeUser);
console.log("  Success:", completeResult.success);

// Valid with only required fields
console.log("\nValidating user with only required fields:");
const minimalUser = {
  name: "Jane Smith",
  email: "jane@example.com"
};
const minimalResult = validator.safeParse(minimalUser);
console.log("  Success:", minimalResult.success);

// Invalid due to missing required field
console.log("\nValidating invalid user (missing email):");
const invalidUser = {
  name: "Bob Johnson"
};
const invalidResult = validator.safeParse(invalidUser);
console.log("  Success:", invalidResult.success);
if (!invalidResult.success) {
  console.log("  Error:", invalidResult.error.message);
}

// Demonstrating key vs value optionality
console.log("\n2. Key optionality vs value optionality");

// Key optional (property can be omitted)
const keyOptionalSchema = interface_({
  "name?": string(),
});

// Value optional (property must exist but can be undefined)
const valueOptionalSchema = interface_({
  name: string().optional(),
});

const keyValidator = keyOptionalSchema.toValidator();
const valueValidator = valueOptionalSchema.toValidator();

// Testing key optionality
console.log("\nKey optionality:");
console.log("  Empty object:", keyValidator.safeParse({}).success);
console.log("  With name:", keyValidator.safeParse({ name: "John" }).success);
console.log("  With undefined:", keyValidator.safeParse({ name: undefined }).success);

// Testing value optionality
console.log("\nValue optionality:");
console.log("  Empty object:", valueValidator.safeParse({}).success);
console.log("  With name:", valueValidator.safeParse({ name: "John" }).success);
console.log("  With undefined:", valueValidator.safeParse({ name: undefined }).success);

// Handling properties with question marks in names
console.log("\n3. Properties with question marks in names");

const schemaWithQuestionMark = interface_({
  'exists\\?': string(),  // Required field with ? in the name (escaped with \)
  "optional?": string(),  // Optional field (ends with ?)
});

const questionMarkValidator = schemaWithQuestionMark.toValidator();

// Testing question marks in property names
console.log("\nMissing required field 'exists?':");
const qmResult1 = questionMarkValidator.safeParse({});
console.log("  Success:", qmResult1.success);

console.log("\nWith required field 'exists?':");
const qmResult2 = questionMarkValidator.safeParse({ 'exists?': 'yes' });
console.log("  Success:", qmResult2.success);

console.log("\nWith both 'exists?' and optional field:");
const qmResult3 = questionMarkValidator.safeParse({ 'exists?': 'yes', optional: 'value' });
console.log("  Success:", qmResult3.success);

// Transform and refinement
console.log("\n4. Transform and refinement with interface schema");

const validatedUserSchema = interface_({
  username: string(),
  "age?": number(),
  "email?": string().email(),
})
  // Add refinement to check username length
  .refine(
    data => data.username.length >= 3,
    'Username must be at least 3 characters'
  )
  // Transform to add derived fields
  .transform(data => ({
    ...data,
    // Add a derived field
    displayName: data.username.toUpperCase(),
    // Add a status based on optional fields
    status: data.email ? 'verified' : 'unverified'
  }));

const transformValidator = validatedUserSchema.toValidator();

console.log("\nTransforming valid data:");
const transformResult = transformValidator.safeParse({
  username: "alice",
  email: "alice@example.com"
});

if (transformResult.success) {
  console.log("  Result:", JSON.stringify(transformResult.data, null, 2));
}

console.log("\nRefinement failing:");
const refinementResult = transformValidator.safeParse({
  username: "al"
});
console.log("  Success:", refinementResult.success);
if (!refinementResult.success) {
  console.log("  Error:", refinementResult.error.message);
}

// Nested structures
console.log("\n5. Nested object structures");

const nestedSchema = interface_({
  id: string(),
  name: string(),
  "metadata?": interface_({
    created: string(),
    "modified?": string(),
    tags: array(string()).optional(),  // Value optional (can be undefined)
    "notes?": array(string())          // Key optional (can be omitted)
  })
});

const nestedValidator = nestedSchema.toValidator();

// Complex object with all fields
const complexObj = {
  id: "123",
  name: "Test",
  metadata: {
    created: "2023-01-01",
    modified: "2023-01-02",
    tags: ["test", "example"],
    notes: ["Note 1", "Note 2"]
  }
};

console.log("\nValidating complex nested object:");
const nestedResult = nestedValidator.safeParse(complexObj);
console.log("  Success:", nestedResult.success);

// Object with missing optional fields/keys
const partialObj = {
  id: "456",
  name: "Test Partial",
  metadata: {
    created: "2023-01-03",
    tags: undefined  // Optional value can be undefined
    // missing modified (optional key)
    // missing notes (optional key)
  }
};

console.log("\nValidating with missing optional fields/keys:");
const partialResult = nestedValidator.safeParse(partialObj);
console.log("  Success:", partialResult.success);

// Recursive types
console.log("\n6. Recursive types with interface schema");

// Helper function for recursive types
function lazy<T>(fn: () => T): T {
  let value: T | undefined;
  return new Proxy({} as any, {
    get(target, prop) {
      if (!value) value = fn();
      return Reflect.get(value as object, prop);
    },
  });
}

// Define TreeNode interface for TypeScript
interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

// Create a recursive schema for a tree structure
const TreeSchema: InterfaceSchema<any> = interface_({
  id: string(),
  name: string(),
  "children?": array(
    lazy((): Schema<TreeNode[]> => TreeSchema as any)
  ),
});

const treeValidator = TreeSchema.toValidator();

const treeData = {
  id: "root",
  name: "Root Node",
  children: [
    {
      id: "child1",
      name: "Child 1",
      children: [
        { id: "grandchild1", name: "Grandchild 1" },
        { id: "grandchild2", name: "Grandchild 2" }
      ]
    },
    {
      id: "child2",
      name: "Child 2"
    }
  ]
};

console.log("\nValidating recursive tree structure:");
const treeResult = treeValidator.safeParse(treeData);
console.log("  Success:", treeResult.success);

console.log("\n=== Interface Schema Example Completed ===");
