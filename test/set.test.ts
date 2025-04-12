import { set, string, number } from '../src';
import { testSchema, expectSuccess, expectError } from './utils';

describe('Set Schema', () => {
  describe('basic validation', () => {
    const schema = set(string());
    const validator = schema.toValidator();

    test('validates a valid set of strings', () => {
      const result = validator.safeParse(new Set(['a', 'b', 'c']));
      expectSuccess(result, new Set(['a', 'b', 'c']));
    });

    test('validates an empty set', () => {
      const result = validator.safeParse(new Set([]));
      expectSuccess(result, new Set([]));
    });

    test('rejects non-set values', () => {
      const result = validator.safeParse(['a', 'b', 'c']);
      expectError(result, 'TypeValidationError', 'Value must be a Set');
    });

    test('rejects set with invalid elements', () => {
      const result = validator.safeParse(new Set(['a', 'b', 123]));
      expectError(result, 'TypeValidationError', 'Value must be a string');
    });
  });

  describe('size constraints', () => {
    testSchema(
      'minSize',
      set(string()).minSize(2),
      [
        { input: new Set(['a', 'b']) },
        { input: new Set(['a', 'b', 'c']) }
      ],
      [
        {
          input: new Set([]),
          errorTag: 'SetValidationError',
          errorMessage: 'Set must contain at least 2 elements'
        },
        {
          input: new Set(['a']),
          errorTag: 'SetValidationError',
          errorMessage: 'Set must contain at least 2 elements'
        }
      ]
    );

    testSchema(
      'maxSize',
      set(string()).maxSize(2),
      [
        { input: new Set([]) },
        { input: new Set(['a']) },
        { input: new Set(['a', 'b']) }
      ],
      [
        {
          input: new Set(['a', 'b', 'c']),
          errorTag: 'SetValidationError',
          errorMessage: 'Set must contain at most 2 elements'
        }
      ]
    );

    testSchema(
      'size',
      set(string()).size(2),
      [
        { input: new Set(['a', 'b']) }
      ],
      [
        {
          input: new Set([]),
          errorTag: 'SetValidationError',
          errorMessage: 'Set must contain exactly 2 elements'
        },
        {
          input: new Set(['a']),
          errorTag: 'SetValidationError',
          errorMessage: 'Set must contain exactly 2 elements'
        },
        {
          input: new Set(['a', 'b', 'c']),
          errorTag: 'SetValidationError',
          errorMessage: 'Set must contain exactly 2 elements'
        }
      ]
    );

    testSchema(
      'nonEmpty',
      set(string()).nonEmpty(),
      [
        { input: new Set(['a']) },
        { input: new Set(['a', 'b']) }
      ],
      [
        {
          input: new Set([]),
          errorTag: 'SetValidationError',
          errorMessage: 'Set must not be empty'
        }
      ]
    );
  });

  describe('set operations', () => {
    test('validates set with specific value', () => {
      const schema = set(string());
      const hasValueSchema = schema.has('b');
      const validator = hasValueSchema.toValidator();

      const result1 = validator.safeParse(new Set(['a', 'b', 'c']));
      expectSuccess(result1);

      const result2 = validator.safeParse(new Set(['a', 'c']));
      expectError(result2, 'SetValidationError', 'Set must contain the specified value');
    });

    test('validates subset', () => {
      const schema = set(string());
      const superSet = new Set(['a', 'b', 'c', 'd']);
      const subsetSchema = schema.subset(superSet);
      const validator = subsetSchema.toValidator();

      const result1 = validator.safeParse(new Set(['a', 'b']));
      expectSuccess(result1);

      const result2 = validator.safeParse(new Set(['a', 'e']));
      expectError(result2, 'SetValidationError', 'Set must be a subset of the specified set');
    });

    test('validates superset', () => {
      const schema = set(string());
      const subSet = new Set(['a', 'b']);
      const supersetSchema = schema.superset(subSet);
      const validator = supersetSchema.toValidator();

      const result1 = validator.safeParse(new Set(['a', 'b', 'c']));
      expectSuccess(result1);

      const result2 = validator.safeParse(new Set(['a', 'c']));
      expectError(result2, 'SetValidationError', 'Set must be a superset of the specified set');
    });
  });

  describe('nested validation', () => {
    test('validates set of numbers with constraints', () => {
      const schema = set(number().positive());
      const validator = schema.toValidator();

      const result1 = validator.safeParse(new Set([1, 2, 3]));
      expectSuccess(result1);

      const result2 = validator.safeParse(new Set([1, -2, 3]));
      expectError(result2, 'NumberValidationError', 'Number must be positive');
    });

    test('validates set of sets', () => {
      const schema = set(set(string()));
      const validator = schema.toValidator();

      const result1 = validator.safeParse(new Set([
        new Set(['a', 'b']),
        new Set(['c', 'd'])
      ]));
      expectSuccess(result1);

      const result2 = validator.safeParse(new Set([
        new Set(['a', 'b']),
        new Set([1, 2])
      ]));
      expectError(result2, 'TypeValidationError', 'Value must be a string');
    });
  });

  describe('refinements and transformations', () => {
    test('refines set with custom validation', () => {
      const schema = set(number()).refine(
        (s) => [...s].every(n => n % 2 === 0),
        'Set must contain only even numbers'
      );
      const validator = schema.toValidator();

      const result1 = validator.safeParse(new Set([2, 4, 6]));
      expectSuccess(result1);

      const result2 = validator.safeParse(new Set([2, 3, 4]));
      expectError(result2, 'RefinementValidationError', 'Set must contain only even numbers');
    });

    test('transforms set', () => {
      const schema = set(number()).transform(s => [...s].reduce((sum, n) => sum + n, 0));
      const validator = schema.toValidator();

      const result = validator.safeParse(new Set([1, 2, 3]));
      expectSuccess(result, 6);
    });
  });

  describe('optional, nullable, and default', () => {
    test('handles optional sets', () => {
      const schema = set(string()).optional();
      const validator = schema.toValidator();

      const result1 = validator.safeParse(new Set(['a', 'b']));
      expectSuccess(result1);

      const result2 = validator.safeParse(undefined);
      expectSuccess(result2, undefined);

      const result3 = validator.safeParse(null);
      expectError(result3, 'TypeValidationError');
    });

    test('handles nullable sets', () => {
      const schema = set(string()).nullable();
      const validator = schema.toValidator();

      const result1 = validator.safeParse(new Set(['a', 'b']));
      expectSuccess(result1);

      const result2 = validator.safeParse(null);
      expectSuccess(result2, null);

      const result3 = validator.safeParse(undefined);
      expectError(result3, 'TypeValidationError');
    });

    test('handles nullish sets', () => {
      const schema = set(string()).nullish();
      const validator = schema.toValidator();

      const result1 = validator.safeParse(new Set(['a', 'b']));
      expectSuccess(result1);

      const result2 = validator.safeParse(null);
      expectSuccess(result2, null);

      const result3 = validator.safeParse(undefined);
      expectSuccess(result3, undefined);
    });

    test('applies default values', () => {
      const defaultSet = new Set(['default']);
      const schema = set(string()).default(defaultSet);
      const validator = schema.toValidator();

      const result1 = validator.safeParse(new Set(['a', 'b']));
      expectSuccess(result1);

      const result2 = validator.safeParse(undefined);
      expectSuccess(result2, defaultSet);
    });
  });
});
