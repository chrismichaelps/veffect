/**
 * Example of using VEffect's registry system
 */
import {
  string,
  number,
  boolean,
  object,
  array,
  createRegistry,
  globalRegistry,
  registerSchema,
  setMetadata,
  describe,
  registryUtils,
  Schema,
  GlobalMetadata
} from '../dist';

// === BASIC REGISTRY USAGE ===

// Define schemas with metadata using chained methods
const userSchema = object({
  id: number().integer(),
  name: string().minLength(2),
  email: string().email(),
  isActive: boolean(),
  tags: array(string())
});

// Apply metadata to schemas
setMetadata(userSchema.properties.id, {
  description: "Unique user identifier",
  examples: [1, 2, 3]
});

setMetadata(userSchema.properties.name, {
  description: "User's full name",
  examples: ["John Doe", "Jane Smith"]
});

setMetadata(userSchema.properties.email, {
  description: "User's email address",
  examples: ["user@example.com"]
});

setMetadata(userSchema.properties.isActive, {
  description: "Whether the user account is active",
  examples: [true]
});

setMetadata(userSchema.properties.tags, {
  description: "User tags or roles",
  examples: [["admin", "user"], ["user"]]
});

// Get metadata from a schema
const nameMetadata = globalRegistry.get(userSchema.properties.name);
console.log("Name field metadata:", nameMetadata);

// Alternative approach using describe for simple descriptions
const productSchema = object({
  id: number().integer(),
  name: string(),
  price: number().positive()
});

describe(productSchema.properties.id, "Unique product identifier");
describe(productSchema.properties.name, "Product name");
describe(productSchema.properties.price, "Product price in USD");

// === CUSTOM REGISTRIES ===

// Create a custom registry with specific metadata type
interface ApiMetadata extends GlobalMetadata {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresAuth: boolean;
  responseSchema?: any;
}

const apiRegistry = createRegistry<ApiMetadata>();

// Register schemas with API metadata
const getUserSchema = object({
  userId: number().integer()
});

registerSchema(getUserSchema, apiRegistry, {
  endpoint: '/users/:userId',
  method: 'GET',
  requiresAuth: true
});

const createUserSchema = object({
  name: string(),
  email: string().email(),
  password: string().minLength(8)
});

registerSchema(createUserSchema, apiRegistry, {
  endpoint: '/users',
  method: 'POST',
  requiresAuth: true
});

// Get all API endpoints
console.log("\nAPI Endpoints:");
apiRegistry.getAll().forEach(([schema, metadata]) => {
  console.log(`${metadata.method} ${metadata.endpoint} (Auth: ${metadata.requiresAuth ? 'Required' : 'None'})`);
});

// === TYPED EXAMPLES ===

// Create a registry with example data that matches schema types
interface ExampleMetadata<T> extends GlobalMetadata {
  examples: T[];
  description: string;
}

// Define a registry for user-related schemas
const userExampleRegistry = createRegistry<ExampleMetadata<any>>();

// Register a schema with strongly-typed examples
const loginSchema = object({
  email: string().email(),
  password: string().minLength(8)
});

registerSchema(loginSchema, userExampleRegistry, {
  description: "User login credentials",
  examples: [
    { email: "user@example.com", password: "securepassword" }
  ]
});

// Validate all examples in the registry
try {
  const validationResults = registryUtils.effects.validateAllExamples(userExampleRegistry);

  console.log("\nValidation of examples:");
  // Directly check the validation data
  if (validationResults && Array.isArray(validationResults)) {
    validationResults.forEach(result => {
      const schema = userExampleRegistry.get(result.schema);
      console.log(`- ${schema?.description}: ${result.valid ? 'All valid' : 'Has invalid examples'}`);
    });
  } else {
    console.log("No validation results or invalid format");
  }
} catch (error) {
  console.error("Error validating examples:", error);
}

// === GENERATE API DOCUMENTATION ===

// Define the type of documentation objects
interface ApiDoc {
  endpoint: string;
  method: string;
  auth: string;
  payload: string[];
}

// Generate documentation from registry metadata
console.log("\nAPI Documentation:");
const documentation = registryUtils.generateDocumentation<ApiDoc>(
  apiRegistry as any,
  (schema, metadata: any) => ({
    endpoint: metadata.endpoint,
    method: metadata.method,
    auth: metadata.requiresAuth ? 'Required' : 'None',
    // Add payload information by checking schema type
    payload: schema._tag === 'ObjectSchema' ? Object.keys((schema as any).properties) : []
  })
);

// Print documentation
documentation.forEach(doc => {
  console.log(`Endpoint: ${doc.method} ${doc.endpoint}`);
  console.log(`Auth: ${doc.auth}`);
  console.log(`Payload Fields: ${doc.payload.join(', ') || 'None'}`);
  console.log('---');
});

// === CUSTOM REGISTRY WITH ADVANCED CONSTRAINTS ===

// Create a registry specifically for string schemas
interface StringValidationMeta {
  pattern?: string;
  errorMessage: string;
  caseSensitive: boolean;
}

// The second type parameter constrains this registry to only accept string schemas
const stringRegistry = createRegistry<StringValidationMeta>();

// These will work with the registry
const usernameSchema = string().minLength(3).maxLength(20);
registerSchema(usernameSchema, stringRegistry, {
  pattern: '^[a-zA-Z0-9_]+$',
  errorMessage: 'Username must contain only letters, numbers, and underscores',
  caseSensitive: true
});

const emailSchema = string().email();
registerSchema(emailSchema, stringRegistry, {
  pattern: '^.+@.+\\..+$',
  errorMessage: 'Email must be valid',
  caseSensitive: false
});

// Generate validation rules for a frontend form validation library
console.log("\nFrontend Validation Rules:");
stringRegistry.getAll().forEach(([schema, meta]) => {
  console.log({
    type: 'string',
    pattern: meta.pattern,
    errorMessage: meta.errorMessage,
    caseSensitive: meta.caseSensitive
  });
});
