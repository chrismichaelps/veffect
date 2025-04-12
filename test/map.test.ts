import { map, string, number, set } from '../src';
import { testSchema, expectSuccess, expectError } from './utils';

describe('Map Schema', () => {
  describe('basic validation', () => {
    const schema = map(string(), number());
    const validator = schema.toValidator();

    test('validates a valid map of string to number', () => {
      const validMap = new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);
      const result = validator.safeParse(validMap);
      expectSuccess(result, validMap);
    });

    test('validates an empty map', () => {
      const result = validator.safeParse(new Map());
      expectSuccess(result, new Map());
    });

    test('rejects non-map values', () => {
      const result = validator.safeParse({ a: 1, b: 2 });
      expectError(result, 'TypeValidationError', 'Value must be a Map');
    });

    test('rejects map with invalid keys', () => {
      // Using any to bypass type checking since we're intentionally testing an invalid map
      const invalidMap = new Map([
        ['a', 1],
        [123 as any, 2] // Invalid key (not a string)
      ]);
      const result = validator.safeParse(invalidMap);
      expectError(result, 'TypeValidationError', 'Value must be a string');
    });

    test('rejects map with invalid values', () => {
      // Using any to bypass type checking since we're intentionally testing an invalid map
      const invalidMap = new Map([
        ['a', 1],
        ['b', 'two' as any] // Invalid value (not a number)
      ]);
      const result = validator.safeParse(invalidMap);
      expectError(result, 'TypeValidationError', 'Value must be a number');
    });
  });

  describe('size constraints', () => {
    testSchema(
      'minSize',
      map(string(), number()).minSize(2),
      [
        {
          input: new Map([
            ['a', 1],
            ['b', 2]
          ])
        },
        {
          input: new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3]
          ])
        }
      ],
      [
        {
          input: new Map(),
          errorTag: 'MapValidationError',
          errorMessage: 'Map must contain at least 2 entries'
        },
        {
          input: new Map([['a', 1]]),
          errorTag: 'MapValidationError',
          errorMessage: 'Map must contain at least 2 entries'
        }
      ]
    );

    testSchema(
      'maxSize',
      map(string(), number()).maxSize(2),
      [
        { input: new Map() },
        { input: new Map([['a', 1]]) },
        {
          input: new Map([
            ['a', 1],
            ['b', 2]
          ])
        }
      ],
      [
        {
          input: new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3]
          ]),
          errorTag: 'MapValidationError',
          errorMessage: 'Map must contain at most 2 entries'
        }
      ]
    );

    testSchema(
      'size',
      map(string(), number()).size(2),
      [
        {
          input: new Map([
            ['a', 1],
            ['b', 2]
          ])
        }
      ],
      [
        {
          input: new Map(),
          errorTag: 'MapValidationError',
          errorMessage: 'Map must contain exactly 2 entries'
        },
        {
          input: new Map([['a', 1]]),
          errorTag: 'MapValidationError',
          errorMessage: 'Map must contain exactly 2 entries'
        },
        {
          input: new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3]
          ]),
          errorTag: 'MapValidationError',
          errorMessage: 'Map must contain exactly 2 entries'
        }
      ]
    );

    testSchema(
      'nonEmpty',
      map(string(), number()).nonEmpty(),
      [
        { input: new Map([['a', 1]]) },
        {
          input: new Map([
            ['a', 1],
            ['b', 2]
          ])
        }
      ],
      [
        {
          input: new Map(),
          errorTag: 'MapValidationError',
          errorMessage: 'Map must not be empty'
        }
      ]
    );
  });

  describe('map operations', () => {
    test('validates map with specific key', () => {
      const schema = map(string(), number());
      const hasKeySchema = schema.hasKey('b');
      const validator = hasKeySchema.toValidator();

      const validMap = new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);
      const result1 = validator.safeParse(validMap);
      expectSuccess(result1);

      const invalidMap = new Map([
        ['a', 1],
        ['c', 3]
      ]);
      const result2 = validator.safeParse(invalidMap);
      expectError(result2, 'MapValidationError', 'Map must contain the specified key');
    });

    test('validates map with specific value', () => {
      const schema = map(string(), number());
      const hasValueSchema = schema.hasValue(2);
      const validator = hasValueSchema.toValidator();

      const validMap = new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);
      const result1 = validator.safeParse(validMap);
      expectSuccess(result1);

      const invalidMap = new Map([
        ['a', 1],
        ['c', 3]
      ]);
      const result2 = validator.safeParse(invalidMap);
      if (!result2.success && result2.error) {
        console.log('Map value validation error:', result2.error);
      }
      expectError(result2, 'MapValidationError', 'Map must contain the specified value');
    });

    test('validates map with specific entries', () => {
      const schema = map(string(), number());
      const entriesSchema = schema.entries([
        ['a', 1],
        ['b', 2]
      ]);
      const validator = entriesSchema.toValidator();

      const validMap = new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);
      const result1 = validator.safeParse(validMap);
      expectSuccess(result1);

      const invalidMap = new Map([
        ['a', 1],
        ['b', 3], // Different value
        ['c', 3]
      ]);
      const result2 = validator.safeParse(invalidMap);
      if (!result2.success && result2.error) {
        console.log('Map entries validation error:', result2.error);
      }
      expectError(result2, 'MapValidationError', 'Map must contain all specified entries');
    });
  });

  describe('nested validation', () => {
    test('validates map with constrained values', () => {
      const schema = map(string(), number().positive());
      const validator = schema.toValidator();

      const validMap = new Map([
        ['a', 1],
        ['b', 2]
      ]);
      const result1 = validator.safeParse(validMap);
      expectSuccess(result1);

      const invalidMap = new Map([
        ['a', 1],
        ['b', -2]
      ]);
      const result2 = validator.safeParse(invalidMap);
      expectError(result2, 'NumberValidationError', 'Number must be positive');
    });

    test('validates map of complex values', () => {
      const schema = map(string(), set(string()));
      const validator = schema.toValidator();

      const validMap = new Map([
        ['users', new Set(['alice', 'bob'])],
        ['admins', new Set(['carol'])]
      ]);
      const result1 = validator.safeParse(validMap);
      expectSuccess(result1);

      // Using any to bypass type checking since we're intentionally testing invalid data
      const invalidMap = new Map([
        ['users', new Set(['alice', 'bob'])],
        ['admins', new Set([1, 2] as any)] // Invalid set elements
      ]);
      const result2 = validator.safeParse(invalidMap);
      expectError(result2, 'TypeValidationError', 'Value must be a string');
    });
  });

  describe('refinements and transformations', () => {
    test('refines map with custom validation', () => {
      const schema = map(string(), number()).refine(
        (m) => [...m.values()].every(v => v > 0),
        'Map values must all be positive'
      );
      const validator = schema.toValidator();

      const validMap = new Map([
        ['a', 1],
        ['b', 2]
      ]);
      const result1 = validator.safeParse(validMap);
      expectSuccess(result1);

      const invalidMap = new Map([
        ['a', 1],
        ['b', -2]
      ]);
      const result2 = validator.safeParse(invalidMap);
      expectError(result2, 'RefinementValidationError', 'Map values must all be positive');
    });

    test('transforms map', () => {
      const schema = map(string(), number()).transform(m => {
        return [...m.values()].reduce((sum, n) => sum + n, 0);
      });
      const validator = schema.toValidator();

      const inputMap = new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);
      const result = validator.safeParse(inputMap);
      expectSuccess(result, 6);
    });

    test('transforms map to object', () => {
      const schema = map(string(), number()).transform(m => {
        const obj: Record<string, number> = {};
        m.forEach((v, k) => {
          obj[k] = v;
        });
        return obj;
      });
      const validator = schema.toValidator();

      const inputMap = new Map([
        ['a', 1],
        ['b', 2]
      ]);
      const result = validator.safeParse(inputMap);
      expectSuccess(result, { a: 1, b: 2 });
    });
  });

  describe('optional, nullable, and default', () => {
    test('handles optional maps', () => {
      const schema = map(string(), number()).optional();
      const validator = schema.toValidator();

      const validMap = new Map([['a', 1]]);
      const result1 = validator.safeParse(validMap);
      expectSuccess(result1);

      const result2 = validator.safeParse(undefined);
      expectSuccess(result2, undefined);

      const result3 = validator.safeParse(null);
      expectError(result3, 'TypeValidationError');
    });

    test('handles nullable maps', () => {
      const schema = map(string(), number()).nullable();
      const validator = schema.toValidator();

      const validMap = new Map([['a', 1]]);
      const result1 = validator.safeParse(validMap);
      expectSuccess(result1);

      const result2 = validator.safeParse(null);
      expectSuccess(result2, null);

      const result3 = validator.safeParse(undefined);
      expectError(result3, 'TypeValidationError');
    });

    test('handles nullish maps', () => {
      const schema = map(string(), number()).nullish();
      const validator = schema.toValidator();

      const validMap = new Map([['a', 1]]);
      const result1 = validator.safeParse(validMap);
      expectSuccess(result1);

      const result2 = validator.safeParse(null);
      expectSuccess(result2, null);

      const result3 = validator.safeParse(undefined);
      expectSuccess(result3, undefined);
    });

    test('applies default values', () => {
      const defaultMap = new Map([['default', 0]]);
      const schema = map(string(), number()).default(defaultMap);
      const validator = schema.toValidator();

      const validMap = new Map([['a', 1]]);
      const result1 = validator.safeParse(validMap);
      expectSuccess(result1);

      const result2 = validator.safeParse(undefined);
      expectSuccess(result2, defaultMap);
    });
  });
});
