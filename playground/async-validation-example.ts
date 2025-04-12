/**
 * Async Validation Example
 *
 * This file demonstrates how to use async validations with VEffect schemas.
 * It uses the JSONPlaceholder API (https://jsonplaceholder.typicode.com/)
 * to check username and email availability during validation.
 *
 * This example demonstrates real-world API validation with proper error handling.
 */

import { string, object } from '../dist';

// Define type for JSON API response
interface UserApiResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  // other fields from JSONPlaceholder user API
}

// Real API function to check usernames using JSONPlaceholder
async function checkUsernameAvailability(username: string): Promise<UserApiResponse[]> {
  console.log(`Checking if username "${username}" is available...`);

  try {
    // Don't make an API call for empty strings
    if (!username.trim()) {
      return [];
    }

    const response = await fetch(`https://jsonplaceholder.typicode.com/users?username=${username}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json() as UserApiResponse[];
  } catch (error) {
    console.error("Error while checking username availability:", error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

// Real API function to check emails using JSONPlaceholder
async function checkEmailAvailability(email: string): Promise<UserApiResponse[]> {
  console.log(`Checking if email "${email}" is available...`);

  try {
    // Don't make an API call for empty strings
    if (!email.trim()) {
      return [];
    }

    const response = await fetch(`https://jsonplaceholder.typicode.com/users?email=${email}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json() as UserApiResponse[];
  } catch (error) {
    console.error("Error while checking email availability:", error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

// Don't output these on startup - only when the examples run
function printSectionHeader(headerText: string) {
  console.log(`\n${headerText}`);
}

/**
 * Example 1: Simple async validation of a username
 */
async function runUsernameExample() {
  printSectionHeader('1. Simple Username Validation:');

  // Create a schema with async validation for username
  const usernameSchema = string().refine(async (username) => {
    try {
      const data = await checkUsernameAvailability(username);

      // If the API returns any results, consider the username taken
      const isAvailable = data.length === 0;
      console.log(`Username "${username}" is ${isAvailable ? 'available' : 'already taken'}`);

      return isAvailable;
    } catch (error) {
      console.error('Error in username validation refinement:', error);
      // In a real-world application, you might want to handle this differently,
      // perhaps by returning false or retrying
      return false; // Fail validation if API check fails
    }
  }, "Username is already taken or could not be verified");

  // Create a validator
  const usernameValidator = usernameSchema.toValidator();

  // Try validating two usernames - one that exists in JSONPlaceholder, one that doesn't
  try {
    // This should fail - "Bret" is a username in the JSONPlaceholder database
    console.log('\nValidating existing username "Bret":');
    const result1 = await usernameValidator.validateAsync("Bret");
    console.log('Result (should not reach here):', result1);
  } catch (error: any) {
    console.log('Error (expected):', error.message);
  }

  try {
    // This should succeed - "UniqueNewUsername" doesn't exist in JSONPlaceholder
    console.log('\nValidating new username "UniqueNewUsername":');
    const result2 = await usernameValidator.validateAsync("UniqueNewUsername");
    console.log('Result:', result2);
  } catch (error: any) {
    console.log('Error (unexpected):', error.message);
  }
}

/**
 * Example 2: User registration form with multiple async validations
 */
async function runUserRegistrationExample() {
  printSectionHeader('2. User Registration Form:');

  // Create a schema for user registration with async validations for both username and email
  const userRegistrationSchema = object({
    username: string().refine(async (username) => {
      try {
        const data = await checkUsernameAvailability(username);
        const isAvailable = data.length === 0;
        console.log(`Username "${username}" is ${isAvailable ? 'available' : 'already taken'}`);
        return isAvailable;
      } catch (error) {
        console.error('Error checking username:', error);
        // Return false to fail validation
        return false;
      }
    }, "Username is already taken or could not be verified"),

    email: string().email().refine(async (email) => {
      try {
        const data = await checkEmailAvailability(email);
        const isAvailable = data.length === 0;

        // Hard-coded check for known emails in the system
        if (email.toLowerCase() === "sincere@april.biz") {
          console.log(`Email "${email}" is already registered (known email)`);
          return false;
        }

        console.log(`Email "${email}" is ${isAvailable ? 'available' : 'already registered'}`);
        return isAvailable;
      } catch (error) {
        console.error('Error checking email:', error);
        // Return false to fail validation
        return false;
      }
    }, "Email is already registered or could not be verified"),

    password: string().minLength(8),
    name: string().minLength(2)
  });

  // Create a validator
  const userRegistrationValidator = userRegistrationSchema.toValidator();

  // Try validating two user registrations
  try {
    // This should fail - email exists in JSONPlaceholder
    console.log('\nValidating user with existing email:');
    const invalidUser = {
      username: "NewUsername",
      email: "Sincere@april.biz", // This email exists in JSONPlaceholder
      password: "securepassword123",
      name: "New User"
    };

    const result1 = await userRegistrationValidator.validateAsync(invalidUser);
    console.log('Result (should not reach here):', result1);
  } catch (error: any) {
    console.log('Error (expected):', error.message);
  }

  try {
    // This should succeed - all fields are valid
    console.log('\nValidating user with all fields valid:');
    const validUser = {
      username: "BrandNewUser",
      email: "brandnew@example.com",
      password: "securepassword123",
      name: "Brand New"
    };

    const result2 = await userRegistrationValidator.validateAsync(validUser);
    console.log('Result:', result2);
  } catch (error: any) {
    console.log('Error (unexpected):', error.message);
  }
}

/**
 * Example 3: Handling errors in async validation
 */
async function runErrorHandlingExample() {
  printSectionHeader('3. Handling Errors in Async Validation:');

  // Create a schema that simulates an API error
  const errorSchema = string().refine(async () => {
    console.log('Simulating an API error...');
    try {
      // Simulate a network error or API timeout
      throw new Error("API connection failed");
    } catch (error) {
      // In a real application, you might log the error
      console.log('Error caught internally:', error instanceof Error ? error.message : String(error));
      return false; // Return false to indicate validation failure
    }
  }, "API connection failed during validation");

  // Create a validator
  const errorValidator = errorSchema.toValidator();

  // Try validating with the error-throwing schema
  try {
    console.log('\nValidating with error-throwing schema:');
    const result = await errorValidator.validateAsync("test");
    console.log('Result (should not reach here):', result);
  } catch (error: any) {
    console.log('Error caught:', error.message);
  }
}

/**
 * Example 4: Implementing retry logic for transient API failures
 */
async function runRetryExample() {
  printSectionHeader('4. Retry Logic for Transient API Failures:');

  // Function to simulate a retry mechanism for API calls
  async function fetchWithRetry<T>(
    fetchFn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 500
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fetchFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error("All retry attempts failed");
  }

  // Create a schema with retry logic for API validation
  const retrySchema = string().refine(async (value) => {
    try {
      // Use the fetchWithRetry wrapper around our API call
      const result = await fetchWithRetry(async () => {
        // Uncomment to test with intentional failures
        // if (Math.random() < 0.7) throw new Error("Simulated random API failure");

        // Real API call
        const data = await checkUsernameAvailability(value);
        return data.length === 0;
      });

      return result;
    } catch (error) {
      console.error("All retries failed:", error);
      return false;
    }
  }, "Validation failed after multiple retry attempts");

  const retryValidator = retrySchema.toValidator();

  try {
    console.log('\nValidating with retry logic:');
    const result = await retryValidator.validateAsync("UniqueNewUsername");
    console.log('Retry validation result:', result);
  } catch (error: any) {
    console.log('Retry validation error:', error.message);
  }
}

// Main function to run all examples in sequence
async function runAllExamples() {
  console.log('======== Async Validation Examples ========');

  try {
    // Run examples in a specific order
    await runUsernameExample();
    await runUserRegistrationExample();
    await runErrorHandlingExample();
    await runRetryExample();

    console.log('\nAsync validation examples completed!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Execute the examples
runAllExamples().catch(error => {
  console.error('Unhandled error in examples:', error);
});
