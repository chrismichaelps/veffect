/**
 * Tests for the type inference utilities
 */
import { string, number, boolean, object, array } from '../src/schema';
import { Infer, Input, Output, SchemaType } from '../src/infer';

describe('Infer type utilities', () => {
  // Define test schemas
  const StringSchema = string();
  const NumberSchema = number();
  const BooleanSchema = boolean();
  const ArraySchema = array(string());

  const UserSchema = object({
    id: number().integer(),
    name: string().minLength(2),
    email: string().email(),
    isActive: boolean(),
    tags: array(string())
  });

  const TransformedSchema = string().transform(val => parseInt(val, 10));

  // Helper to check type compatibility at compile time
  const expectType = <T, U extends T = T>(value: U) => {
    return value;
  };

  it('should correctly infer primitive schema types', () => {
    // These tests check the type inference at compile time
    type StringType = Infer<typeof StringSchema>;
    type NumberType = Infer<typeof NumberSchema>;
    type BooleanType = Infer<typeof BooleanSchema>;

    // Runtime tests to verify the inferred types work with actual values
    const strValue = expectType<StringType>('test');
    const numValue = expectType<NumberType>(123);
    const boolValue = expectType<BooleanType>(true);

    expect(strValue).toBe('test');
    expect(numValue).toBe(123);
    expect(boolValue).toBe(true);
  });

  it('should correctly infer array schema types', () => {
    type StringArrayType = Infer<typeof ArraySchema>;

    const arrayValue = expectType<StringArrayType>(['a', 'b', 'c']);
    expect(arrayValue).toEqual(['a', 'b', 'c']);
  });

  it('should correctly infer object schema types', () => {
    type UserType = Infer<typeof UserSchema>;

    const userData = expectType<UserType>({
      id: 1,
      name: 'John',
      email: 'john@example.com',
      isActive: true,
      tags: ['user', 'admin']
    });

    expect(userData.id).toBe(1);
    expect(userData.name).toBe('John');

    // Validate with schema to ensure compatibility
    const parseResult = UserSchema.toValidator().safeParse(userData);
    expect(parseResult.success).toBe(true);
  });

  it('should correctly handle Input and Output types for transformed schemas', () => {
    type InputType = Input<typeof TransformedSchema>;
    type OutputType = Output<typeof TransformedSchema>;

    const inputValue = expectType<InputType>('123');
    // At runtime, this would be a number after transformation
    const outputValue = expectType<OutputType>(123);

    expect(inputValue).toBe('123');
    expect(outputValue).toBe(123);

    // Validate the transformation works
    const parseResult = TransformedSchema.toValidator().parse('123');
    expect(parseResult).toBe(123);
  });

  it('should support generic schema functions', () => {
    // Define a generic function that works with any schema
    function processSchema<T extends SchemaType>(
      schema: T,
      data: unknown
    ): Infer<T> {
      return schema.toValidator().parse(data) as Infer<T>;
    }

    const result = processSchema(NumberSchema, 42);
    expect(result).toBe(42);

    const userResult = processSchema(UserSchema, {
      id: 2,
      name: 'Alice',
      email: 'alice@example.com',
      isActive: true,
      tags: ['user']
    });

    expect(userResult.name).toBe('Alice');
  });

  it('should correctly infer nested object types', () => {
    const NestedSchema = object({
      user: UserSchema,
      settings: object({
        theme: string(),
        notifications: boolean()
      })
    });

    type NestedType = Infer<typeof NestedSchema>;

    const nestedData = expectType<NestedType>({
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
    });

    expect(nestedData.user.name).toBe('Bob');
    expect(nestedData.settings.theme).toBe('dark');
  });
});
