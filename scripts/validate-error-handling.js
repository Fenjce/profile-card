#!/usr/bin/env node

/**
 * Validation script for API Error Handling
 * Validates: Requirements 6 (Stability)
 *
 * This script verifies that:
 * 1. All API endpoints have try-catch blocks
 * 2. Error responses are properly formatted
 * 3. Errors are logged for debugging
 * 4. Proper HTTP status codes are returned
 * 5. Error messages are user-friendly
 */

const fs = require("fs");
const path = require("path");

const API_ROUTES = ["app/api/ai-message/route.ts", "app/api/config/route.ts", "app/api/logs/route.ts", "app/api/upload/route.ts"];

let passCount = 0;
let failCount = 0;

function log(message, type = "info") {
	const colors = {
		info: "\x1b[36m",
		success: "\x1b[32m",
		error: "\x1b[31m",
		warning: "\x1b[33m",
		reset: "\x1b[0m",
	};

	const color = colors[type] || colors.info;
	console.log(`${color}${message}${colors.reset}`);
}

function pass(message) {
	passCount++;
	log(`✓ ${message}`, "success");
}

function fail(message) {
	failCount++;
	log(`✗ ${message}`, "error");
}

function check(condition, passMsg, failMsg) {
	if (condition) {
		pass(passMsg);
	} else {
		fail(failMsg);
	}
}

log("\n=== API Error Handling Validation ===\n");

// Test 1: Verify all API endpoints have try-catch blocks
log("Test 1: Verify try-catch blocks in all endpoints");
API_ROUTES.forEach((routePath) => {
	const fullPath = path.join(process.cwd(), routePath);
	const content = fs.readFileSync(fullPath, "utf-8");

	const hasTry = content.includes("try {");
	const hasCatch = content.includes("} catch (");
	const hasErrorLog = /console\.(error|warn)\(\s*"?\[/.test(content);

	check(hasTry && hasCatch, `${routePath}: Has try-catch blocks`, `${routePath}: Missing try-catch blocks`);

	check(hasErrorLog, `${routePath}: Logs errors with context`, `${routePath}: Missing error logging with context`);
});

// Test 2: Verify error responses are properly formatted
log("\nTest 2: Verify error response formatting");
API_ROUTES.forEach((routePath) => {
	const fullPath = path.join(process.cwd(), routePath);
	const content = fs.readFileSync(fullPath, "utf-8");

	const hasJsonResponse = content.includes("NextResponse.json");
	const hasErrorField = /error:\s*["']/.test(content);
	const hasStatusCode = /status:\s*\d{3}/.test(content);

	check(hasJsonResponse, `${routePath}: Uses NextResponse.json for errors`, `${routePath}: Missing NextResponse.json`);

	check(hasErrorField, `${routePath}: Includes error field in response`, `${routePath}: Missing error field`);

	check(hasStatusCode, `${routePath}: Includes HTTP status codes`, `${routePath}: Missing HTTP status codes`);
});

// Test 3: Verify proper HTTP status codes
log("\nTest 3: Verify HTTP status codes");
const expectedStatusCodes = [400, 401, 403, 500, 502, 503, 507];
API_ROUTES.forEach((routePath) => {
	const fullPath = path.join(process.cwd(), routePath);
	const content = fs.readFileSync(fullPath, "utf-8");

	const hasStatusCode = expectedStatusCodes.some((code) => content.includes(`status: ${code}`));

	check(hasStatusCode, `${routePath}: Uses appropriate status codes`, `${routePath}: Missing appropriate status codes`);
});

// Test 4: Verify AI message endpoint validation
log("\nTest 4: Verify AI message endpoint error handling");
const aiContent = fs.readFileSync(path.join(process.cwd(), "app/api/ai-message/route.ts"), "utf-8");

check(aiContent.includes("Invalid JSON in request body"), "AI endpoint: Validates JSON parsing", "AI endpoint: Missing JSON validation");

check(aiContent.includes("Missing required field"), "AI endpoint: Validates required fields", "AI endpoint: Missing field validation");

check(aiContent.includes("Network error"), "AI endpoint: Handles network errors", "AI endpoint: Missing network error handling");

// Test 5: Verify config endpoint authentication
log("\nTest 5: Verify config endpoint authentication");
const configContent = fs.readFileSync(path.join(process.cwd(), "app/api/config/route.ts"), "utf-8");

check(
	configContent.includes("authorization"),
	"Config endpoint: Validates authorization header",
	"Config endpoint: Missing authorization validation",
);

check(configContent.includes("Invalid credentials"), "Config endpoint: Validates credentials", "Config endpoint: Missing credential validation");

check(configContent.includes("Invalid token format"), "Config endpoint: Validates token format", "Config endpoint: Missing token format validation");

check(configContent.includes("Redis not configured"), "Config endpoint: Handles Redis failures", "Config endpoint: Missing Redis error handling");

// Test 6: Verify upload endpoint validation
log("\nTest 6: Verify upload endpoint validation");
const uploadContent = fs.readFileSync(path.join(process.cwd(), "app/api/upload/route.ts"), "utf-8");

check(uploadContent.includes("BLOB_READ_WRITE_TOKEN"), "Upload endpoint: Validates token configuration", "Upload endpoint: Missing token validation");

check(uploadContent.includes("No file provided"), "Upload endpoint: Validates file presence", "Upload endpoint: Missing file validation");

check(uploadContent.includes("File size"), "Upload endpoint: Validates file size", "Upload endpoint: Missing file size validation");

check(uploadContent.includes("file type"), "Upload endpoint: Validates file type", "Upload endpoint: Missing file type validation");

// Test 7: Verify logs endpoint KV handling
log("\nTest 7: Verify logs endpoint KV handling");
const logsContent = fs.readFileSync(path.join(process.cwd(), "app/api/logs/route.ts"), "utf-8");

check(logsContent.includes("getKVClient"), "Logs endpoint: Has KV client helper", "Logs endpoint: Missing KV client helper");

check(logsContent.includes("Vercel KV not available"), "Logs endpoint: Handles missing KV", "Logs endpoint: Missing KV availability check");

check(logsContent.includes("Error fetching logs"), "Logs endpoint: Handles GET errors", "Logs endpoint: Missing GET error handling");

check(logsContent.includes("Error saving log"), "Logs endpoint: Handles POST errors", "Logs endpoint: Missing POST error handling");

// Test 8: Verify error messages don't expose sensitive info
log("\nTest 8: Verify error messages security");
check(!configContent.includes("error: error."), "Config endpoint: Doesn't expose raw errors", "Config endpoint: Exposes raw error objects");

check(/password\s*\?\s*["']?\*\*\*["']?/.test(configContent), "Config endpoint: Masks passwords in logs", "Config endpoint: Doesn't mask passwords");

// Summary
log("\n=== Validation Summary ===");
log(`Passed: ${passCount}`, "success");
log(`Failed: ${failCount}`, failCount > 0 ? "error" : "success");

if (failCount > 0) {
	process.exit(1);
} else {
	log("\n✓ All error handling validations passed!", "success");
	process.exit(0);
}
