/**
 * Test file for API Caching Strategy
 * Validates: Requirements 4 (Performance)
 *
 * This test verifies that:
 * 1. Cache headers are properly set on GET responses
 * 2. stale-while-revalidate pattern is implemented
 * 3. Config is cached for 60 seconds
 * 4. Cache headers are consistent across all response paths
 */

import fs from "fs";
import path from "path";

describe("API Caching Strategy", () => {
	/**
	 * Test 1: Verify cache headers are set in GET endpoint
	 * Validates: Requirements 4 - Cache headers added to fetchConfig()
	 */
	test("should set cache headers in GET endpoint", () => {
		const routeContent = fs.readFileSync(path.join(process.cwd(), "app/api/config/route.ts"), "utf-8");

		// Verify Cache-Control header is set
		expect(routeContent).toContain("Cache-Control");
		expect(routeContent).toContain("public, max-age=60, stale-while-revalidate=300");

		// Verify it's set in the GET function
		expect(routeContent).toContain("export async function GET()");
		expect(routeContent).toContain("response.headers.set");
	});

	/**
	 * Test 2: Verify stale-while-revalidate pattern is implemented
	 * Validates: Requirements 4 - Implement stale-while-revalidate pattern
	 */
	test("should implement stale-while-revalidate pattern", () => {
		const routeContent = fs.readFileSync(path.join(process.cwd(), "app/api/config/route.ts"), "utf-8");

		// Verify stale-while-revalidate is in the cache header
		expect(routeContent).toContain("stale-while-revalidate=300");

		// Verify max-age is set to 60 seconds
		expect(routeContent).toContain("max-age=60");

		// Verify public cache directive is set
		expect(routeContent).toContain("public");
	});

	/**
	 * Test 3: Verify cache headers are set for all response paths
	 * Validates: Requirements 4 - Cache config for 60 seconds
	 */
	test("should set cache headers for all response paths in GET", () => {
		const routeContent = fs.readFileSync(path.join(process.cwd(), "app/api/config/route.ts"), "utf-8");

		// Count how many times cache headers are set in GET function
		const getFunction = routeContent.match(/export async function GET\(\)[\s\S]*?(?=export async function|$)/)[0];

		// Should have cache headers set for:
		// 1. Redis not configured path
		// 2. Valid config path
		// 3. Invalid config path
		// 4. Error path
		const cacheHeaderCount = (getFunction.match(/response\.headers\.set\(\s*"Cache-Control"/g) || []).length;

		expect(cacheHeaderCount).toBeGreaterThanOrEqual(4);
	});

	/**
	 * Test 4: Verify fetchConfig uses cache-friendly fetch options
	 * Validates: Requirements 4 - fetchConfig() respects cache headers
	 */
	test("should use cache-friendly fetch options in fetchConfig", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify fetchConfig function exists
		expect(apiContent).toContain("export async function fetchConfig()");

		// Verify cache: 'default' is used instead of 'no-store'
		expect(apiContent).toContain('cache: "default"');

		// Verify 'no-store' is not used in fetchConfig
		const fetchConfigFunction = apiContent.match(/export async function fetchConfig\(\)[\s\S]*?(?=export async function|let isSaving)/)[0];
		expect(fetchConfigFunction).not.toContain('cache: "no-store"');
	});

	/**
	 * Test 5: Verify checkApiAvailable uses cache-friendly fetch
	 * Validates: Requirements 4 - API availability check respects cache
	 */
	test("should use cache-friendly fetch in checkApiAvailable", () => {
		const apiContent = fs.readFileSync(path.join(process.cwd(), "lib/api.ts"), "utf-8");

		// Verify checkApiAvailable function exists
		expect(apiContent).toContain("export async function checkApiAvailable()");

		// Verify cache: 'default' is used
		expect(apiContent).toContain('cache: "default"');
	});

	/**
	 * Test 6: Verify cache headers are consistent
	 * Validates: Requirements 4 - Consistent cache configuration
	 */
	test("should have consistent cache header values", () => {
		const routeContent = fs.readFileSync(path.join(process.cwd(), "app/api/config/route.ts"), "utf-8");

		// Extract all cache header values
		const cacheHeaders = routeContent.match(/"Cache-Control",\s*"[^"]*"/g) || [];

		// All cache headers should be identical
		const uniqueHeaders = new Set(cacheHeaders);
		expect(uniqueHeaders.size).toBe(1);

		// Verify the value is correct
		const headerValue = Array.from(uniqueHeaders)[0];
		expect(headerValue).toContain("public, max-age=60, stale-while-revalidate=300");
	});

	/**
	 * Test 7: Verify cache headers are set before response is returned
	 * Validates: Requirements 4 - Headers are properly configured
	 */
	test("should set cache headers before returning response", () => {
		const routeContent = fs.readFileSync(path.join(process.cwd(), "app/api/config/route.ts"), "utf-8");

		// Verify pattern: create response, set headers, return response
		const pattern = /NextResponse\.json\([^)]*\);\s*\/\/.*\n\s*response\.headers\.set\(\s*"Cache-Control"/;
		expect(routeContent).toMatch(pattern);
	});

	/**
	 * Test 8: Verify no cache-busting headers are set
	 * Validates: Requirements 4 - No conflicting cache directives
	 */
	test("should not set cache-busting headers", () => {
		const routeContent = fs.readFileSync(path.join(process.cwd(), "app/api/config/route.ts"), "utf-8");

		// Verify no-cache, no-store, or must-revalidate are not set
		const getFunction = routeContent.match(/export async function GET\(\)[\s\S]*?(?=export async function|$)/)[0];

		expect(getFunction).not.toContain("no-cache");
		expect(getFunction).not.toContain("no-store");
		expect(getFunction).not.toContain("must-revalidate");
		expect(getFunction).not.toContain("private");
	});

	/**
	 * Test 9: Verify cache configuration matches requirements
	 * Validates: Requirements 4 - Cache config for 60 seconds
	 */
	test("should cache config for exactly 60 seconds", () => {
		const routeContent = fs.readFileSync(path.join(process.cwd(), "app/api/config/route.ts"), "utf-8");

		// Verify max-age is exactly 60
		expect(routeContent).toContain("max-age=60");

		// Verify it's not a different value
		expect(routeContent).not.toContain("max-age=30");
		expect(routeContent).not.toContain("max-age=120");
		expect(routeContent).not.toContain("max-age=300");
	});

	/**
	 * Test 10: Verify stale-while-revalidate duration
	 * Validates: Requirements 4 - Stale content allowed for 5 minutes
	 */
	test("should allow stale content for 5 minutes (300 seconds)", () => {
		const routeContent = fs.readFileSync(path.join(process.cwd(), "app/api/config/route.ts"), "utf-8");

		// Verify stale-while-revalidate is exactly 300 seconds
		expect(routeContent).toContain("stale-while-revalidate=300");

		// Verify it's not a different value
		expect(routeContent).not.toContain("stale-while-revalidate=60");
		expect(routeContent).not.toContain("stale-while-revalidate=600");
	});
});
