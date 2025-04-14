"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("../src/schema/string");
describe('String Validation Functions', () => {
    // Helper function to test validations
    function testValidCases(schema, validCases) {
        validCases.forEach(value => {
            test(`${String(value).substring(0, 30)} should be valid`, () => {
                const result = schema.toValidator().safeParse(value);
                expect(result.success).toBe(true);
            });
        });
    }
    function testInvalidCases(schema, invalidCases) {
        invalidCases.forEach(value => {
            test(`${String(value).substring(0, 30)} should be invalid`, () => {
                const result = schema.toValidator().safeParse(value);
                expect(result.success).toBe(false);
            });
        });
    }
    describe('datetime validation', () => {
        const datetimeSchema = (0, string_1.string)().datetime();
        testValidCases(datetimeSchema, [
            '2025-01-01T00:00:00Z',
            '2025-01-01T00:00:00.123Z',
            '2025-01-01T00:00:00.123456789Z',
        ]);
        testInvalidCases(datetimeSchema, [
            '2025-01-01T00:00:00+00:00', // No offset allowed
            '2025-01-01T24:00:00Z', // Invalid hour
            '2025-02-30T00:00:00Z', // Invalid date
            '', // Empty string
            null, // Null
            undefined, // Undefined
        ]);
        describe('with offset option', () => {
            const offsetSchema = (0, string_1.string)().datetime({ offset: true });
            testValidCases(offsetSchema, [
                '2025-01-01T00:00:00Z',
                '2025-01-01T00:00:00+00:00',
                '2025-01-01T00:00:00-05:00',
                '2025-01-01T00:00:00+0530',
                '2025-01-01T00:00:00+05',
            ]);
            testInvalidCases(offsetSchema, [
                '2025-01-01T00:00:00+24:00', // Invalid offset hours
                '2025-01-01T00:00:00+00:60', // Invalid offset minutes
            ]);
        });
        describe('with local option', () => {
            const localSchema = (0, string_1.string)().datetime({ local: true });
            testValidCases(localSchema, [
                '2025-01-01T00:00:00',
                '2025-01-01T00:00:00.123',
            ]);
            testInvalidCases(localSchema, [
                '2025-01-01T00:00:00Z', // No Z allowed with local option
                '2025-01-01T00:00:00+00:00', // No offset allowed with local option
            ]);
        });
        describe('with precision option', () => {
            const precisionSchema = (0, string_1.string)().datetime({ precision: 3 });
            testValidCases(precisionSchema, [
                '2025-01-01T00:00:00.123Z',
            ]);
            testInvalidCases(precisionSchema, [
                '2025-01-01T00:00:00.1Z', // Too few decimals
                '2025-01-01T00:00:00.12Z', // Too few decimals
                '2025-01-01T00:00:00.1234Z', // Too many decimals
                '2025-01-01T00:00:00Z', // No decimals
            ]);
        });
    });
    describe('emoji validation', () => {
        const emojiSchema = (0, string_1.string)().emoji();
        testValidCases(emojiSchema, [
            '😀',
            '👨‍👩‍👧',
            '🏳️‍🌈',
            '👍🏽',
            '😀😃😄',
        ]);
        testInvalidCases(emojiSchema, [
            'a',
            'abc😀',
            '👍a',
            '',
            ' ',
        ]);
    });
    describe('nanoid validation', () => {
        const nanoidSchema = (0, string_1.string)().nanoid();
        testValidCases(nanoidSchema, [
            'abc123',
            'ABC123xyz',
            'a_b-c',
            '-_',
            'a'.repeat(1000), // Very long nanoid
        ]);
        testInvalidCases(nanoidSchema, [
            '',
            'abc$def',
            'abc def',
            'abc/def',
            'abc+def',
        ]);
    });
    describe('CIDR validation', () => {
        const cidrSchema = (0, string_1.string)().cidr();
        testValidCases(cidrSchema, [
            '192.168.0.0/24',
            '10.0.0.0/8',
            '0.0.0.0/0',
            '192.168.0.0/32',
            '2001:db8::/32',
            '2001:db8::/128',
        ]);
        testInvalidCases(cidrSchema, [
            '192.168.0.0/33', // Invalid prefix length
            '192.168.0.0/-1', // Negative prefix
            '256.0.0.0/24', // Invalid IP
            '192.168.0.0.0/24', // Too many octets
            '192.168.0/24', // Not enough octets
            '192.168.0.0', // Missing prefix
            '/24', // Missing IP
            '2001:db8::/129', // Invalid IPv6 prefix
            'g001:db8::/32', // Invalid IPv6 address
            '', // Empty string
        ]);
        describe('with version option', () => {
            const ipv4CidrSchema = (0, string_1.string)().cidr({ version: 'v4' });
            testValidCases(ipv4CidrSchema, [
                '192.168.0.0/24',
                '10.0.0.0/8',
            ]);
            testInvalidCases(ipv4CidrSchema, [
                '2001:db8::/32', // IPv6 not allowed
            ]);
            const ipv6CidrSchema = (0, string_1.string)().cidr({ version: 'v6' });
            testValidCases(ipv6CidrSchema, [
                '2001:db8::/32',
                '2001:db8::/128',
            ]);
            testInvalidCases(ipv6CidrSchema, [
                '192.168.0.0/24', // IPv4 not allowed
            ]);
        });
    });
    describe('base64 validation', () => {
        const base64Schema = (0, string_1.string)().base64();
        testValidCases(base64Schema, [
            'aGVsbG8=',
            'YWJj',
            'YQ==',
            'YWI=',
            'AAAAAAAA', // Shorter valid base64
        ]);
        testInvalidCases(base64Schema, [
            '',
            'YWI', // Length not multiple of 4
            'YWI===', // Too much padding
            'YW!j', // Invalid character
            'a=b=c=', // Invalid padding placement
            'A'.repeat(100001), // Very long string with length not multiple of 4
        ]);
    });
    describe('date validation', () => {
        const dateSchema = (0, string_1.string)().date();
        testValidCases(dateSchema, [
            '2025-01-01',
            '2025-12-31',
            '2024-02-29', // Leap year
            '0000-01-01',
            '9999-12-31',
            '10000-01-01', // 5-digit year
        ]);
        testInvalidCases(dateSchema, [
            '2025-02-29', // Invalid date (not leap year)
            '2025-00-01', // Invalid month (0)
            '2025-13-01', // Invalid month (13)
            '2025-01-00', // Invalid day (0)
            '2025-01-32', // Invalid day (32)
            '2025-04-31', // Invalid day (April 31)
            '-0001-01-01', // Negative year
            '2025/01/01', // Wrong separator
            '20250101', // No separators
            '2025-1-1', // Single-digit month and day
            '', // Empty string
        ]);
    });
    describe('time validation', () => {
        const timeSchema = (0, string_1.string)().time();
        testValidCases(timeSchema, [
            '00:00:00',
            '23:59:59',
            '23:59:59.999',
            '23:59:59.123456789',
        ]);
        testInvalidCases(timeSchema, [
            '24:00:00', // Invalid hour
            '12:60:00', // Invalid minute
            '12:00:60', // Invalid second
            '12:00', // Missing seconds
            '12', // Only hours
            '12:00:00.', // Decimal point with no decimals
            '12:00:00Z', // With timezone (not allowed)
            '12:00:00+00:00', // With offset (not allowed)
            '', // Empty string
        ]);
        describe('with precision option', () => {
            const precisionTimeSchema = (0, string_1.string)().time({ precision: 3 });
            testValidCases(precisionTimeSchema, [
                '12:34:56.789',
            ]);
            testInvalidCases(precisionTimeSchema, [
                '12:34:56', // No decimal part
                '12:34:56.78', // Too few decimals
                '12:34:56.7890', // Too many decimals
            ]);
        });
    });
    describe('duration validation', () => {
        const durationSchema = (0, string_1.string)().duration();
        testValidCases(durationSchema, [
            'P1Y',
            'P1M',
            'P1D',
            'PT1H',
            'PT1M',
            'PT1S',
            'P1Y2M3DT4H5M6S',
            'P0Y',
        ]);
        testInvalidCases(durationSchema, [
            'P', // Only P
            'PT', // Only PT
            'P1S', // S without T prefix
            'PT1Y', // Y after T
            'P-1Y', // Negative value
            'P1.5Y', // Decimal value
            'P1Y2M3D4H5M6S', // Missing T separator
            '', // Empty string
        ]);
    });
    describe('IP address validation', () => {
        const ipSchema = (0, string_1.string)().ip();
        testValidCases(ipSchema, [
            '127.0.0.1',
            '0.0.0.0',
            '255.255.255.255',
            '2001:0db8:85a3:0000:0000:8a2e:0370:7334', // Full IPv6
        ]);
        testInvalidCases(ipSchema, [
            '256.0.0.0', // Invalid octet
            '1.2.3', // Too few octets
            '1.2.3.4.5', // Too many octets
            '01.2.3.4', // Leading zero
            'invalid-ip', // Not an IP address
            '', // Empty string
        ]);
        describe('with version option', () => {
            const ipv4Schema = (0, string_1.string)().ip({ version: 'v4' });
            testValidCases(ipv4Schema, [
                '127.0.0.1',
                '0.0.0.0',
                '255.255.255.255',
            ]);
            testInvalidCases(ipv4Schema, [
                '2001:0db8:85a3:0000:0000:8a2e:0370:7334', // IPv6 not allowed
            ]);
            const ipv6Schema = (0, string_1.string)().ip({ version: 'v6' });
            testValidCases(ipv6Schema, [
                '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
            ]);
            testInvalidCases(ipv6Schema, [
                '127.0.0.1', // IPv4 not allowed
            ]);
        });
    });
    describe('chained validations and transformations', () => {
        describe('Combined string validations', () => {
            const complexSchema = (0, string_1.string)()
                .minLength(5)
                .maxLength(50)
                .nonempty()
                .refine(val => !val.includes('forbidden'), 'Must not include forbidden word')
                .transform(val => val.trim());
            testValidCases(complexSchema, [
                'valid string',
                '  padded  ', // Will be trimmed
                'abcde', // Exactly minimum length
                'a'.repeat(50), // Exactly maximum length
            ]);
            testInvalidCases(complexSchema, [
                'a'.repeat(51), // Exceeds maximum length
                'abc', // Below minimum length
                'has forbidden word', // Contains forbidden word
                '', // Empty string
                ' ', // Only whitespace (too short after trim)
            ]);
        });
        describe('optional and nullish chaining', () => {
            const emailSchema = (0, string_1.string)().email();
            const optionalEmailSchema = emailSchema.optional();
            const nullishEmailSchema = emailSchema.nullish();
            test('optional schema accepts undefined but not null', () => {
                expect(optionalEmailSchema.toValidator().safeParse(undefined).success).toBe(true);
                expect(optionalEmailSchema.toValidator().safeParse(null).success).toBe(false);
                expect(optionalEmailSchema.toValidator().safeParse('test@example.com').success).toBe(true);
                expect(optionalEmailSchema.toValidator().safeParse('invalid').success).toBe(false);
            });
            test('nullish schema accepts both undefined and null', () => {
                expect(nullishEmailSchema.toValidator().safeParse(undefined).success).toBe(true);
                expect(nullishEmailSchema.toValidator().safeParse(null).success).toBe(true);
                expect(nullishEmailSchema.toValidator().safeParse('test@example.com').success).toBe(true);
                expect(nullishEmailSchema.toValidator().safeParse('invalid').success).toBe(false);
            });
        });
    });
    describe('performance', () => {
        test('handles large strings efficiently', () => {
            const longString = 'a'.repeat(10000); // 10K chars for test performance
            const schema = (0, string_1.string)().maxLength(20000);
            const startTime = performance.now();
            const result = schema.toValidator().safeParse(longString);
            const endTime = performance.now();
            expect(result.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
        });
        test('handles multiple validations efficiently', () => {
            const testString = 'abcdefghijklmnopqrstuvwxyz';
            const schema = (0, string_1.string)()
                .minLength(5)
                .maxLength(100)
                .regex(/^[a-z]+$/)
                .startsWith('a')
                .endsWith('z')
                .includes('m')
                .refine(val => val.length % 2 === 0, 'Must be even length')
                .refine(val => val.split('a').length > 1, 'Must have a character');
            const startTime = performance.now();
            const result = schema.toValidator().safeParse(testString);
            const endTime = performance.now();
            expect(result.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(50); // Should complete in < 50ms
        });
    });
});
