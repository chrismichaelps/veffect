import { bigint } from '../src/schema/bigint';
import { testSchema, expectSuccess, expectError } from './utils';

describe('BigInt Schema', () => {
  describe('basic validation', () => {
    const schema = bigint();
    const validator = schema.toValidator();

    test('validates bigint values', () => {
      expect(validator.safeParse(BigInt(123)).success).toBe(true);
      expect(validator.safeParse(BigInt(0)).success).toBe(true);
      expect(validator.safeParse(BigInt(-123)).success).toBe(true);
    });

    test('rejects non-bigint values', () => {
      expect(validator.safeParse(123).success).toBe(false);
      expect(validator.safeParse('123').success).toBe(false);
      expect(validator.safeParse(true).success).toBe(false);
      expect(validator.safeParse(null).success).toBe(false);
      expect(validator.safeParse(undefined).success).toBe(false);
    });

    test('returns correct error for non-bigint values', () => {
      const result = validator.safeParse(123);
      expectError(result, 'TypeValidationError', 'Value must be a BigInt');
    });
  });

  describe('min validation', () => {
    testSchema(
      'min',
      bigint().min(BigInt(5)),
      [
        { input: BigInt(5) },
        { input: BigInt(10) }
      ],
      [
        {
          input: BigInt(4),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be at least 5'
        }
      ]
    );
  });

  describe('max validation', () => {
    testSchema(
      'max',
      bigint().max(BigInt(5)),
      [
        { input: BigInt(5) },
        { input: BigInt(0) },
        { input: BigInt(-10) }
      ],
      [
        {
          input: BigInt(6),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be at most 5'
        }
      ]
    );
  });

  describe('positive validation', () => {
    testSchema(
      'positive',
      bigint().positive(),
      [
        { input: BigInt(1) },
        { input: BigInt(10000) }
      ],
      [
        {
          input: BigInt(0),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be positive'
        },
        {
          input: BigInt(-1),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be positive'
        }
      ]
    );
  });

  describe('negative validation', () => {
    testSchema(
      'negative',
      bigint().negative(),
      [
        { input: BigInt(-1) },
        { input: BigInt(-10000) }
      ],
      [
        {
          input: BigInt(0),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be negative'
        },
        {
          input: BigInt(1),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be negative'
        }
      ]
    );
  });

  describe('nonPositive validation', () => {
    testSchema(
      'nonPositive',
      bigint().nonPositive(),
      [
        { input: BigInt(0) },
        { input: BigInt(-1) },
        { input: BigInt(-10000) }
      ],
      [
        {
          input: BigInt(1),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be non-positive'
        }
      ]
    );
  });

  describe('nonNegative validation', () => {
    testSchema(
      'nonNegative',
      bigint().nonNegative(),
      [
        { input: BigInt(0) },
        { input: BigInt(1) },
        { input: BigInt(10000) }
      ],
      [
        {
          input: BigInt(-1),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be non-negative'
        }
      ]
    );
  });

  describe('multipleOf validation', () => {
    testSchema(
      'multipleOf',
      bigint().multipleOf(BigInt(3)),
      [
        { input: BigInt(0) },
        { input: BigInt(3) },
        { input: BigInt(6) },
        { input: BigInt(-3) }
      ],
      [
        {
          input: BigInt(1),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be a multiple of 3'
        },
        {
          input: BigInt(4),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be a multiple of 3'
        }
      ]
    );
  });

  describe('between validation', () => {
    testSchema(
      'between',
      bigint().between(BigInt(5), BigInt(10)),
      [
        { input: BigInt(5) },
        { input: BigInt(7) },
        { input: BigInt(10) }
      ],
      [
        {
          input: BigInt(4),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be between 5 and 10'
        },
        {
          input: BigInt(11),
          errorTag: 'BigIntValidationError',
          errorMessage: 'BigInt must be between 5 and 10'
        }
      ]
    );
  });

  describe('fromString conversion', () => {
    const schema = bigint().fromString();
    const validator = schema.toValidator();

    test('converts valid string to bigint', () => {
      const result = validator.safeParse('123');
      expectSuccess(result, BigInt(123));
    });

    test('rejects invalid string', () => {
      const result = validator.safeParse('not a number');
      expectError(result, 'BigIntValidationError', 'Could not convert string');
    });

    test('rejects non-string values', () => {
      const result = validator.safeParse(123);
      expectError(result, 'TypeValidationError', 'Expected a string');
    });
  });

  describe('refinements', () => {
    testSchema(
      'refine',
      bigint().refine(n => n % BigInt(2) === BigInt(0), 'BigInt must be even'),
      [
        { input: BigInt(0) },
        { input: BigInt(2) },
        { input: BigInt(-4) }
      ],
      [
        {
          input: BigInt(1),
          errorTag: 'RefinementValidationError',
          errorMessage: 'BigInt must be even'
        },
        {
          input: BigInt(-3),
          errorTag: 'RefinementValidationError',
          errorMessage: 'BigInt must be even'
        }
      ]
    );
  });

  describe('transformations', () => {
    test('transforms bigint to string', () => {
      const schema = bigint().transform(n => n.toString());
      const validator = schema.toValidator();

      const result = validator.safeParse(BigInt(123));
      expectSuccess(result, '123');
    });

    test('transforms bigint to number', () => {
      const schema = bigint().transform(n => Number(n));
      const validator = schema.toValidator();

      const result = validator.safeParse(BigInt(123));
      expectSuccess(result, 123);
    });
  });

  describe('default values', () => {
    test('applies default value when input is undefined', () => {
      const schema = bigint().default(BigInt(42));
      const validator = schema.toValidator();

      const result1 = validator.safeParse(BigInt(123));
      expectSuccess(result1, BigInt(123));

      const result2 = validator.safeParse(undefined);
      expectSuccess(result2, BigInt(42));
    });

    test('supports default value as function', () => {
      const schema = bigint().default(() => BigInt(42));
      const validator = schema.toValidator();

      const result = validator.safeParse(undefined);
      expectSuccess(result, BigInt(42));
    });
  });

  describe('nullable', () => {
    test('accepts null values', () => {
      const schema = bigint().nullable();
      const validator = schema.toValidator();

      const result1 = validator.safeParse(BigInt(123));
      expectSuccess(result1, BigInt(123));

      const result2 = validator.safeParse(null);
      expectSuccess(result2, null);

      const result3 = validator.safeParse(undefined);
      expectError(result3, 'TypeValidationError');
    });
  });

  describe('optional', () => {
    test('accepts undefined values', () => {
      const schema = bigint().optional();
      const validator = schema.toValidator();

      const result1 = validator.safeParse(BigInt(123));
      expectSuccess(result1, BigInt(123));

      const result2 = validator.safeParse(undefined);
      expectSuccess(result2, undefined);

      const result3 = validator.safeParse(null);
      expectError(result3, 'TypeValidationError');
    });
  });

  describe('nullish', () => {
    test('accepts null and undefined values', () => {
      const schema = bigint().nullish();
      const validator = schema.toValidator();

      const result1 = validator.safeParse(BigInt(123));
      expectSuccess(result1, BigInt(123));

      const result2 = validator.safeParse(null);
      expectSuccess(result2, null);

      const result3 = validator.safeParse(undefined);
      expectSuccess(result3, undefined);

      const result4 = validator.safeParse('123');
      expectError(result4, 'TypeValidationError');
    });
  });

  describe('custom error message', () => {
    test('uses custom error message', () => {
      const schema = bigint().error('Custom error message');
      const validator = schema.toValidator();

      const result = validator.safeParse(123);
      expectError(result, 'TypeValidationError', 'Custom error message');
    });
  });

  describe('combined validations', () => {
    test('combines multiple validations', () => {
      const schema = bigint()
        .min(BigInt(0))
        .max(BigInt(100))
        .multipleOf(BigInt(2));
      const validator = schema.toValidator();

      expect(validator.safeParse(BigInt(50)).success).toBe(true);
      expect(validator.safeParse(BigInt(0)).success).toBe(true);
      expect(validator.safeParse(BigInt(100)).success).toBe(true);
      expect(validator.safeParse(BigInt(98)).success).toBe(true);

      expect(validator.safeParse(BigInt(-2)).success).toBe(false);
      expect(validator.safeParse(BigInt(102)).success).toBe(false);
      expect(validator.safeParse(BigInt(51)).success).toBe(false);
    });
  });
});
