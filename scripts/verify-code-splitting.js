#!/usr/bin/env node

/**
 * Verification script for code splitting implementation
 * Validates that dynamic imports are properly configured
 */

const fs = require("fs");
const path = require("path");

const COLORS = {
	reset: "\x1b[0m",
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
};

function log(message, color = "reset") {
	console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkDynamicImports() {
	log("\n📋 Checking Dynamic Imports...", "blue");

	const pageContent = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf-8");

	const checks = [
		{
			name: "Dynamic import statement",
			pattern: /import dynamic from "next\/dynamic"/,
		},
		{
			name: "StoryOverlay dynamic import",
			pattern: /const StoryOverlay = dynamic\(\(\) => import\("@\/components\/story\/StoryOverlay"\)/,
		},
		{
			name: "SocialModal dynamic import",
			pattern: /const SocialModal = dynamic\(\(\) => import\("@\/components\/modals\/SocialModal"\)/,
		},
		{
			name: "InformationModal dynamic import",
			pattern: /const InformationModal = dynamic\(\(\) => import\("@\/components\/modals\/InformationModal"\)/,
		},
		{
			name: "SSR disabled for modals",
			pattern: /ssr: false/,
		},
		{
			name: "Loading state provided",
			pattern: /loading: \(\) => null/,
		},
	];

	let passed = 0;
	let failed = 0;

	checks.forEach((check) => {
		if (check.pattern.test(pageContent)) {
			log(`  ✓ ${check.name}`, "green");
			passed++;
		} else {
			log(`  ✗ ${check.name}`, "red");
			failed++;
		}
	});

	return { passed, failed };
}

function checkStaticImports() {
	log("\n📋 Checking for Static Imports (should not exist)...", "blue");

	const pageContent = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf-8");

	const checks = [
		{
			name: "No static StoryOverlay import",
			pattern: /import StoryOverlay from "@\/components\/story\/StoryOverlay"/,
			shouldNotExist: true,
		},
		{
			name: "No static SocialModal import",
			pattern: /import SocialModal from "@\/components\/modals\/SocialModal"/,
			shouldNotExist: true,
		},
		{
			name: "No static InformationModal import",
			pattern: /import InformationModal from "@\/components\/modals\/InformationModal"/,
			shouldNotExist: true,
		},
	];

	let passed = 0;
	let failed = 0;

	checks.forEach((check) => {
		const exists = check.pattern.test(pageContent);
		if (check.shouldNotExist && !exists) {
			log(`  ✓ ${check.name}`, "green");
			passed++;
		} else if (check.shouldNotExist && exists) {
			log(`  ✗ ${check.name}`, "red");
			failed++;
		}
	});

	return { passed, failed };
}

function checkBuildChunks() {
	log("\n📋 Checking Build Chunks...", "blue");

	const chunksDir = path.join(process.cwd(), ".next/static/chunks");

	if (!fs.existsSync(chunksDir)) {
		log("  ✗ .next/static/chunks directory not found", "red");
		log("    Run 'npm run build' first", "yellow");
		return { passed: 0, failed: 1 };
	}

	const chunks = fs.readdirSync(chunksDir).filter((file) => file.endsWith(".js") && !file.includes("app/"));

	log(`  ✓ Found ${chunks.length} chunk files`, "green");

	// Check for main chunks
	const hasMainChunk = chunks.some((file) => file.includes("main"));
	const hasFrameworkChunk = chunks.some((file) => file.includes("framework"));

	let passed = 0;
	let failed = 0;

	if (hasMainChunk) {
		log("  ✓ Main chunk found", "green");
		passed++;
	} else {
		log("  ✗ Main chunk not found", "red");
		failed++;
	}

	if (hasFrameworkChunk) {
		log("  ✓ Framework chunk found", "green");
		passed++;
	} else {
		log("  ✗ Framework chunk not found", "red");
		failed++;
	}

	// Check page chunk size
	const appChunksDir = path.join(chunksDir, "app");
	if (fs.existsSync(appChunksDir)) {
		const pageChunks = fs.readdirSync(appChunksDir).filter((file) => file.startsWith("page-"));

		if (pageChunks.length > 0) {
			const pageChunk = pageChunks[0];
			const pageChunkPath = path.join(appChunksDir, pageChunk);
			const stats = fs.statSync(pageChunkPath);
			const sizeKB = (stats.size / 1024).toFixed(2);

			log(`  ✓ Page chunk size: ${sizeKB} KB`, "green");
			passed++;

			if (stats.size > 100 * 1024) {
				log(`  ⚠ Warning: Page chunk is larger than 100 KB (${sizeKB} KB)`, "yellow");
			}
		}
	}

	return { passed, failed };
}

function checkComponentFiles() {
	log("\n📋 Checking Component Files...", "blue");

	const components = ["components/story/StoryOverlay.tsx", "components/modals/SocialModal.tsx", "components/modals/InformationModal.tsx"];

	let passed = 0;
	let failed = 0;

	components.forEach((component) => {
		const componentPath = path.join(process.cwd(), component);
		if (fs.existsSync(componentPath)) {
			const content = fs.readFileSync(componentPath, "utf-8");
			if (content.includes("export default function")) {
				log(`  ✓ ${component} exists and exports default`, "green");
				passed++;
			} else {
				log(`  ✗ ${component} does not export default function`, "red");
				failed++;
			}
		} else {
			log(`  ✗ ${component} not found`, "red");
			failed++;
		}
	});

	return { passed, failed };
}

function main() {
	log("\n╔════════════════════════════════════════════════════════════╗", "blue");
	log("║     Code Splitting Implementation Verification Script      ║", "blue");
	log("╚════════════════════════════════════════════════════════════╝", "blue");

	let totalPassed = 0;
	let totalFailed = 0;

	// Run all checks
	let result = checkDynamicImports();
	totalPassed += result.passed;
	totalFailed += result.failed;

	result = checkStaticImports();
	totalPassed += result.passed;
	totalFailed += result.failed;

	result = checkComponentFiles();
	totalPassed += result.passed;
	totalFailed += result.failed;

	result = checkBuildChunks();
	totalPassed += result.passed;
	totalFailed += result.failed;

	// Summary
	log("\n╔════════════════════════════════════════════════════════════╗", "blue");
	log("║                      SUMMARY                               ║", "blue");
	log("╚════════════════════════════════════════════════════════════╝", "blue");

	log(`\nTotal Checks Passed: ${totalPassed}`, "green");
	if (totalFailed > 0) {
		log(`Total Checks Failed: ${totalFailed}`, "red");
	}

	if (totalFailed === 0) {
		log("\n✓ All checks passed! Code splitting is properly implemented.", "green");
		process.exit(0);
	} else {
		log("\n✗ Some checks failed. Please review the implementation.", "red");
		process.exit(1);
	}
}

main();
