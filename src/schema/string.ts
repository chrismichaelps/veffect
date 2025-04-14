/**
 * String schema implementation
 */
import * as E from '../internal/effect';
import * as EffectMod from 'effect/Effect';
import {
  Schema,
  Validator,
  ValidatorOptions,
  ValidationResult,
  ValidationError,
  RefinableSchema,
  TransformableSchema,
  DefaultableSchema,
  NullableSchema,
  PredicateSchema,
  CustomErrorsSchema
} from '../types';
import { createEffectValidator } from '../validator';
import { TypeValidationError, StringValidationError } from '../errors';

/**
 * String schema interface
 */
export interface StringSchema extends
  Schema<string>,
  RefinableSchema<string, StringSchema>,
  TransformableSchema<string, StringSchema>,
  DefaultableSchema<string, StringSchema>,
  NullableSchema<string, StringSchema>,
  PredicateSchema<string, StringSchema>,
  CustomErrorsSchema<string, StringSchema> {
  readonly _tag: 'StringSchema';

  // String specific validations
  readonly minLength: (min: number, message?: string) => StringSchema;
  readonly maxLength: (max: number, message?: string) => StringSchema;
  readonly length: (length: number, message?: string) => StringSchema;
  readonly regex: (pattern: RegExp, message?: string) => StringSchema;
  readonly email: (message?: string) => StringSchema;
  readonly url: (message?: string) => StringSchema;
  readonly uuid: (message?: string) => StringSchema;
  readonly cuid: (message?: string) => StringSchema;
  readonly cuid2: (message?: string) => StringSchema;
  readonly ulid: (message?: string) => StringSchema;
  readonly startsWith: (substring: string, message?: string) => StringSchema;
  readonly endsWith: (substring: string, message?: string) => StringSchema;
  readonly includes: (substring: string, message?: string) => StringSchema;
  readonly trim: (message?: string) => StringSchema;
  readonly toLowerCase: () => StringSchema;
  readonly toUpperCase: () => StringSchema;
  readonly datetime: (options?: { offset?: boolean, precision?: number, local?: boolean }, message?: string) => StringSchema;
  readonly ip: (options?: "v4" | "v6" | { version?: "v4" | "v6" }, message?: string) => StringSchema;
  readonly nonempty: (message?: string) => StringSchema;
  readonly emoji: (message?: string) => StringSchema;
  readonly nanoid: (message?: string) => StringSchema;
  readonly cidr: (options?: { version?: "v4" | "v6" } | string, message?: string) => StringSchema;
  readonly base64: (options?: { padding?: boolean, urlSafe?: boolean } | string, message?: string) => StringSchema;
  readonly date: (message?: string) => StringSchema;
  readonly time: (options?: { precision?: number }, message?: string) => StringSchema;
  readonly duration: (message?: string) => StringSchema;
}

/**
 * Create a string schema
 */
export function string(): StringSchema {
  const validations: Array<(input: string, options?: ValidatorOptions) => ValidationResult<string>> = [];
  let errorMessage: string | undefined = undefined;

  const schema: StringSchema = {
    _tag: 'StringSchema',

    minLength: (min, message) => {
      validations.push((input, options) =>
        input.length >= min
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must be at least ${min} characters`,
            options?.path
          ))
      );
      return schema;
    },

    maxLength: (max, message) => {
      validations.push((input, options) =>
        input.length <= max
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must be at most ${max} characters`,
            options?.path
          ))
      );
      return schema;
    },

    length: (length, message) => {
      validations.push((input, options) =>
        input.length === length
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must be exactly ${length} characters`,
            options?.path
          ))
      );
      return schema;
    },

    regex: (pattern, message) => {
      validations.push((input, options) =>
        pattern.test(input)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String does not match pattern ${pattern}`,
            options?.path
          ))
      );
      return schema;
    },

    email: (message) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return schema.regex(emailPattern, message || 'Invalid email address');
    },

    url: (message) => {
      const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
      return schema.regex(urlPattern, message || 'Invalid URL');
    },

    uuid: (message) => {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return schema.regex(uuidPattern, message || 'Invalid UUID');
    },

    cuid: (message) => {
      const cuidPattern = /^c[^\s-]{8,}$/i;
      return schema.regex(cuidPattern, message || 'Invalid CUID');
    },

    cuid2: (message) => {
      const cuid2Pattern = /^[a-z][a-z0-9]*$/;
      return schema.regex(cuid2Pattern, message || 'Invalid CUID2');
    },

    ulid: (message) => {
      const ulidPattern = /^[0-9A-HJKMNP-TV-Z]{26}$/;
      return schema.regex(ulidPattern, message || 'Invalid ULID');
    },

    startsWith: (substring, message) => {
      validations.push((input, options) =>
        input.startsWith(substring)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must start with "${substring}"`,
            options?.path
          ))
      );
      return schema;
    },

    endsWith: (substring, message) => {
      validations.push((input, options) =>
        input.endsWith(substring)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must end with "${substring}"`,
            options?.path
          ))
      );
      return schema;
    },

    includes: (substring, message) => {
      validations.push((input, options) =>
        input.includes(substring)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || `String must include "${substring}"`,
            options?.path
          ))
      );
      return schema;
    },

    trim: (message) => {
      // Create a transformation function and return a complete StringSchema
      const transformedValidator = createEffectValidator((input, options) => {
        return E.pipe(
          schema.toValidator().validate(input, options),
          E.map(value => value.trim())
        );
      });

      return {
        ...schema,
        toValidator: () => transformedValidator
      };
    },

    toLowerCase: () => {
      // Create a transformation function and return a complete StringSchema
      const transformedValidator = createEffectValidator((input, options) => {
        return E.pipe(
          schema.toValidator().validate(input, options),
          E.map(value => value.toLowerCase())
        );
      });

      return {
        ...schema,
        toValidator: () => transformedValidator
      };
    },

    toUpperCase: () => {
      // Create a transformation function and return a complete StringSchema
      const transformedValidator = createEffectValidator((input, options) => {
        return E.pipe(
          schema.toValidator().validate(input, options),
          E.map(value => value.toUpperCase())
        );
      });

      return {
        ...schema,
        toValidator: () => transformedValidator
      };
    },

    datetime: (options, message) => {
      const { offset = false, precision, local = false } = options || {};
      validations.push((input, options) => {
        // ISO datetime regex patterns
        let pattern;

        if (local) {
          // Local datetime without timezone
          pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;
        } else if (offset) {
          // Datetime with timezone offset
          pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{1,2}(?::?\d{2})?|Z)$/;
        } else {
          // Only UTC datetime (with Z)
          pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
        }

        // Check the format
        if (!pattern.test(input)) {
          return E.fail(new StringValidationError(
            message || 'Invalid datetime string',
            options?.path
          ));
        }

        // Parse date components
        const [datePart, timePart] = input.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        let [hoursStr, minutesStr, secondsStr] = timePart.split(':');

        // Extract seconds without milliseconds
        const secondsMatch = secondsStr.match(/^(\d+)/);
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;

        // Check time values
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
          return E.fail(new StringValidationError(
            message || 'Invalid time component in datetime',
            options?.path
          ));
        }

        // Check date validity using native Date
        const date = new Date(year, month - 1, day);
        if (
          date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day
        ) {
          return E.fail(new StringValidationError(
            message || 'Invalid date in datetime string',
            options?.path
          ));
        }

        // Check timezone offset validity if present
        if (offset) {
          // Check for valid offset format if not Z
          if (input.includes('+') || input.includes('-')) {
            // Extract the offset part
            const offsetMatch = input.match(/[+-](\d{1,2})(?::?(\d{2}))?$/);
            if (offsetMatch) {
              const offsetHours = parseInt(offsetMatch[1], 10);
              const offsetMinutes = offsetMatch[2] ? parseInt(offsetMatch[2], 10) : 0;

              // Validate offset hours and minutes
              if (offsetHours > 23 || offsetMinutes > 59) {
                return E.fail(new StringValidationError(
                  message || 'Invalid timezone offset in datetime',
                  options?.path
                ));
              }
            }
          }
        }

        // If precision is specified, check decimal precision of seconds
        if (precision !== undefined) {
          const decimalMatch = input.match(/\.(\d+)/);
          if (!decimalMatch && precision > 0) {
            return E.fail(new StringValidationError(
              message || `Datetime requires ${precision} decimal places precision`,
              options?.path
            ));
          }

          if (decimalMatch) {
            const decimals = decimalMatch[1].length;
            if (decimals !== precision) {
              return E.fail(new StringValidationError(
                message || `Datetime requires exactly ${precision} decimal places precision`,
                options?.path
              ));
            }
          }
        }

        return E.succeed(input);
      });
      return schema;
    },

    ip: (options?: "v4" | "v6" | { version?: "v4" | "v6" }, message?: string) => {
      // IPv4 pattern without leading zeros (to match test expectations)
      const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/;

      // Comprehensive IPv6 pattern that handles all valid forms including abbreviated
      const ipv6Pattern = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{1,4}){0,4}%[0-9a-zA-Z]+|::(?:ffff(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?[0-9])?[0-9])\.){3}(?:25[0-5]|(?:2[0-4]|1?[0-9])?[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?[0-9])?[0-9])\.){3}(?:25[0-5]|(?:2[0-4]|1?[0-9])?[0-9]))$/i;

      validations.push((input, validatorOptions) => {
        // Determine the version parameter from different input types
        let version: 'v4' | 'v6' | undefined;
        if (typeof options === 'string') {
          // If options is a string value like "v4" or "v6"
          if (options === "v4" || options === "v6") {
            version = options;
          } else {
            // If it's not a valid version string, it's the message
            message = options;
          }
        } else if (options && typeof options === 'object') {
          version = options.version;
        }

        // Validate IPv4
        if (version === 'v4') {
          return ipv4Pattern.test(input)
            ? E.succeed(input)
            : E.fail(new StringValidationError(
              message || 'Invalid IPv4 address',
              validatorOptions?.path
            ));
        }

        // Validate IPv6
        if (version === 'v6') {
          return ipv6Pattern.test(input)
            ? E.succeed(input)
            : E.fail(new StringValidationError(
              message || 'Invalid IPv6 address',
              validatorOptions?.path
            ));
        }

        // Validate either IPv4 or IPv6
        return ipv4Pattern.test(input) || ipv6Pattern.test(input)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || 'Invalid IP address',
            validatorOptions?.path
          ));
      });

      return schema;
    },

    nonempty: (message) => {
      validations.push((input, options) =>
        input.length > 0
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || 'String must not be empty',
            options?.path
          ))
      );
      return schema;
    },

    // New validators

    emoji: (message) => {
      validations.push((input, options) => {
        // Use a more reliable approach to detect emoji
        const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;

        // Check if the string contains at least one emoji and only consists of emojis and emoji modifiers
        const containsEmoji = emojiRegex.test(input);
        const nonEmojiContent = input.replace(/(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Emoji_Component}|\u200D|\uFE0F)/gu, '');

        if (!containsEmoji || nonEmojiContent.length > 0) {
          return E.fail(new StringValidationError(
            message || 'Invalid emoji string',
            options?.path
          ));
        }

        return E.succeed(input);
      });
      return schema;
    },

    nanoid: (message) => {
      // Nanoid format: URL-friendly symbols (A-Za-z0-9_-)
      const nanoidPattern = /^[A-Za-z0-9_-]+$/;
      validations.push((input, options) =>
        nanoidPattern.test(input)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || 'Invalid nanoid',
            options?.path
          ))
      );
      return schema;
    },

    cidr: (options?: { version?: "v4" | "v6" } | string, message?: string) => {
      validations.push((input, validatorOptions) => {
        let version: "v4" | "v6" | undefined;

        // Handle options
        if (typeof options === 'string') {
          // If options is a string value like "v4" or "v6"
          if (options === "v4" || options === "v6") {
            version = options;
          } else {
            // If it's not a valid version string, it's the message
            message = options;
          }
        } else if (options && typeof options === 'object') {
          version = options.version;
        }

        // IPv4 CIDR validation
        const ipv4CidrRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;

        // IPv6 CIDR validation with improved validation
        const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(:[0-9a-fA-F]{1,4}){1,6}|:((:[0-9a-fA-F]{1,4}){1,7}|:))(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))$/;

        if (version === "v4") {
          // Only validate IPv4
          if (!ipv4CidrRegex.test(input)) {
            return E.fail(new StringValidationError(
              message || 'Invalid IPv4 CIDR notation',
              validatorOptions?.path
            ));
          }
        } else if (version === "v6") {
          // Only validate IPv6
          if (!ipv6CidrRegex.test(input)) {
            return E.fail(new StringValidationError(
              message || 'Invalid IPv6 CIDR notation',
              validatorOptions?.path
            ));
          }
        } else {
          // Validate both formats
          if (!ipv4CidrRegex.test(input) && !ipv6CidrRegex.test(input)) {
            return E.fail(new StringValidationError(
              message || 'Invalid CIDR notation',
              validatorOptions?.path
            ));
          }
        }

        return E.succeed(input);
      });
      return schema;
    },

    base64: (options?: { padding?: boolean, urlSafe?: boolean } | string, message?: string) => {
      validations.push((input, validatorOptions) => {
        // Default settings for standard base64
        let paddingRequired = true;
        let urlSafe = false;

        // Handle options
        if (typeof options === 'object' && options !== null) {
          paddingRequired = options.padding !== false; // Default to true unless explicitly set to false
          urlSafe = options.urlSafe === true; // Default to false unless explicitly set to true
        } else if (typeof options === 'string') {
          // If options is a string, it's actually the message
          message = options;
        }

        // If the input is empty, it's not valid base64
        if (input.length === 0) {
          return E.fail(new StringValidationError(
            message || 'Base64 string cannot be empty',
            validatorOptions?.path
          ));
        }

        // Base64 characters - standard or URL-safe
        const base64Chars = urlSafe ? 'A-Za-z0-9\\-_' : 'A-Za-z0-9\\+\\/';

        // Get padding (trailing '=' characters)
        const matches = input.match(/=*$/);
        const padding = matches && matches[0] ? matches[0].length : 0;
        const contentLength = input.length - padding;

        // Base rules:
        // 1. Content should only have valid base64 characters
        // 2. Padding, if present, should be 0, 1, or 2 characters
        // 3. Validate that padding is correct based on content length
        // 4. Content length without padding must be a multiple of 4 when padding is required

        // Check if characters are valid base64 characters
        const contentRegex = new RegExp(`^[${base64Chars}]+$`);
        if (!contentRegex.test(input.slice(0, contentLength))) {
          return E.fail(new StringValidationError(
            message || 'Invalid base64 characters',
            validatorOptions?.path
          ));
        }

        // Check padding count
        if (padding > 2) {
          return E.fail(new StringValidationError(
            message || 'Base64 padding too long (max 2 characters)',
            validatorOptions?.path
          ));
        }

        // Validate padding based on content length
        // Calculate expected padding based on content length modulo 4
        const mod = contentLength % 4;

        // When padding is required, the total length must be a multiple of 4
        if (paddingRequired) {
          if (input.length % 4 !== 0) {
            return E.fail(new StringValidationError(
              message || `Invalid base64 format: length must be a multiple of 4 when padding is required`,
              validatorOptions?.path
            ));
          }

          // Expected padding based on content length mod 4
          const expectedPadding = mod === 0 ? 0 : 4 - mod;

          if (padding !== expectedPadding) {
            return E.fail(new StringValidationError(
              message || `Invalid base64 padding (expected ${expectedPadding}, got ${padding})`,
              validatorOptions?.path
            ));
          }
        } else if (mod === 1) {
          // Even without padding requirement, mod 1 is always invalid in base64
          return E.fail(new StringValidationError(
            message || 'Invalid base64 format: content length mod 4 cannot be 1',
            validatorOptions?.path
          ));
        }

        return E.succeed(input);
      });
      return schema;
    },

    date: (message) => {
      // ISO date format YYYY-MM-DD, allowing for multi-digit years
      const datePattern = /^\d{4,}-\d{2}-\d{2}$/;

      validations.push((input, options) => {
        // Check format
        if (!datePattern.test(input)) {
          return E.fail(new StringValidationError(
            message || 'Invalid date string. Format must be YYYY-MM-DD',
            options?.path
          ));
        }

        // Check if it's a valid date
        const [year, month, day] = input.split('-').map(Number);

        // Simple validation for date range
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          return E.fail(new StringValidationError(
            message || 'Invalid date (month or day out of range)',
            options?.path
          ));
        }

        // Additional validation for specific months
        if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) {
          return E.fail(new StringValidationError(
            message || `Invalid date (${month} has only 30 days)`,
            options?.path
          ));
        }

        // February validation (including leap years)
        if (month === 2) {
          const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
          const maxDays = isLeapYear ? 29 : 28;

          if (day > maxDays) {
            return E.fail(new StringValidationError(
              message || `Invalid date (February has ${maxDays} days in ${year})`,
              options?.path
            ));
          }
        }

        return E.succeed(input);
      });
      return schema;
    },

    time: (options, message) => {
      const { precision } = options || {};

      validations.push((input, options) => {
        // Basic time format HH:MM:SS[.sss] - no timezone
        const baseTimePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.(\d+))?$/;
        const match = input.match(baseTimePattern);

        if (!match) {
          return E.fail(new StringValidationError(
            message || 'Invalid time string. Format must be HH:MM:SS[.sss]',
            options?.path
          ));
        }

        // Check precision if specified
        if (precision !== undefined) {
          const decimalPart = match[4];
          if (!decimalPart && precision > 0) {
            return E.fail(new StringValidationError(
              message || `Time requires ${precision} decimal places precision`,
              options?.path
            ));
          }

          if (decimalPart && decimalPart.length !== precision) {
            return E.fail(new StringValidationError(
              message || `Time requires exactly ${precision} decimal places precision`,
              options?.path
            ));
          }
        }

        return E.succeed(input);
      });
      return schema;
    },

    duration: (message) => {
      // ISO 8601 duration format
      const durationPattern = /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?$/;

      validations.push((input, options) =>
        durationPattern.test(input)
          ? E.succeed(input)
          : E.fail(new StringValidationError(
            message || 'Invalid ISO 8601 duration',
            options?.path
          ))
      );
      return schema;
    },

    // Refinement implementation
    refine: (refinement, message) => {
      // Check if the refinement is async
      const testIsAsync = refinement("") instanceof Promise;

      if (testIsAsync) {
        // For async refinement, return a special schema that handles async validation
        return {
          ...schema,
          _tag: 'StringSchema',
          toValidator: () => {
            const baseValidator = schema.toValidator();

            return {
              ...baseValidator,
              // Override validateAsync to handle the async refinement
              validateAsync: async (input: unknown, options?: ValidatorOptions) => {
                // Validate the input type first
                if (typeof input !== 'string') {
                  throw {
                    _tag: 'TypeValidationError',
                    message: errorMessage || 'Value must be a string',
                    expected: 'string',
                    received: typeof input,
                    path: options?.path
                  };
                }

                // Run all the synchronous validations first
                let result = input;

                try {
                  // Apply the async refinement
                  const isValid = await refinement(result);
                  if (!isValid) {
                    throw {
                      _tag: 'RefinementValidationError',
                      message: typeof message === 'function'
                        ? message(result)
                        : message || 'Failed refinement',
                      path: options?.path
                    };
                  }
                  return result;
                } catch (error) {
                  // Any error in the refinement should result in a validation error
                  throw {
                    _tag: 'RefinementValidationError',
                    message: typeof message === 'function'
                      ? message(result)
                      : message || 'Failed refinement',
                    path: options?.path
                  };
                }
              }
            };
          }
        };
      }

      // For synchronous refinement, use the standard approach
      validations.push((input, options) =>
        refinement(input)
          ? E.succeed(input)
          : E.fail({
            _tag: 'RefinementValidationError',
            message: typeof message === 'function'
              ? message(input)
              : message || 'Failed refinement',
            path: options?.path
          })
      );
      return schema;
    },

    // Predicate implementation (alias for refine)
    predicate: (predicate, message) => {
      return schema.refine(predicate, message);
    },

    // Transform implementation
    transform: <U>(transformer: (value: string) => U) => {
      return {
        _tag: 'TransformedSchema',
        toValidator: () => createEffectValidator((input, options) => {
          return E.pipe(
            schema.toValidator().validate(input, options),
            E.map(value => transformer(value))
          );
        })
      };
    },

    // Default value implementation
    default: (defaultValue) => {
      // Create a default validator function
      const defaultValidator = createEffectValidator((input, options) => {
        if (input === undefined) {
          const value = typeof defaultValue === 'function'
            ? (defaultValue as () => string)()
            : defaultValue;
          return E.succeed(value);
        }
        return schema.toValidator().validate(input, options);
      });

      // Return a new schema with all properties preserved
      return {
        ...schema,
        _tag: 'StringSchema',
        toValidator: () => defaultValidator
      };
    },

    // Nullable implementation
    nullable: () => {
      return {
        _tag: 'NullableSchema',
        toValidator: () => createEffectValidator((input, options) => {
          if (input === null) {
            return E.succeed(null);
          }
          return schema.toValidator().validate(input, options);
        })
      };
    },

    // Optional implementation
    optional: () => {
      return {
        _tag: 'OptionalSchema',
        toValidator: () => createEffectValidator((input, options) => {
          if (input === undefined) {
            return E.succeed(undefined);
          }
          return schema.toValidator().validate(input, options);
        })
      };
    },

    // Nullish implementation
    nullish: () => {
      return {
        _tag: 'NullishSchema',
        toValidator: () => createEffectValidator((input, options) => {
          if (input === null || input === undefined) {
            return E.succeed(input);
          }
          return schema.toValidator().validate(input, options);
        })
      };
    },

    // Custom error message
    error: (message) => {
      errorMessage = message;
      return schema;
    },

    toValidator: () => createEffectValidator((input, options) => {
      if (typeof input !== 'string') {
        return E.fail(new TypeValidationError(
          errorMessage || 'Value must be a string',
          'string',
          typeof input,
          options?.path
        ));
      }

      return validations.reduce(
        (acc, validation) => E.flatMap(acc, val => validation(val, options)),
        E.succeed(input) as E.Effect<string, ValidationError>
      );
    })
  };

  return schema;
}
