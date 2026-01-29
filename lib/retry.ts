/**
 * Retry Logic Utility
 * Implements exponential backoff strategy for failed API calls
 * Validates: Requirements 7 (Stability)
 *
 * Features:
 * - Exponential backoff with configurable base delay
 * - Maximum 3 retries per request
 * - Jitter to prevent thundering herd
 * - Configurable retry conditions
 * - Detailed logging for debugging
 */

export interface RetryOptions {
	maxRetries?: number;
	initialDelayMs?: number;
	maxDelayMs?: number;
	backoffMultiplier?: number;
	shouldRetry?: (error: any, attempt: number) => boolean;
	onRetry?: (error: any, attempt: number, nextDelayMs: number) => void;
}

export interface RetryResult<T> {
	success: boolean;
	data?: T;
	error?: any;
	attempts: number;
	lastError?: Error;
}

/**
 * Default retry options
 * - Max 3 retries (4 total attempts)
 * - Initial delay: 100ms
 * - Max delay: 3000ms
 * - Exponential backoff with 2x multiplier
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
	maxRetries: 3,
	initialDelayMs: 100,
	maxDelayMs: 3000,
	backoffMultiplier: 2,
	shouldRetry: (error: any) => {
		// Retry on network errors and 5xx errors
		if (error instanceof TypeError) {
			// Network errors
			return true;
		}
		if (error?.status >= 500) {
			// Server errors
			return true;
		}
		if (error?.status === 429) {
			// Rate limit
			return true;
		}
		if (error?.message?.includes("timeout")) {
			// Timeout errors
			return true;
		}
		return false;
	},
	onRetry: (error: any, attempt: number, nextDelayMs: number) => {
		console.warn(`[Retry] Attempt ${attempt} failed, retrying in ${nextDelayMs}ms:`, error?.message || error);
	},
};

/**
 * Calculate delay with exponential backoff and jitter
 * Formula: min(initialDelay * (multiplier ^ attempt) + jitter, maxDelay)
 */
function calculateBackoffDelay(attempt: number, initialDelayMs: number, maxDelayMs: number, backoffMultiplier: number): number {
	// Exponential backoff: initialDelay * (multiplier ^ attempt)
	const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);

	// Add jitter: random value between 0 and exponentialDelay * 0.1
	const jitter = Math.random() * exponentialDelay * 0.1;

	// Cap at maxDelay
	return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Result with success status, data, and attempt count
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => fetch('/api/config'),
 *   { maxRetries: 3 }
 * );
 *
 * if (result.success) {
 *   console.log('Success after', result.attempts, 'attempts');
 * } else {
 *   console.error('Failed after', result.attempts, 'attempts:', result.lastError);
 * }
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<RetryResult<T>> {
	const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
	let lastError: Error | undefined;
	let attempts = 0;

	for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
		attempts = attempt + 1;

		try {
			const data = await fn();
			if (attempt > 0) {
				console.log(`[Retry] Success after ${attempt} retries`);
			}
			return { success: true, data, attempts };
		} catch (error: any) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Check if we should retry
			if (attempt < opts.maxRetries && opts.shouldRetry(error, attempt)) {
				const delayMs = calculateBackoffDelay(attempt, opts.initialDelayMs, opts.maxDelayMs, opts.backoffMultiplier);

				opts.onRetry(error, attempt + 1, delayMs);
				await sleep(delayMs);
				continue;
			}

			// Don't retry: either max retries reached or shouldRetry returned false
			return {
				success: false,
				error,
				attempts,
				lastError,
			};
		}
	}

	return {
		success: false,
		error: lastError,
		attempts,
		lastError,
	};
}

/**
 * Retry a fetch request with exponential backoff
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param retryOptions - Retry options
 * @returns Fetch response
 *
 * @example
 * const response = await retryFetch('/api/config', {
 *   method: 'GET',
 * });
 *
 * if (!response.ok) {
 *   throw new Error(`HTTP ${response.status}`);
 * }
 */
export async function retryFetch(url: string, fetchOptions: RequestInit = {}, retryOptions: RetryOptions = {}): Promise<Response> {
	const result = await retryWithBackoff(() => fetch(url, fetchOptions), {
		...retryOptions,
		shouldRetry: (error: any, attempt: number) => {
			// Default: retry on network errors and 5xx
			if (error instanceof TypeError) {
				return true;
			}
			// For fetch, we need to check response status
			// This will be handled by the caller
			return retryOptions.shouldRetry?.(error, attempt) ?? true;
		},
	});

	if (!result.success) {
		throw result.lastError;
	}

	return result.data!;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
	if (error instanceof TypeError) {
		// Network errors
		return true;
	}
	if (error?.status >= 500) {
		// Server errors
		return true;
	}
	if (error?.status === 429) {
		// Rate limit
		return true;
	}
	if (error?.message?.includes("timeout")) {
		// Timeout errors
		return true;
	}
	return false;
}

/**
 * Get retry delay for a specific attempt
 */
export function getRetryDelay(
	attempt: number,
	initialDelayMs: number = DEFAULT_RETRY_OPTIONS.initialDelayMs,
	maxDelayMs: number = DEFAULT_RETRY_OPTIONS.maxDelayMs,
	backoffMultiplier: number = DEFAULT_RETRY_OPTIONS.backoffMultiplier,
): number {
	return calculateBackoffDelay(attempt, initialDelayMs, maxDelayMs, backoffMultiplier);
}
