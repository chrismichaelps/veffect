import { ValidationError } from '../src/types';

/**
 * Expect a validation to succeed with the given value
 */
export function expectSuccess<T>(result: { success: boolean; data?: T; error?: ValidationError }, expected?: T) {
  expect(result.success).toBe(true);
  expect(result.error).toBeUndefined();
  if (expected !== undefined) {
    expect(result.data).toEqual(expected);
  }
}

/**
 * Expect a validation to fail with an error of a specific type
 */
export function expectError(
  result: { success: boolean; data?: any; error?: ValidationError },
  errorTag?: string,
  errorMessage?: string
) {
  expect(result.success).toBe(false);
  expect(result.data).toBeUndefined();
  expect(result.error).toBeDefined();

  if (errorTag) {
    expect(result.error?._tag).toBe(errorTag);
  }

  if (errorMessage) {
    expect(result.error?.message).toContain(errorMessage);
  }
}

/**
 * Create a test case for schema validation
 */
export function testSchema<T>(
  name: string,
  schema: { toValidator: () => { safeParse: (input: any) => { success: boolean; data?: T; error?: ValidationError } } },
  validCases: Array<{ input: any; expected?: T }>,
  invalidCases: Array<{ input: any; errorTag?: string; errorMessage?: string }>
) {
  describe(name, () => {
    describe('valid cases', () => {
      validCases.forEach(({ input, expected }) => {
        test(`validates ${JSON.stringify(input)}`, () => {
          const validator = schema.toValidator();
          const result = validator.safeParse(input);
          expectSuccess(result, expected !== undefined ? expected : input);
        });
      });
    });

    describe('invalid cases', () => {
      invalidCases.forEach(({ input, errorTag, errorMessage }) => {
        test(`rejects ${JSON.stringify(input)}`, () => {
          const validator = schema.toValidator();
          const result = validator.safeParse(input);
          expectError(result, errorTag, errorMessage);
        });
      });
    });
  });
} 