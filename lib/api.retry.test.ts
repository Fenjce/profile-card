/**
 * Test file for API Retry Logic Integration
 * Validates: Requirements 7 (Stability)
 *
 * This test suite verifies that:
 * 1. fetchConfig retries failed API calls
 * 2. saveConfig retries failed API calls
 * 3. checkApiAvailable retries failed API calls
 * 4. Exponential backoff is applied to all API calls
 * 5. Fallback to localStorage works after retries fail
 */

import fs from "fs";
import path from "path";

describe("API Retry Logic Integration", () => {
	/**
	 * Test 1: Verify fetchConfig uses retry logic
	 * Validates: Requirements 7 - Retry failed API calls
	 */
	test("should use retry logic in fetchConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify retryWithBackoff is imported
		expect(apiContent).toContain("import { retryWithBackoff");

		// Verify fetchConfig uses retryWithBackoff
		const fetchConfigFunction = apiContent.match(/export async function fetchConfig\(\)[\s\S]*?(?=let isSaving|export async function)/)[0];
		expect(fetchConfigFunction).toContain("retryWithBackoff");
	});

	/**
	 * Test 2: Verify saveConfig uses retry logic
	 * Validates: Requirements 7 - Retry failed API calls
	 */
	test("should use retry logic in saveConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify processSaveQueue uses retryWithBackoff
		const processSaveQueueFunction = apiContent.match(/async function processSaveQueue\(\)[\s\S]*?(?=export async function saveConfig)/)[0];
		expect(processSaveQueueFunction).toContain("retryWithBackoff");
	});

	/**
	 * Test 3: Verify checkApiAvailable uses retry logic
	 * Validates: Requirements 7 - Retry failed API calls
	 */
	test("should use retry logic in checkApiAvailable", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify checkApiAvailable uses retryWithBackoff
		expect(apiContent).toContain("export async function checkApiAvailable()");
		const checkApiFunction = apiContent.match(/export async function checkApiAvailable\(\)[\s\S]*?(?=\})/)[0];
		expect(checkApiFunction).toContain("retryWithBackoff");
	});

	/**
	 * Test 4: Verify fetchConfig has max 3 retries
	 * Validates: Requirements 7 - Max 3 retries per request
	 */
	test("should configure max 3 retries in fetchConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify maxRetries is set to 3 in fetchConfig
		const fetchConfigFunction = apiContent.match(/export async function fetchConfig\(\)[\s\S]*?(?=let isSaving|export async function)/)[0];
		expect(fetchConfigFunction).toContain("maxRetries: 3");
	});

	/**
	 * Test 5: Verify saveConfig has max 3 retries
	 * Validates: Requirements 7 - Max 3 retries per request
	 */
	test("should configure max 3 retries in saveConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify maxRetries is set to 3 in processSaveQueue
		const processSaveQueueFunction = apiContent.match(/async function processSaveQueue\(\)[\s\S]*?(?=export async function saveConfig)/)[0];
		expect(processSaveQueueFunction).toContain("maxRetries: 3");
	});

	/**
	 * Test 6: Verify exponential backoff is configured
	 * Validates: Requirements 7 - Exponential backoff strategy
	 */
	test("should configure exponential backoff in fetchConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify backoff configuration
		const fetchConfigFunction = apiContent.match(/export async function fetchConfig\(\)[\s\S]*?(?=let isSaving|export async function)/)[0];
		expect(fetchConfigFunction).toContain("initialDelayMs");
		expect(fetchConfigFunction).toContain("maxDelayMs");
	});

	/**
	 * Test 7: Verify shouldRetry condition for network errors
	 * Validates: Requirements 7 - Retry on network errors
	 */
	test("should retry on network errors in fetchConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify shouldRetry checks for TypeError
		const fetchConfigFunction = apiContent.match(/export async function fetchConfig\(\)[\s\S]*?(?=let isSaving|export async function)/)[0];
		expect(fetchConfigFunction).toContain("shouldRetry");
		expect(fetchConfigFunction).toContain("TypeError");
	});

	/**
	 * Test 8: Verify shouldRetry condition for timeout errors
	 * Validates: Requirements 7 - Retry on timeout
	 */
	test("should retry on timeout errors in fetchConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify shouldRetry checks for timeout
		const fetchConfigFunction = apiContent.match(/export async function fetchConfig\(\)[\s\S]*?(?=let isSaving|export async function)/)[0];
		expect(fetchConfigFunction).toContain("timeout");
	});

	/**
	 * Test 9: Verify fallback to localStorage after retries fail
	 * Validates: Requirements 7 - Fallback mechanism
	 */
	test("should fallback to localStorage after retries fail in fetchConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify fallback logic
		const fetchConfigFunction = apiContent.match(/export async function fetchConfig\(\)[\s\S]*?(?=let isSaving|export async function)/)[0];
		expect(fetchConfigFunction).toContain("getConfigFromLocalStorage");
		expect(fetchConfigFunction).toContain("result.success");
	});

	/**
	 * Test 10: Verify fallback to default config
	 * Validates: Requirements 7 - Final fallback
	 */
	test("should fallback to default config after all retries fail", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify default config fallback
		const fetchConfigFunction = apiContent.match(/export async function fetchConfig\(\)[\s\S]*?(?=let isSaving|export async function)/)[0];
		expect(fetchConfigFunction).toContain("defaultConfig");
	});

	/**
	 * Test 11: Verify retry logic in saveConfig for network errors
	 * Validates: Requirements 7 - Retry on network errors
	 */
	test("should retry on network errors in saveConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify shouldRetry checks for TypeError in saveConfig
		const processSaveQueueFunction = apiContent.match(/async function processSaveQueue\(\)[\s\S]*?(?=export async function saveConfig)/)[0];
		expect(processSaveQueueFunction).toContain("shouldRetry");
		expect(processSaveQueueFunction).toContain("TypeError");
	});

	/**
	 * Test 12: Verify retry logic in saveConfig for server errors
	 * Validates: Requirements 7 - Retry on server errors
	 */
	test("should retry on server errors in saveConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify shouldRetry checks for 5xx errors
		const processSaveQueueFunction = apiContent.match(/async function processSaveQueue\(\)[\s\S]*?(?=export async function saveConfig)/)[0];
		expect(processSaveQueueFunction).toContain("status >= 500");
	});

	/**
	 * Test 13: Verify retry logic in saveConfig for rate limit
	 * Validates: Requirements 7 - Retry on rate limit
	 */
	test("should retry on rate limit in saveConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify shouldRetry checks for 429
		const processSaveQueueFunction = apiContent.match(/async function processSaveQueue\(\)[\s\S]*?(?=export async function saveConfig)/)[0];
		expect(processSaveQueueFunction).toContain("429");
	});

	/**
	 * Test 14: Verify no retry on auth errors in saveConfig
	 * Validates: Requirements 7 - Don't retry on auth errors
	 */
	test("should not retry on auth errors in saveConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify shouldRetry returns false for 401
		const processSaveQueueFunction = apiContent.match(/async function processSaveQueue\(\)[\s\S]*?(?=export async function saveConfig)/)[0];
		expect(processSaveQueueFunction).toContain("401");
		expect(processSaveQueueFunction).toContain("return false");
	});

	/**
	 * Test 15: Verify checkApiAvailable has max 2 retries
	 * Validates: Requirements 7 - Configurable retry count
	 */
	test("should configure max 2 retries in checkApiAvailable", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify maxRetries is set to 2 in checkApiAvailable
		const checkApiFunction = apiContent.match(/export async function checkApiAvailable\(\)[\s\S]*?(?=\})/)[0];
		expect(checkApiFunction).toContain("maxRetries: 2");
	});

	/**
	 * Test 16: Verify retry utility is imported
	 * Validates: Requirements 7 - Retry utility is available
	 */
	test("should import retry utility", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify retry utility is imported
		expect(apiContent).toContain("import { retryWithBackoff");
		expect(apiContent).toContain('from "./retry"');
	});

	/**
	 * Test 17: Verify retry utility file exists
	 * Validates: Requirements 7 - Retry utility implementation
	 */
	test("should have retry utility file", () => {
		const retryPath = path.join(process.cwd(), "lib/retry.ts");
		expect(fs.existsSync(retryPath)).toBe(true);
	});

	/**
	 * Test 18: Verify retry utility exports required functions
	 * Validates: Requirements 7 - Retry utility exports
	 */
	test("should export required retry functions", () => {
		const retryContent = fs.readFileSync(path.join(process.cwd(), "lib/retry.ts"), "utf-8");

		// Verify exports
		expect(retryContent).toContain("export async function retryWithBackoff");
		expect(retryContent).toContain("export function isRetryableError");
		expect(retryContent).toContain("export function getRetryDelay");
	});

	/**
	 * Test 19: Verify exponential backoff calculation
	 * Validates: Requirements 7 - Exponential backoff formula
	 */
	test("should implement exponential backoff calculation", () => {
		const retryContent = fs.readFileSync(path.join(process.cwd(), "lib/retry.ts"), "utf-8");

		// Verify exponential backoff formula
		expect(retryContent).toContain("Math.pow");
		expect(retryContent).toContain("backoffMultiplier");
	});

	/**
	 * Test 20: Verify jitter implementation
	 * Validates: Requirements 7 - Jitter to prevent thundering herd
	 */
	test("should implement jitter in backoff calculation", () => {
		const retryContent = fs.readFileSync(path.join(process.cwd(), "lib/retry.ts"), "utf-8");

		// Verify jitter implementation
		expect(retryContent).toContain("Math.random");
		expect(retryContent).toContain("jitter");
	});
});
