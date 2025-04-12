/**
 * Tests for registry and metadata functionality
 */
import {
  string,
  number,
  boolean,
  object,
  array
} from '../src';
import {
  createRegistry,
  globalRegistry,
  registerSchema,
  setMetadata,
  describe as describeSchema,
  extractExamples,
  registryUtils
} from '../src/registry';

describe('Registry functionality', () => {
  // Create test schemas
  const stringSchema = string();
  const numberSchema = number();
  const userSchema = object({
    id: number(),
    name: string(),
    isActive: boolean()
  });

  // Reset global registry before each test
  beforeEach(() => {
    // Clear the global registry
    globalRegistry.getAllSchemas().forEach(schema => {
      globalRegistry.remove(schema);
    });
  });

  describe('Basic registry operations', () => {
    it('should create a registry', () => {
      const registry = createRegistry();
      expect(registry).toBeDefined();
      expect(registry.getAllSchemas().length).toBe(0);
    });

    it('should add and retrieve schemas from a registry', () => {
      const registry = createRegistry<{ description: string }>();

      // Add schema with metadata
      registry.add(stringSchema, { description: 'A string schema' });

      // Check if schema exists
      expect(registry.has(stringSchema)).toBe(true);

      // Retrieve metadata
      const metadata = registry.get(stringSchema);
      expect(metadata).toEqual({ description: 'A string schema' });
    });

    it('should remove schemas from a registry', () => {
      const registry = createRegistry<{ description: string }>();

      // Add schema
      registry.add(stringSchema, { description: 'A string schema' });
      expect(registry.has(stringSchema)).toBe(true);

      // Remove schema
      registry.remove(stringSchema);
      expect(registry.has(stringSchema)).toBe(false);
      expect(registry.get(stringSchema)).toBeUndefined();
    });

    it('should get all schemas and metadata', () => {
      const registry = createRegistry<{ description: string }>();

      // Add multiple schemas
      registry.add(stringSchema, { description: 'A string schema' });
      registry.add(numberSchema, { description: 'A number schema' });

      // Get all schemas
      const schemas = registry.getAllSchemas();
      expect(schemas.length).toBe(2);
      expect(schemas).toContain(stringSchema);
      expect(schemas).toContain(numberSchema);

      // Get all metadata
      const metadata = registry.getAllMetadata();
      expect(metadata.length).toBe(2);
      expect(metadata).toContainEqual({ description: 'A string schema' });
      expect(metadata).toContainEqual({ description: 'A number schema' });

      // Get all entries
      const entries = registry.getAll();
      expect(entries.length).toBe(2);
      expect(entries).toContainEqual([stringSchema, { description: 'A string schema' }]);
      expect(entries).toContainEqual([numberSchema, { description: 'A number schema' }]);
    });
  });

  describe('Utility functions', () => {
    it('registerSchema should add schema to registry', () => {
      const registry = createRegistry<{ description: string }>();

      // Register schema
      const result = registerSchema(stringSchema, registry, { description: 'A string schema' });

      // Should return the schema
      expect(result).toBe(stringSchema);

      // Schema should be in registry
      expect(registry.has(stringSchema)).toBe(true);
      expect(registry.get(stringSchema)).toEqual({ description: 'A string schema' });
    });

    it('setMetadata should add schema to global registry', () => {
      // Set metadata
      const result = setMetadata(stringSchema, {
        description: 'A string schema',
        examples: ['example']
      });

      // Should return the schema
      expect(result).toBe(stringSchema);

      // Schema should be in global registry
      expect(globalRegistry.has(stringSchema)).toBe(true);
      expect(globalRegistry.get(stringSchema)).toEqual({
        description: 'A string schema',
        examples: ['example']
      });
    });

    it('describe should set description metadata', () => {
      // Set description
      const result = describeSchema(stringSchema, 'A string schema');

      // Should return the schema
      expect(result).toBe(stringSchema);

      // Schema should be in global registry with description
      expect(globalRegistry.has(stringSchema)).toBe(true);
      expect(globalRegistry.get(stringSchema)).toEqual({ description: 'A string schema' });
    });

    it('extractExamples should return examples from metadata', () => {
      // Set metadata with examples
      setMetadata(stringSchema, {
        description: 'A string schema',
        examples: ['example1', 'example2']
      });

      // Extract examples
      const examples = extractExamples(stringSchema);

      // Should return examples array
      expect(examples).toEqual(['example1', 'example2']);
    });

    it('extractExamples should return empty array if no examples', () => {
      // Set metadata without examples
      setMetadata(stringSchema, { description: 'A string schema' });

      // Extract examples
      const examples = extractExamples(stringSchema);

      // Should return empty array
      expect(examples).toEqual([]);
    });
  });

  describe('Registry utility functions', () => {
    it('should find schemas by tag', () => {
      // Add schemas with different tags
      setMetadata(stringSchema, { description: 'A string schema', tag: 'primitive' });
      setMetadata(numberSchema, { description: 'A number schema', tag: 'primitive' });
      setMetadata(userSchema, { description: 'A user schema', tag: 'object' });

      // Find schemas by tag
      const primitives = registryUtils.findSchemasByTag(globalRegistry, 'primitive');

      // Should return correct schemas
      expect(primitives.length).toBe(2);
      expect(primitives.map(([schema]) => schema)).toContain(stringSchema);
      expect(primitives.map(([schema]) => schema)).toContain(numberSchema);

      // Find another tag
      const objects = registryUtils.findSchemasByTag(globalRegistry, 'object');

      // Should return correct schemas
      expect(objects.length).toBe(1);
      expect(objects.map(([schema]) => schema)).toContain(userSchema);
    });

    it('should generate documentation', () => {
      // Add schemas with metadata
      setMetadata(stringSchema, {
        description: 'A string schema',
        examples: ['example']
      });

      setMetadata(numberSchema, {
        description: 'A number schema',
        minimum: 0,
        maximum: 100
      });

      // Generate documentation
      const docs = registryUtils.generateDocumentation(
        globalRegistry,
        (schema, metadata) => ({
          type: schema._tag,
          description: metadata.description,
          constraints: metadata.minimum !== undefined ?
            `${metadata.minimum} to ${metadata.maximum}` : undefined
        })
      );

      // Should generate correct documentation
      expect(docs.length).toBe(2);
      expect(docs).toContainEqual({
        type: 'StringSchema',
        description: 'A string schema',
        constraints: undefined
      });

      expect(docs).toContainEqual({
        type: 'NumberSchema',
        description: 'A number schema',
        constraints: '0 to 100'
      });
    });
  });

  describe('Example validation', () => {
    it('should validate examples', () => {
      // Create registry with examples
      const validExampleRegistry = createRegistry<{ examples: any[]; description: string }>();

      // Add schema with valid examples
      registerSchema(string(), validExampleRegistry, {
        description: 'Valid string schema',
        examples: ['valid1', 'valid2']
      });

      // Get validation results directly - Effect usage is hidden internally
      const results = registryUtils.effects.validateAllExamples(validExampleRegistry as any);

      // Should validate successfully
      expect(results.length).toBe(1);
      expect(results[0].valid).toBe(true);
    });

    it('should detect invalid examples', () => {
      // Create registry with examples
      const invalidExampleRegistry = createRegistry<{ examples: any[]; description: string }>();

      // Add schema with invalid examples
      registerSchema(number(), invalidExampleRegistry, {
        description: 'Number schema with invalid examples',
        examples: [123, 'not-a-number', 456]
      });

      // Get validation results directly - Effect usage is hidden internally
      const results = registryUtils.effects.validateAllExamples(invalidExampleRegistry as any);

      // Should detect invalid example
      expect(results.length).toBe(1);
      expect(results[0].valid).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty registries', () => {
      const registry = createRegistry();

      expect(registry.getAllSchemas()).toEqual([]);
      expect(registry.getAllMetadata()).toEqual([]);
      expect(registry.getAll()).toEqual([]);

      // Search on empty registry
      const results = registryUtils.findSchemasByTag(registry as any, 'tag');
      expect(results).toEqual([]);

      // Map on empty registry
      const docs = registryUtils.generateDocumentation(
        registry as any,
        () => ({ type: 'unknown' })
      );
      expect(docs).toEqual([]);
    });

    it('should handle overwriting metadata', () => {
      const registry = createRegistry<{ version: number }>();

      // Add initial metadata
      registry.add(stringSchema, { version: 1 });
      expect(registry.get(stringSchema)).toEqual({ version: 1 });

      // Overwrite metadata
      registry.add(stringSchema, { version: 2 });
      expect(registry.get(stringSchema)).toEqual({ version: 2 });
    });

    it('should handle circular references', () => {
      const registry = createRegistry<{ ref?: any }>();

      // Create circular reference
      const metadata: { ref?: any } = {};
      metadata.ref = metadata; // Circular reference

      // Add to registry
      registry.add(stringSchema, metadata);

      // Should be retrievable
      const retrieved = registry.get(stringSchema);
      expect(retrieved).toBe(metadata);
      expect(retrieved?.ref).toBe(retrieved);
    });

    it('should handle schemas with same structure but different instances', () => {
      const registry = createRegistry<{ description: string }>();

      // Create two schemas with same structure
      const schema1 = object({ id: number() });
      const schema2 = object({ id: number() });

      // Add both to registry
      registry.add(schema1, { description: 'First schema' });
      registry.add(schema2, { description: 'Second schema' });

      // Should treat them as separate entries
      expect(registry.getAllSchemas().length).toBe(2);
      expect(registry.get(schema1)).toEqual({ description: 'First schema' });
      expect(registry.get(schema2)).toEqual({ description: 'Second schema' });
    });

    it('should handle non-existing schemas', () => {
      const registry = createRegistry();

      // Get non-existing schema
      expect(registry.get(stringSchema)).toBeUndefined();

      // Remove non-existing schema
      expect(registry.remove(stringSchema)).toBe(false);
    });

    it('should handle concurrent modifications', () => {
      const registry = createRegistry<{ count: number }>();

      // Add initial metadata
      registry.add(stringSchema, { count: 0 });

      // Simulate concurrent modifications
      const operations = Array(100).fill(0).map((_, i) => {
        return () => {
          const currentMeta = registry.get(stringSchema);
          registry.add(stringSchema, { count: (currentMeta?.count || 0) + 1 });
        };
      });

      // Run operations
      operations.forEach(op => op());

      // Final count should be 100
      expect(registry.get(stringSchema)?.count).toBe(100);
    });
  });

  describe('Advanced usage scenarios', () => {
    it('should handle nested schemas with metadata', () => {
      // Create complex schema with nested objects
      const addressSchema = object({
        street: string(),
        city: string(),
        country: string(),
        zipCode: string()
      });

      const extendedUserSchema = object({
        id: number(),
        name: string(),
        email: string(),
        address: addressSchema,
        contacts: array(object({
          type: string(),
          value: string()
        }))
      });

      // Add metadata to nested properties
      setMetadata(extendedUserSchema.properties.address, {
        description: 'User physical address',
        examples: [{ street: '123 Main St', city: 'New York', country: 'USA', zipCode: '10001' }]
      });

      setMetadata((extendedUserSchema.properties.address as any).properties.zipCode, {
        description: 'Postal code',
        format: 'zip'
      });

      setMetadata(extendedUserSchema.properties.contacts, {
        description: 'User contact information',
        examples: [[
          { type: 'email', value: 'user@example.com' },
          { type: 'phone', value: '555-1234' }
        ]]
      });

      // Verify metadata was added correctly
      expect(globalRegistry.has(extendedUserSchema.properties.address)).toBe(true);
      expect(globalRegistry.has((extendedUserSchema.properties.address as any).properties.zipCode)).toBe(true);
      expect(globalRegistry.has(extendedUserSchema.properties.contacts)).toBe(true);

      // Check contents of metadata
      const addressMeta = globalRegistry.get(extendedUserSchema.properties.address);
      expect(addressMeta).toHaveProperty('description', 'User physical address');
      expect(addressMeta).toHaveProperty('examples');

      const zipMeta = globalRegistry.get((extendedUserSchema.properties.address as any).properties.zipCode);
      expect(zipMeta).toHaveProperty('description', 'Postal code');
      expect(zipMeta).toHaveProperty('format', 'zip');
    });

    it('should support multiple independent registries', () => {
      // Create multiple registries with different metadata types
      const apiRegistry = createRegistry<{ endpoint: string; method: string }>();
      const validationRegistry = createRegistry<{ rules: string[]; required: boolean }>();
      const uiRegistry = createRegistry<{ label: string; placeholder: string }>();

      // Add schemas to multiple registries
      apiRegistry.add(userSchema, { endpoint: '/users', method: 'GET' });
      validationRegistry.add(userSchema, { rules: ['no-empty'], required: true });
      uiRegistry.add(userSchema, { label: 'User Information', placeholder: 'Enter user details' });

      // Add different schemas to each registry
      const loginSchema = object({ username: string(), password: string() });
      apiRegistry.add(loginSchema, { endpoint: '/login', method: 'POST' });

      const productSchema = object({ id: number(), name: string(), price: number() });
      validationRegistry.add(productSchema, { rules: ['positive-price'], required: false });

      // Verify each registry has the correct schemas and metadata
      expect(apiRegistry.getAllSchemas().length).toBe(2);
      expect(validationRegistry.getAllSchemas().length).toBe(2);
      expect(uiRegistry.getAllSchemas().length).toBe(1);

      expect(apiRegistry.get(userSchema)).toEqual({ endpoint: '/users', method: 'GET' });
      expect(validationRegistry.get(userSchema)).toEqual({ rules: ['no-empty'], required: true });
      expect(uiRegistry.get(userSchema)).toEqual({ label: 'User Information', placeholder: 'Enter user details' });

      // Operations on one registry should not affect others
      apiRegistry.remove(userSchema);
      expect(apiRegistry.has(userSchema)).toBe(false);
      expect(validationRegistry.has(userSchema)).toBe(true);
      expect(uiRegistry.has(userSchema)).toBe(true);
    });

    it('should support a large number of schemas with fast lookup', () => {
      const largeRegistry = createRegistry<{ id: number }>();
      const schemas = [];

      // Create and register 1000 schemas
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const schema = object({
          id: number(),
          name: string(),
          value: number()
        });
        schemas.push(schema);
        largeRegistry.add(schema, { id: i });
      }
      const registerTime = Date.now() - start;

      // Verify all schemas were added
      expect(largeRegistry.getAllSchemas().length).toBe(1000);

      // Test lookup performance
      const lookupStart = Date.now();
      for (let i = 0; i < 1000; i++) {
        const schema = schemas[i];
        const metadata = largeRegistry.get(schema);
        expect(metadata).toEqual({ id: i });
      }
      const lookupTime = Date.now() - lookupStart;

      // Verify performance is reasonable (this is not a strict test, just a sanity check)
      expect(registerTime).toBeLessThan(1000); // Less than 1s to register 1000 schemas
      expect(lookupTime).toBeLessThan(1000);   // Less than 1s to lookup 1000 schemas
      console.log(`Performance: ${registerTime}ms to register 1000 schemas, ${lookupTime}ms to lookup 1000 schemas`);
    });
  });

  describe('Advanced metadata operations', () => {
    it('should support metadata inheritance', () => {
      // Setup a base schema with metadata
      const baseSchema = object({
        id: number(),
        createdAt: string()
      });

      setMetadata(baseSchema, {
        type: 'base',
        version: 1,
        description: 'Base schema'
      });

      // Create a derived schema
      const derivedSchema = object({
        ...baseSchema.properties,
        name: string(),
        extra: boolean()
      });

      // Inherit and extend metadata
      const baseMeta = globalRegistry.get(baseSchema) || {};
      setMetadata(derivedSchema, {
        ...baseMeta,
        type: 'derived',
        description: 'Derived schema',
        inheritsFrom: 'base'
      });

      // Verify inheritance worked
      const derivedMeta = globalRegistry.get(derivedSchema);
      expect(derivedMeta).toHaveProperty('version', 1); // Inherited
      expect(derivedMeta).toHaveProperty('type', 'derived'); // Overridden
      expect(derivedMeta).toHaveProperty('description', 'Derived schema'); // Overridden
      expect(derivedMeta).toHaveProperty('inheritsFrom', 'base'); // Added
    });

    it('should support finding schemas using custom predicates', () => {
      // Add schemas with various metadata
      setMetadata(stringSchema, { createdBy: 'user1', department: 'sales', version: 1 });
      setMetadata(numberSchema, { createdBy: 'user2', department: 'engineering', version: 2 });
      setMetadata(userSchema, { createdBy: 'user1', department: 'engineering', version: 3 });

      // Find schemas by custom predicates
      const userSchemas = globalRegistry.find((_, meta) => meta.createdBy === 'user1');
      expect(userSchemas.length).toBe(2);

      const engineeringSchemas = globalRegistry.find((_, meta) => meta.department === 'engineering');
      expect(engineeringSchemas.length).toBe(2);

      const recentSchemas = globalRegistry.find((_, meta) => {
        const version = meta.version;
        return typeof version === 'number' && version > 1;
      });
      expect(recentSchemas.length).toBe(2);

      // Find with multiple conditions
      const complexQuery = globalRegistry.find((_, meta) =>
        meta.createdBy === 'user1' && meta.department === 'engineering'
      );
      expect(complexQuery.length).toBe(1);
      expect(complexQuery[0][0]).toBe(userSchema);
    });

    it('should support complex transformations with map', () => {
      // Add schemas with consistent metadata structure
      setMetadata(stringSchema, {
        description: 'String type',
        validations: ['minLength', 'maxLength', 'pattern'],
        complexity: 'low'
      });

      setMetadata(numberSchema, {
        description: 'Number type',
        validations: ['min', 'max', 'integer'],
        complexity: 'medium'
      });

      setMetadata(userSchema, {
        description: 'User object',
        validations: ['required'],
        complexity: 'high'
      });

      // Apply complex transformations
      const validationDocs = globalRegistry.map((schema, meta) => ({
        type: schema._tag,
        description: meta.description,
        validationCount: Array.isArray(meta.validations) ? meta.validations.length : 0,
        isComplex: meta.complexity === 'high'
      }));

      expect(validationDocs.length).toBe(3);
      expect(validationDocs).toContainEqual({
        type: 'StringSchema',
        description: 'String type',
        validationCount: 3,
        isComplex: false
      });

      expect(validationDocs).toContainEqual({
        type: 'NumberSchema',
        description: 'Number type',
        validationCount: 3,
        isComplex: false
      });

      expect(validationDocs).toContainEqual({
        type: 'ObjectSchema',
        description: 'User object',
        validationCount: 1,
        isComplex: true
      });
    });
  });

  describe('Registry integration scenarios', () => {
    it('should support versioning schemas with metadata', () => {
      const v1Registry = createRegistry<{ version: number, deprecated?: boolean }>();
      const v2Registry = createRegistry<{ version: number, deprecated?: boolean }>();

      // Create v1 schema
      const userSchemaV1 = object({
        id: number(),
        name: string()
      });

      // Create v2 schema with more fields
      const userSchemaV2 = object({
        id: number(),
        name: string(),
        email: string(),
        createdAt: string()
      });

      // Register both versions
      v1Registry.add(userSchemaV1, { version: 1 });
      v2Registry.add(userSchemaV2, { version: 2 });

      // Later deprecate v1
      v1Registry.add(userSchemaV1, { version: 1, deprecated: true });

      // Get all active schemas
      const allSchemas = [...v1Registry.getAll(), ...v2Registry.getAll()];
      const activeSchemas = allSchemas.filter(([_, meta]) => !meta.deprecated);

      expect(activeSchemas.length).toBe(1);
      expect(activeSchemas[0][0]).toBe(userSchemaV2);
      expect(activeSchemas[0][1]).toEqual({ version: 2 });

      // Get highest version of a schema
      const schemas = allSchemas.sort((a, b) => b[1].version - a[1].version);
      const latestSchema = schemas[0];

      expect(latestSchema[0]).toBe(userSchemaV2);
      expect(latestSchema[1].version).toBe(2);
    });

    it('should support metadata for schema generation documentation', () => {
      // Define schemas with comprehensive metadata
      const productSchema = object({
        id: number(),
        name: string(),
        price: number(),
        category: string(),
        inStock: boolean()
      });

      // Add detailed metadata
      setMetadata(productSchema, {
        title: 'Product',
        description: 'A product in the catalog',
        examples: [
          { id: 1, name: 'Keyboard', price: 59.99, category: 'Electronics', inStock: true }
        ]
      });

      setMetadata(productSchema.properties.id, {
        description: 'Unique product identifier',
        examples: [1, 2, 3],
        required: true
      });

      setMetadata(productSchema.properties.name, {
        description: 'Name of the product',
        examples: ['Keyboard', 'Mouse', 'Monitor'],
        required: true,
        minLength: 3,
        maxLength: 100
      });

      setMetadata(productSchema.properties.price, {
        description: 'Price in USD',
        examples: [19.99, 59.99, 149.99],
        required: true,
        minimum: 0
      });

      // Generate documentation
      const docOutput = registryUtils.generateDocumentation(
        globalRegistry,
        (schema, metadata) => {
          const baseDoc = {
            name: schema._tag,
            description: metadata.description || '',
            required: metadata.required || false
          };

          if (schema._tag === 'StringSchema') {
            return {
              ...baseDoc,
              type: 'string',
              constraints: metadata.minLength ?
                `${metadata.minLength} to ${metadata.maxLength} characters` : undefined
            };
          } else if (schema._tag === 'NumberSchema') {
            return {
              ...baseDoc,
              type: 'number',
              constraints: metadata.minimum !== undefined ?
                `Minimum: ${metadata.minimum}` : undefined
            };
          } else {
            return {
              ...baseDoc,
              type: schema._tag
            };
          }
        }
      );

      // Verify documentation
      const nameDoc = docOutput.find(doc => doc.description === 'Name of the product');
      expect(nameDoc).toHaveProperty('type', 'string');
      expect(nameDoc).toHaveProperty('constraints', '3 to 100 characters');

      const priceDoc = docOutput.find(doc => doc.description === 'Price in USD');
      expect(priceDoc).toHaveProperty('type', 'number');
      expect(priceDoc).toHaveProperty('constraints', 'Minimum: 0');
    });

    it('should validate examples in multiple registries', () => {
      // Setup multiple registries with examples
      const stringRegistry = createRegistry<{ examples: any[]; description: string }>();
      const numberRegistry = createRegistry<{ examples: any[]; description: string }>();
      const objectRegistry = createRegistry<{ examples: any[]; description: string }>();

      // Add schemas with examples to each registry
      registerSchema(string().email(), stringRegistry, {
        description: 'Email type',
        examples: ['valid@example.com', 'user@domain.com']
      });

      registerSchema(string().url(), stringRegistry, {
        description: 'URL type',
        examples: ['https://example.com', 'not-a-url']  // One invalid example
      });

      registerSchema(number().positive(), numberRegistry, {
        description: 'Positive number',
        examples: [10, 20, 30]
      });

      registerSchema(object({ id: number(), name: string() }), objectRegistry, {
        description: 'Simple object',
        examples: [
          { id: 1, name: 'Test' },
          { id: 'a', name: 123 }  // Invalid example
        ]
      });

      // Validate examples in each registry
      const stringResults = registryUtils.effects.validateAllExamples(stringRegistry as any);
      const numberResults = registryUtils.effects.validateAllExamples(numberRegistry as any);
      const objectResults = registryUtils.effects.validateAllExamples(objectRegistry as any);

      // Verify results
      expect(stringResults.length).toBe(2);
      expect(stringResults[0].valid).toBe(true);  // Email examples are valid
      expect(stringResults[1].valid).toBe(false); // URL has an invalid example

      expect(numberResults.length).toBe(1);
      expect(numberResults[0].valid).toBe(true);  // All number examples are valid

      expect(objectResults.length).toBe(1);
      expect(objectResults[0].valid).toBe(false); // Object has an invalid example
    });
  });
});
