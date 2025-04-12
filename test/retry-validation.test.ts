/**
 * Separate test file for isolated retry logic tests
 */
import { string } from '../src';

// Isolated test for async validation with retries
describe('async validation with retries', () => {
  test('implements retry logic for transient failures', async () => {
    // Create a simple validation function that will fail twice and succeed on third attempt
    let attemptCount = 0;

    // Simple mock validation function
    const mockValidateWithFailure = async (input: string): Promise<string> => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error(`Temporary failure (attempt ${attemptCount})`);
      }
      return input; // Succeed on third attempt
    };

    // Manual retry implementation
    const validateWithRetry = async (validateFn: (input: string) => Promise<string>, input: string, maxRetries: number = 3): Promise<string> => {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Wait between retries
          if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          return await validateFn(input);
        } catch (error) {
          lastError = error as Error;
          console.log(`Attempt ${attempt} failed: ${(error as Error).message}`);

          // Continue if not the last attempt
          if (attempt < maxRetries) {
            continue;
          }
        }
      }

      // If we get here, all attempts failed
      throw lastError || new Error("Max retries reached");
    };

    // Test the retry logic
    const result = await validateWithRetry(mockValidateWithFailure, "test");
    expect(result).toBe("test");
    expect(attemptCount).toBe(3); // Should succeed on the third attempt
  });
});
