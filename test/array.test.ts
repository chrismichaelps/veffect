import { array } from '../src/schema/array';
import { string } from '../src/schema/string';
import { number } from '../src/schema/number';

describe('ArraySchema', () => {
  test('validates arrays', () => {
    const schema = array(string());
    const validator = schema.toValidator();

    // Valid cases
    expect(validator.safeParse(['a', 'b', 'c']).success).toBe(true);
    expect(validator.safeParse([]).success).toBe(true);

    // Invalid cases
    expect(validator.safeParse('not an array').success).toBe(false);
    expect(validator.safeParse(123).success).toBe(false);
    expect(validator.safeParse({}).success).toBe(false);
    expect(validator.safeParse(null).success).toBe(false);
    expect(validator.safeParse(undefined).success).toBe(false);

    // Invalid - contains wrong element type
    expect(validator.safeParse(['a', 123, 'c']).success).toBe(false);
  });

  test('minLength() validates minimum length', () => {
    const schema = array(string()).minLength(2);
    const validator = schema.toValidator();

    expect(validator.safeParse(['a', 'b']).success).toBe(true);
    expect(validator.safeParse(['a', 'b', 'c']).success).toBe(true);
    expect(validator.safeParse(['a']).success).toBe(false);
    expect(validator.safeParse([]).success).toBe(false);
  });

  test('maxLength() validates maximum length', () => {
    const schema = array(string()).maxLength(2);
    const validator = schema.toValidator();

    expect(validator.safeParse([]).success).toBe(true);
    expect(validator.safeParse(['a']).success).toBe(true);
    expect(validator.safeParse(['a', 'b']).success).toBe(true);
    expect(validator.safeParse(['a', 'b', 'c']).success).toBe(false);
  });

  test('length() validates exact length', () => {
    const schema = array(string()).length(2);
    const validator = schema.toValidator();

    expect(validator.safeParse(['a', 'b']).success).toBe(true);
    expect(validator.safeParse(['a']).success).toBe(false);
    expect(validator.safeParse(['a', 'b', 'c']).success).toBe(false);
    expect(validator.safeParse([]).success).toBe(false);
  });

  test('validates different element types', () => {
    const numberArray = array(number());
    const objectArray = array(array(string()));

    expect(numberArray.toValidator().safeParse([1, 2, 3]).success).toBe(true);
    expect(numberArray.toValidator().safeParse(['1', 2, 3]).success).toBe(false);

    expect(objectArray.toValidator().safeParse([['a'], ['b', 'c']]).success).toBe(true);
    expect(objectArray.toValidator().safeParse([['a'], [1, 2]]).success).toBe(false);
  });

  test('nullable() accepts null values', () => {
    const schema = array(string()).nullable();
    const validator = schema.toValidator();

    expect(validator.safeParse(['a', 'b']).success).toBe(true);
    expect(validator.safeParse(null).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(false);
  });

  test('optional() accepts undefined values', () => {
    const schema = array(string()).optional();
    const validator = schema.toValidator();

    expect(validator.safeParse(['a', 'b']).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(true);
    expect(validator.safeParse(null).success).toBe(false);
  });

  test('default() provides default values', () => {
    const defaultArray = ['default1', 'default2'];
    const schema = array(string()).default(defaultArray);
    const validator = schema.toValidator();

    const result1 = validator.safeParse(['custom']);
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.data).toEqual(['custom']);
    }

    const result2 = validator.safeParse(undefined);
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toEqual(defaultArray);
    }
  });

  test('combines multiple validations', () => {
    const schema = array(string()).minLength(1).maxLength(3);
    const validator = schema.toValidator();

    expect(validator.safeParse(['a']).success).toBe(true);
    expect(validator.safeParse(['a', 'b']).success).toBe(true);
    expect(validator.safeParse(['a', 'b', 'c']).success).toBe(true);
    expect(validator.safeParse([]).success).toBe(false);
    expect(validator.safeParse(['a', 'b', 'c', 'd']).success).toBe(false);
  });
}); 