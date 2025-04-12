import { date } from '../src/schema/date';
import { TypeValidationError, DateValidationError } from '../src/errors';
import * as E from '../src/internal/effect';

describe('DateSchema', () => {
  test('validates Date objects', () => {
    const schema = date();
    const validator = schema.toValidator();

    // Valid date
    const validDate = new Date();
    const result = validator.safeParse(validDate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(validDate);
    }

    // Invalid values
    expect(validator.safeParse('2023-01-01').success).toBe(false);
    expect(validator.safeParse(1672531200000).success).toBe(false); // timestamp
    expect(validator.safeParse({}).success).toBe(false);
    expect(validator.safeParse(null).success).toBe(false);
    expect(validator.safeParse(undefined).success).toBe(false);

    // Check error type
    const invalidResult = validator.safeParse('not a date');
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.error).toBeInstanceOf(TypeValidationError);
    }
  });

  test('supports min constraint', () => {
    const minDate = new Date('2025-01-01');
    const schema = date().min(minDate);
    const validator = schema.toValidator();

    // Valid date (after min)
    expect(validator.safeParse(new Date('2025-02-01')).success).toBe(true);

    // Valid date (equal to min)
    expect(validator.safeParse(new Date('2025-01-01')).success).toBe(true);

    // Invalid date (before min)
    const result = validator.safeParse(new Date('2024-12-01'));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DateValidationError);
      expect(result.error.message).toContain('at or after');
    }
  });

  test('supports max constraint', () => {
    const maxDate = new Date('2025-12-31');
    const schema = date().max(maxDate);
    const validator = schema.toValidator();

    // Valid date (before max)
    expect(validator.safeParse(new Date('2025-11-01')).success).toBe(true);

    // Valid date (equal to max)
    expect(validator.safeParse(new Date('2025-12-31')).success).toBe(true);

    // Invalid date (after max)
    const result = validator.safeParse(new Date('2026-01-01'));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DateValidationError);
      expect(result.error.message).toContain('at or before');
    }
  });

  test('can combine min and max constraints', () => {
    const schema = date()
      .min(new Date('2025-01-01'))
      .max(new Date('2025-12-31'));
    const validator = schema.toValidator();

    // Valid date (in range)
    expect(validator.safeParse(new Date('2025-06-15')).success).toBe(true);

    // Invalid date (too early)
    expect(validator.safeParse(new Date('2024-12-31')).success).toBe(false);

    // Invalid date (too late)
    expect(validator.safeParse(new Date('2026-01-01')).success).toBe(false);
  });

  test('supports custom validation with refine', () => {
    // Validate weekend dates by adjusting to local time zone
    // To make this test predictable, we manually create dates with known day of week
    const sunday = new Date();
    sunday.setFullYear(2025);
    sunday.setMonth(0); // January
    sunday.setDate(5);  // Jan 5, 2025 is a Sunday

    const monday = new Date();
    monday.setFullYear(2025);
    monday.setMonth(0); // January
    monday.setDate(6);  // Jan 6, 2025 is a Monday

    const schema = date().refine(
      (value) => {
        const day = value.getDay();
        return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
      },
      'Date must be a weekend day'
    );
    const validator = schema.toValidator();

    // Valid date (weekend)
    expect(validator.safeParse(sunday).success).toBe(true);

    // Invalid date (weekday)
    const result = validator.safeParse(monday);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Date must be a weekend day');
    }
  });

  test('supports transformation', () => {
    // Transform date to ISO string
    const schema = date().transform(d => d.toISOString());
    const validator = schema.toValidator();

    const testDate = new Date('2025-01-01T00:00:00Z');
    const result = validator.safeParse(testDate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('2025-01-01T00:00:00.000Z');
    }
  });

  test('supports default values', () => {
    const defaultDate = new Date('2025-01-01');
    const schema = date().default(defaultDate);
    const validator = schema.toValidator();

    // When undefined, use default
    const result = validator.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(defaultDate);
    }

    // When actual date provided, use that
    const providedDate = new Date('2025-06-15');
    const result2 = validator.safeParse(providedDate);
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toEqual(providedDate);
    }
  });

  test('supports nullable dates', () => {
    const schema = date().nullable();
    const validator = schema.toValidator();

    // Both date and null should be valid
    expect(validator.safeParse(new Date()).success).toBe(true);
    expect(validator.safeParse(null).success).toBe(true);

    // Other values still invalid
    expect(validator.safeParse('2023-01-01').success).toBe(false);
    expect(validator.safeParse(undefined).success).toBe(false);
  });

  test('supports optional dates', () => {
    const schema = date().optional();
    const validator = schema.toValidator();

    // Both date and undefined should be valid
    expect(validator.safeParse(new Date()).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(true);

    // Other values still invalid
    expect(validator.safeParse('2023-01-01').success).toBe(false);
    expect(validator.safeParse(null).success).toBe(false);
  });

  test('supports nullish dates', () => {
    const schema = date().nullish();
    const validator = schema.toValidator();

    // Date, null, and undefined should be valid
    expect(validator.safeParse(new Date()).success).toBe(true);
    expect(validator.safeParse(null).success).toBe(true);
    expect(validator.safeParse(undefined).success).toBe(true);

    // Other values still invalid
    expect(validator.safeParse('2023-01-01').success).toBe(false);
  });

  test('tracks path correctly in validation errors', () => {
    const schema = date();
    const validator = schema.toValidator();

    // Test with custom path
    const result = validator.validate('not a date', { path: ['created_at'] });
    const either = E.runSync(E.either(result));

    expect(E.isLeft(either)).toBe(true);
    if (E.isLeft(either)) {
      const error = either.left;
      expect(error.path).toEqual(['created_at']);
    }
  });

  test('parse method throws on invalid data', () => {
    const schema = date();
    const validator = schema.toValidator();

    expect(() => {
      validator.parse('not a date');
    }).toThrow();
  });

  test('parse method returns data on valid input', () => {
    const schema = date();
    const validator = schema.toValidator();

    const testDate = new Date();
    const result = validator.parse(testDate);
    expect(result).toBe(testDate);
  });

  test('validateAsync works with dates', async () => {
    const schema = date();
    const validator = schema.toValidator();

    const testDate = new Date();
    const result = await validator.validateAsync(testDate);
    expect(result).toBe(testDate);
  });
}); 