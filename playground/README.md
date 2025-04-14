# VEffect Validation Library Playground

This playground contains examples showcasing the various features of the VEffect validation library.

## Setup

To run the examples, you'll need to have Node.js and TypeScript installed.

```bash
# Install dependencies if you haven't already
npm install

# Build the library (REQUIRED before running examples)
npm run build
```

> **Important**: The playground examples import from the built library in the `dist` directory, so you must run `npm run build` before trying the examples.

## Running the Examples

The playground contains several example scripts demonstrating different aspects of the library:

1. **README Examples** - Examples that match those shown in the main README documentation

   ```bash
   npx ts-node playground/readme-examples.ts
   ```

2. **Basic Validation** - Demonstrates primitive schema types (string, number, boolean)

   ```bash
   npx ts-node playground/basic-validation.ts
   ```

3. **Objects and Tuples** - Shows object and tuple schema validation

   ```bash
   npx ts-node playground/objects-and-tuples.ts
   ```

4. **Unions and Advanced** - Demonstrates union schemas and advanced validation patterns

   ```bash
   npx ts-node playground/unions-and-advanced.ts
   ```

5. **Discriminated Union** - Examples of using discriminated unions

   ```bash
   npx ts-node playground/discriminated-union.ts
   ```

6. **Pattern Matching** - Examples of pattern-based schema selection

   ```bash
   npx ts-node playground/pattern-matching.ts
   ```

7. **Path Tracking** - Demonstrates error path tracking in validation errors

   ```bash
   npx ts-node playground/path-tracking.ts
   ```

8. **Simple Path Demo** - A simpler demonstration of path tracking

   ```bash
   npx ts-node playground/simple-path-demo.ts
   ```

9. **Practical API Validation** - Real-world API validation examples

   ```bash
   npx ts-node playground/practical-api-validation.ts
   ```

10. **Map and Set Examples** - Comprehensive examples of Map and Set validation features

    ```bash
    npx ts-node playground/map-set-examples.ts
    ```

11. **BigInt Examples** - Examples of BigInt validation and operations

    ```bash
    npx ts-node playground/bigint-examples.ts
    ```

12. **Async Validation Examples** - Demonstrates asynchronous validation with API calls and retries

    ```bash
    npx ts-node playground/async-validation-example.ts
    ```

13. **Type Inference Examples** - Showcases the type inference utilities for extracting TypeScript types from schemas

    ```bash
    npx ts-node playground/infer-example.ts
    ```

14. **Registry and Metadata Examples** - Demonstrates the registry system for attaching metadata to schemas

    ```bash
    npx ts-node playground/registry-example.ts
    ```

15. **Recursive Types Example** - Shows how to create type-safe recursive schemas using the interface schema

    ```bash
    npx ts-node playground/recursive-types-example.ts
    ```

16. **Lazy Recursive Example** - Comprehensive examples of lazy-evaluated recursive schemas with proper TypeScript typing

    ```bash
    npx ts-node playground/lazy-recursive-example.ts
    ```

17. **Interface Schema Example** - Demonstrates the interface schema with key optionality and proper handling of properties with question marks

    ```bash
    npx ts-node playground/interface-schema-example.ts
    ```

18. **Primitive Types Examples** - Showcases all primitive types with a focus on the newly added types (symbol, null, undefined, void, unknown, never)

    ```bash
    npx ts-node playground/primitive-types-examples.ts
    ```

19. **String Validation Examples** - Demonstrates the enhanced string validation functions

    ```bash
    npx ts-node playground/string-validations.ts
    ```

20. **String Validation Edge Cases** - Tests boundary conditions and edge cases for string validation

    ```bash
    npx ts-node playground/string-validation-edge-cases.ts
    ```

## Example Use Cases

Each example showcases real-world validation scenarios:

- User input validation
- Form data processing
- API data validation
- Complex data structures (trees, nested objects)
- Type transformations
- Password validation
- Discriminated unions

Feel free to modify these examples or create new ones to explore the library's capabilities.

## Documentation Examples

The `readme-examples.ts` file contains all the examples featured in the project's main README.md. This serves as a verification that all the examples in the documentation work as expected and match the actual behavior of the library. Running this file will demonstrate:

- Basic usage with object schemas
- Primitive type validation (string, number, boolean)
- Complex type validation (objects, arrays, tuples, records)
- Special types (literals, discriminated unions)
- Composition types (unions)
- Advanced features (refinement, transformations, optional/default values)

If you're new to the library, this is a great place to start as it follows the documentation examples directly.

## Library Features Demonstrated

- Primitive type validation (string, number, boolean)
- Object validation with nested properties
- Tuple validation with fixed-length arrays
- Array validation
- Union types
- Default values
- Nullable, optional, and nullish types
- Refinements (custom validation logic)
- Transformations
- Error handling and error messages
- Discriminated unions
- Pattern matching
- Path tracking
- Practical API validation scenarios
- Set and Map validation with:
  - Size constraints (minSize, maxSize, size, nonEmpty)
  - Content validation (has, subset, superset for Sets)
  - Key/value validation (hasKey, hasValue, entries for Maps)
  - Nested validation with complex data structures
  - Transformation of collections to other data types
- BigInt validation
- Intersection of multiple schemas
- Type inference utilities:
  - Extracting TypeScript types from schemas
  - Working with input and output types for transformed schemas
  - Generic schema function typings
  - Handling complex nested type definitions
- Registry and metadata system:
  - Attaching metadata to schemas for documentation
  - Creating custom registries with specific metadata types
  - Type-safe example data management
  - Generating API documentation from schema metadata
- Asynchronous validation:
  - Async refinements and transformations
  - Concurrent validation of multiple fields
  - Error handling in async contexts
  - Timeout handling and recovery
  - Retry mechanisms for transient failures
- Advanced validation patterns:
  - Conditional validation based on other fields
  - Recursive schema validation
  - Deeply nested object validation
  - Custom validation functions
- Interface schema features:
  - Key vs value optionality
  - True recursive types with lazy evaluation
  - Type-safe deep nesting
- All JavaScript primitive types:
  - Standard primitives (string, number, boolean, bigint, date)
  - Special primitives (symbol, null, undefined, void)
  - Type-safety primitives (any, unknown, never)
- Enhanced string validations:
  - Network validation (CIDR notation for IPv4 and IPv6)
  - Base64 validation (standard and URL-safe with padding options)
  - Date and time validation (ISO 8601 dates, times with precision, durations)
  - Special formats (emoji, nanoid)
  - Rich datetime validation (UTC, with offset, local formats, and precision controls)
