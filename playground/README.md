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
