import { string } from '../src/schema/string';
import { testSchema, expectSuccess, expectError } from './utils';

describe('StringSchema', () => {
  // Basic string validation
  testSchema(
    'basic string schema',
    string(),
    [
      { input: 'hello' },
      { input: '' },
      { input: '123' },
      { input: 'special chars: !@#$%^&*()' }
    ],
    [
      { input: 123, errorTag: 'TypeValidationError', errorMessage: 'Value must be a string' },
      { input: true, errorTag: 'TypeValidationError', errorMessage: 'Value must be a string' },
      { input: {}, errorTag: 'TypeValidationError', errorMessage: 'Value must be a string' },
      { input: [], errorTag: 'TypeValidationError', errorMessage: 'Value must be a string' },
      { input: null, errorTag: 'TypeValidationError', errorMessage: 'Value must be a string' },
      { input: undefined, errorTag: 'TypeValidationError', errorMessage: 'Value must be a string' }
    ]
  );

  // minLength
  testSchema(
    'string.minLength()',
    string().minLength(3),
    [
      { input: 'hello' },
      { input: '123' },
      { input: 'abcdefghijklmnopqrstuvwxyz' }
    ],
    [
      { input: '', errorTag: 'StringValidationError', errorMessage: 'String must be at least 3 characters' },
      { input: 'a', errorTag: 'StringValidationError', errorMessage: 'String must be at least 3 characters' },
      { input: 'ab', errorTag: 'StringValidationError', errorMessage: 'String must be at least 3 characters' }
    ]
  );

  // maxLength
  testSchema(
    'string.maxLength()',
    string().maxLength(5),
    [
      { input: 'hello' },
      { input: '123' },
      { input: 'a' },
      { input: '' }
    ],
    [
      { input: 'abcdef', errorTag: 'StringValidationError', errorMessage: 'String must be at most 5 characters' },
      { input: 'abcdefghijklmnopqrstuvwxyz', errorTag: 'StringValidationError', errorMessage: 'String must be at most 5 characters' }
    ]
  );

  // length
  testSchema(
    'string.length()',
    string().length(5),
    [
      { input: 'hello' },
      { input: '12345' }
    ],
    [
      { input: 'abc', errorTag: 'StringValidationError', errorMessage: 'String must be exactly 5 characters' },
      { input: 'abcdef', errorTag: 'StringValidationError', errorMessage: 'String must be exactly 5 characters' },
      { input: '', errorTag: 'StringValidationError', errorMessage: 'String must be exactly 5 characters' }
    ]
  );

  // regex
  testSchema(
    'string.regex()',
    string().regex(/^[a-z]+$/),
    [
      { input: 'hello' },
      { input: 'abcdef' }
    ],
    [
      { input: 'Hello', errorTag: 'StringValidationError', errorMessage: 'String does not match pattern' },
      { input: '123', errorTag: 'StringValidationError', errorMessage: 'String does not match pattern' },
      { input: 'hello123', errorTag: 'StringValidationError', errorMessage: 'String does not match pattern' }
    ]
  );

  // email
  testSchema(
    'string.email()',
    string().email(),
    [
      { input: 'test@example.com' },
      { input: 'user.name@subdomain.example.co.uk' },
      { input: 'a@b.c' }
    ],
    [
      { input: 'notanemail', errorTag: 'StringValidationError', errorMessage: 'Invalid email address' },
      { input: 'missing@tld', errorTag: 'StringValidationError', errorMessage: 'Invalid email address' },
      { input: '@missinguser.com', errorTag: 'StringValidationError', errorMessage: 'Invalid email address' },
      { input: 'missingat.com', errorTag: 'StringValidationError', errorMessage: 'Invalid email address' }
    ]
  );

  // url
  testSchema(
    'string.url()',
    string().url(),
    [
      { input: 'http://example.com' },
      { input: 'https://subdomain.example.co.uk/path?query=string#hash' },
      { input: 'https://www.example.com' }
    ],
    [
      { input: 'notaurl', errorTag: 'StringValidationError', errorMessage: 'Invalid URL' },
      { input: 'ftp://example.com', errorTag: 'StringValidationError', errorMessage: 'Invalid URL' },
      { input: 'http:/example.com', errorTag: 'StringValidationError', errorMessage: 'Invalid URL' }
    ]
  );

  // trim, toLowerCase, toUpperCase
  describe('string transformations', () => {
    test('trim() removes whitespace', () => {
      const schema = string().trim();
      const validator = schema.toValidator();

      const result = validator.safeParse('  hello  ');
      expectSuccess(result, 'hello');
    });

    test('toLowerCase() converts to lowercase', () => {
      const schema = string().toLowerCase();
      const validator = schema.toValidator();

      const result = validator.safeParse('HELLO');
      expectSuccess(result, 'hello');
    });

    test('toUpperCase() converts to uppercase', () => {
      const schema = string().toUpperCase();
      const validator = schema.toValidator();

      const result = validator.safeParse('hello');
      expectSuccess(result, 'HELLO');
    });
  });

  // Combined validations
  describe('combined validations', () => {
    test('combines multiple validations', () => {
      const schema = string().minLength(5).maxLength(10).regex(/^[a-z]+$/);
      const validator = schema.toValidator();

      // Valid
      expectSuccess(validator.safeParse('abcdef'));

      // Invalid - too short
      expectError(
        validator.safeParse('abcd'),
        'StringValidationError',
        'String must be at least 5 characters'
      );

      // Invalid - too long
      expectError(
        validator.safeParse('abcdefghijk'),
        'StringValidationError',
        'String must be at most 10 characters'
      );

      // Invalid - doesn't match regex
      expectError(
        validator.safeParse('ABCDEF'),
        'StringValidationError',
        'String does not match pattern'
      );
    });
  });

  // Nullable and optional
  describe('nullable and optional', () => {
    test('nullable() accepts null values', () => {
      const schema = string().nullable();
      const validator = schema.toValidator();

      expectSuccess(validator.safeParse('hello'));
      expectSuccess(validator.safeParse(null), null);
      expectError(validator.safeParse(undefined));
    });

    test('optional() accepts undefined values', () => {
      const schema = string().optional();
      const validator = schema.toValidator();

      expectSuccess(validator.safeParse('hello'));
      expectSuccess(validator.safeParse(undefined), undefined);
      expectError(validator.safeParse(null));
    });

    test('nullish() accepts null and undefined values', () => {
      const schema = string().nullish();
      const validator = schema.toValidator();

      expectSuccess(validator.safeParse('hello'));
      expectSuccess(validator.safeParse(null), null);
      expectSuccess(validator.safeParse(undefined), undefined);
    });
  });

  // Default values
  describe('default values', () => {
    test('default() provides a default value for undefined', () => {
      const schema = string().default('default value');
      const validator = schema.toValidator();

      expectSuccess(validator.safeParse('hello'), 'hello');
      expectSuccess(validator.safeParse(undefined), 'default value');
      expectError(validator.safeParse(null));
    });

    test('default() accepts a function to generate default values', () => {
      const defaultFn = () => 'generated default';
      const schema = string().default(defaultFn);
      const validator = schema.toValidator();

      expectSuccess(validator.safeParse('hello'), 'hello');
      expectSuccess(validator.safeParse(undefined), 'generated default');
    });
  });

  // Custom refinements
  describe('custom refinements', () => {
    test('refine() adds custom validation', () => {
      const schema = string().refine(
        val => val.includes('@'),
        'String must include @'
      );
      const validator = schema.toValidator();

      expectSuccess(validator.safeParse('hello@world'));
      expectError(
        validator.safeParse('hello'),
        'RefinementValidationError',
        'String must include @'
      );
    });
  });
}); 