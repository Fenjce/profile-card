/**
 * Test file for Retry Logic Implementation
 * Validates: Requirements 7 (Stability)
 *
 * This test suite verifies that:
 * 1. Retry logic retries failed API calls
 * 2. Exponential backoff strategy is implemented correctly
 * 3. Maximum 3 retries per request is enforced
 * 4. Jitter is added to prevent thundering herd
 * 5. Configurable retry conditions work correctly
 */

import { retryWithBackoff, isRetryableError, getRetryDelay } from "./retry";

describe("Retry Logic Implementation", () => {
	/**
	 * Test 1: Verify retry logic retries failed API calls
	 * Validates: Requirements 7 - Retry failed API calls
	 */
	test("should retry failed API calls", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				if (attemptCount < 3) {
					throw new Error("Network error");
				}
				return "success";
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
			},
		);

		expect(result.success).toBe(true);
		expect(result.data).toBe("success");
		expect(result.attempts).toBe(3);
		expect(attemptCount).toBe(3);
	});

	/**
	 * Test 2: Verify exponential backoff strategy
	 * Validates: Requirements 7 - Exponential backoff strategy
	 */
	test("should implement exponential backoff", () => {
		// Test delay calculation for different attempts
		const delay0 = getRetryDelay(0, 100, 3000, 2);
		const delay1 = getRetryDelay(1, 100, 3000, 2);
		const delay2 = getRetryDelay(2, 100, 3000, 2);

		// Each delay should be approximately 2x the previous (plus jitter)
		// delay0 ≈ 100ms
		// delay1 ≈ 200ms
		// delay2 ≈ 400ms

		expect(delay0).toBeGreaterThanOrEqual(100);
		expect(delay0).toBeLessThanOrEqual(110); // 100 + 10% jitter

		expect(delay1).toBeGreaterThanOrEqual(200);
		expect(delay1).toBeLessThanOrEqual(220); // 200 + 10% jitter

		expect(delay2).toBeGreaterThanOrEqual(400);
		expect(delay2).toBeLessThanOrEqual(440); // 400 + 10% jitter
	});

	/**
	 * Test 3: Verify maximum 3 retries per request
	 * Validates: Requirements 7 - Max 3 retries per request
	 */
	test("should enforce maximum 3 retries", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				throw new Error("Persistent error");
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
			},
		);

		expect(result.success).toBe(false);
		expect(result.attempts).toBe(4); // 1 initial + 3 retries
		expect(attemptCount).toBe(4);
	});

	/**
	 * Test 4: Verify jitter prevents thundering herd
	 * Validates: Requirements 7 - Jitter to prevent thundering herd
	 */
	test("should add jitter to prevent thundering herd", () => {
		const delays: number[] = [];

		// Get multiple delay calculations for the same attempt
		for (let i = 0; i < 10; i++) {
			const delay = getRetryDelay(1, 100, 3000, 2);
			delays.push(delay);
		}

		// Delays should vary due to jitter
		const uniqueDelays = new Set(delays);
		expect(uniqueDelays.size).toBeGreaterThan(1);

		// All delays should be within expected range
		delays.forEach((delay) => {
			expect(delay).toBeGreaterThanOrEqual(200);
			expect(delay).toBeLessThanOrEqual(220);
		});
	});

	/**
	 * Test 5: Verify configurable retry conditions
	 * Validates: Requirements 7 - Configurable retry conditions
	 */
	test("should respect custom shouldRetry condition", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				throw new Error("Custom error");
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
				shouldRetry: () => false, // Never retry
			},
		);

		expect(result.success).toBe(false);
		expect(result.attempts).toBe(1); // Only initial attempt
		expect(attemptCount).toBe(1);
	});

	/**
	 * Test 6: Verify retry on network errors
	 * Validates: Requirements 7 - Retry on network errors
	 */
	test("should retry on network errors", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				if (attemptCount < 2) {
					throw new TypeError("Network error");
				}
				return "success";
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
			},
		);

		expect(result.success).toBe(true);
		expect(result.attempts).toBe(2);
	});

	/**
	 * Test 7: Verify retry on server errors (5xx)
	 * Validates: Requirements 7 - Retry on server errors
	 */
	test("should retry on server errors", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				if (attemptCount < 2) {
					const error = new Error("Server error");
					(error as any).status = 503;
					throw error;
				}
				return "success";
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
			},
		);

		expect(result.success).toBe(true);
		expect(result.attempts).toBe(2);
	});

	/**
	 * Test 8: Verify retry on rate limit (429)
	 * Validates: Requirements 7 - Retry on rate limit
	 */
	test("should retry on rate limit errors", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				if (attemptCount < 2) {
					const error = new Error("Rate limit");
					(error as any).status = 429;
					throw error;
				}
				return "success";
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
			},
		);

		expect(result.success).toBe(true);
		expect(result.attempts).toBe(2);
	});

	/**
	 * Test 9: Verify no retry on client errors (4xx)
	 * Validates: Requirements 7 - Don't retry on client errors
	 */
	test("should not retry on client errors", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				const error = new Error("Bad request");
				(error as any).status = 400;
				throw error;
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
			},
		);

		expect(result.success).toBe(false);
		expect(result.attempts).toBe(1); // Only initial attempt
	});

	/**
	 * Test 10: Verify delay cap at maxDelayMs
	 * Validates: Requirements 7 - Delay capped at maxDelayMs
	 */
	test("should cap delay at maxDelayMs", () => {
		const maxDelay = 500;

		// Calculate delay for a high attempt number
		const delay = getRetryDelay(10, 100, maxDelay, 2);

		expect(delay).toBeLessThanOrEqual(maxDelay);
	});

	/**
	 * Test 11: Verify isRetryableError utility
	 * Validates: Requirements 7 - Utility to check if error is retryable
	 */
	test("should correctly identify retryable errors", () => {
		// Network error
		expect(isRetryableError(new TypeError("Network error"))).toBe(true);

		// Server error
		expect(isRetryableError({ status: 500 })).toBe(true);
		expect(isRetryableError({ status: 503 })).toBe(true);

		// Rate limit
		expect(isRetryableError({ status: 429 })).toBe(true);

		// Timeout
		expect(isRetryableError({ message: "timeout" })).toBe(true);

		// Client error (not retryable)
		expect(isRetryableError({ status: 400 })).toBe(false);
		expect(isRetryableError({ status: 401 })).toBe(false);

		// Unknown error (not retryable)
		expect(isRetryableError({ status: 200 })).toBe(false);
	});

	/**
	 * Test 12: Verify onRetry callback is called
	 * Validates: Requirements 7 - Callback for retry events
	 */
	test("should call onRetry callback on retry", async () => {
		let attemptCount = 0;
		const retryEvents: Array<{ attempt: number; delay: number }> = [];

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				if (attemptCount < 2) {
					throw new Error("Error");
				}
				return "success";
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
				onRetry: (error, attempt, delay) => {
					retryEvents.push({ attempt, delay });
				},
			},
		);

		expect(result.success).toBe(true);
		expect(retryEvents.length).toBe(1);
		expect(retryEvents[0].attempt).toBe(1);
		expect(retryEvents[0].delay).toBeGreaterThan(0);
	});

	/**
	 * Test 13: Verify result contains attempt count
	 * Validates: Requirements 7 - Result includes attempt count
	 */
	test("should include attempt count in result", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				if (attemptCount < 3) {
					throw new Error("Error");
				}
				return "success";
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
			},
		);

		expect(result.attempts).toBe(3);
		expect(result.attempts).toBe(attemptCount);
	});

	/**
	 * Test 14: Verify result contains error on failure
	 * Validates: Requirements 7 - Result includes error information
	 */
	test("should include error in result on failure", async () => {
		const testError = new Error("Test error");

		const result = await retryWithBackoff(
			async () => {
				throw testError;
			},
			{
				maxRetries: 1,
				initialDelayMs: 10,
				maxDelayMs: 100,
				shouldRetry: () => false,
			},
		);

		expect(result.success).toBe(false);
		expect(result.error).toBe(testError);
		expect(result.lastError).toBe(testError);
	});

	/**
	 * Test 15: Verify exponential backoff with custom multiplier
	 * Validates: Requirements 7 - Configurable backoff multiplier
	 */
	test("should respect custom backoff multiplier", () => {
		// With multiplier 3
		const delay0 = getRetryDelay(0, 100, 10000, 3);
		const delay1 = getRetryDelay(1, 100, 10000, 3);
		const delay2 = getRetryDelay(2, 100, 10000, 3);

		// delay0 ≈ 100ms
		// delay1 ≈ 300ms (100 * 3)
		// delay2 ≈ 900ms (100 * 3^2)

		expect(delay0).toBeGreaterThanOrEqual(100);
		expect(delay0).toBeLessThanOrEqual(110);

		expect(delay1).toBeGreaterThanOrEqual(300);
		expect(delay1).toBeLessThanOrEqual(330);

		expect(delay2).toBeGreaterThanOrEqual(900);
		expect(delay2).toBeLessThanOrEqual(990);
	});

	/**
	 * Test 16: Verify successful call on first attempt
	 * Validates: Requirements 7 - No unnecessary retries
	 */
	test("should not retry on successful first attempt", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				return "success";
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
			},
		);

		expect(result.success).toBe(true);
		expect(result.attempts).toBe(1);
		expect(attemptCount).toBe(1);
	});

	/**
	 * Test 17: Verify timeout error is retryable
	 * Validates: Requirements 7 - Retry on timeout
	 */
	test("should retry on timeout errors", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				if (attemptCount < 2) {
					throw new Error("Request timeout");
				}
				return "success";
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
			},
		);

		expect(result.success).toBe(true);
		expect(result.attempts).toBe(2);
	});

	/**
	 * Test 18: Verify multiple retries with different errors
	 * Validates: Requirements 7 - Retry multiple times
	 */
	test("should retry multiple times with different errors", async () => {
		let attemptCount = 0;

		const result = await retryWithBackoff(
			async () => {
				attemptCount++;
				if (attemptCount === 1) {
					throw new TypeError("Network error");
				}
				if (attemptCount === 2) {
					const error = new Error("Server error");
					(error as any).status = 503;
					throw error;
				}
				if (attemptCount === 3) {
					const error = new Error("Rate limit");
					(error as any).status = 429;
					throw error;
				}
				return "success";
			},
			{
				maxRetries: 3,
				initialDelayMs: 10,
				maxDelayMs: 100,
			},
		);

		expect(result.success).toBe(true);
		expect(result.attempts).toBe(4);
		expect(attemptCount).toBe(4);
	});

	/**
	 * Test 19: Verify delay increases with each retry
	 * Validates: Requirements 7 - Exponential backoff increases delay
	 */
	test("should increase delay with each retry", () => {
		const delays: number[] = [];

		for (let i = 0; i < 4; i++) {
			const delay = getRetryDelay(i, 100, 10000, 2);
			delays.push(delay);
		}

		// Each delay should be greater than or equal to the previous
		for (let i = 1; i < delays.length; i++) {
			expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
		}
	});

	/**
	 * Test 20: Verify result structure on success
	 * Validates: Requirements 7 - Result structure
	 */
	test("should have correct result structure on success", async () => {
		const result = await retryWithBackoff(async () => "test data", {
			maxRetries: 3,
			initialDelayMs: 10,
			maxDelayMs: 100,
		});

		expect(result).toHaveProperty("success");
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("attempts");
		expect(result.success).toBe(true);
		expect(result.data).toBe("test data");
		expect(result.attempts).toBe(1);
	});
});
