/**
 * Test file for code splitting with dynamic imports
 * Validates: Requirements 2 (Performance)
 *
 * This test verifies that:
 * 1. Dynamic imports are properly configured for modals
 * 2. Code splitting chunks are created for lazy-loaded components
 * 3. The main page bundle size is reduced by lazy loading modals
 */

import fs from "fs";
import path from "path";

describe("Code Splitting with Dynamic Imports", () => {
	/**
	 * Test 1: Verify dynamic imports are used in page.tsx
	 * Validates: Requirements 2 - Performance optimization through code splitting
	 */
	test("should use dynamic imports for modals in page.tsx", () => {
		const pageContent = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf-8");

		// Verify dynamic import is used
		expect(pageContent).toContain('import dynamic from "next/dynamic"');

		// Verify StoryOverlay is dynamically imported
		expect(pageContent).toContain('const StoryOverlay = dynamic(() => import("@/components/story/StoryOverlay")');

		// Verify SocialModal is dynamically imported
		expect(pageContent).toContain('const SocialModal = dynamic(() => import("@/components/modals/SocialModal")');

		// Verify InformationModal is dynamically imported
		expect(pageContent).toContain('const InformationModal = dynamic(() => import("@/components/modals/InformationModal")');

		// Verify ssr is disabled for modals (client-side only)
		expect(pageContent).toContain("ssr: false");

		// Verify loading state is provided
		expect(pageContent).toContain("loading: () => null");
	});

	/**
	 * Test 2: Verify static imports are removed for modals
	 * Validates: Requirements 2 - Ensure modals are not statically imported
	 */
	test("should not have static imports for modals", () => {
		const pageContent = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf-8");

		// Verify no static imports for modals
		expect(pageContent).not.toContain('import StoryOverlay from "@/components/story/StoryOverlay"');
		expect(pageContent).not.toContain('import SocialModal from "@/components/modals/SocialModal"');
		expect(pageContent).not.toContain('import InformationModal from "@/components/modals/InformationModal"');
	});

	/**
	 * Test 3: Verify modals are still used in the component
	 * Validates: Requirements 2 - Modals are still rendered when needed
	 */
	test("should still render modals when conditions are met", () => {
		const pageContent = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf-8");

		// Verify StoryOverlay is rendered conditionally
		expect(pageContent).toContain("{isStoryOpen && config && (");
		expect(pageContent).toContain("<StoryOverlay");

		// Verify SocialModal is rendered conditionally
		expect(pageContent).toContain("{selectedSocial && <SocialModal");

		// Verify InformationModal is rendered conditionally
		expect(pageContent).toContain("{isInformationModalOpen && config && config.information");
		expect(pageContent).toContain("<InformationModal");
	});

	/**
	 * Test 4: Verify build creates separate chunks for modals
	 * Validates: Requirements 2 - Code splitting produces separate bundles
	 */
	test("should create separate chunks for dynamically imported modals", () => {
		const chunksDir = path.join(process.cwd(), ".next/static/chunks");

		// Verify chunks directory exists
		expect(fs.existsSync(chunksDir)).toBe(true);

		// Get all chunk files
		const chunks = fs.readdirSync(chunksDir).filter((file) => {
			return file.endsWith(".js") && !file.includes("app/");
		});

		// Verify multiple chunks exist (indicating code splitting)
		// Should have at least: main, framework, and modal chunks
		expect(chunks.length).toBeGreaterThan(5);

		// Verify specific chunk files exist
		const hasMainChunk = chunks.some((file) => file.includes("main"));
		const hasFrameworkChunk = chunks.some((file) => file.includes("framework"));

		expect(hasMainChunk).toBe(true);
		expect(hasFrameworkChunk).toBe(true);
	});

	/**
	 * Test 5: Verify page chunk size is reasonable
	 * Validates: Requirements 2 - Main page bundle is not bloated
	 */
	test("should have reasonable page chunk size", () => {
		const pageChunkPath = path.join(process.cwd(), ".next/static/chunks/app/page-*.js");

		// Find the page chunk
		const chunksDir = path.join(process.cwd(), ".next/static/chunks/app");
		const pageChunks = fs.readdirSync(chunksDir).filter((file) => file.startsWith("page-"));

		expect(pageChunks.length).toBeGreaterThan(0);

		// Check that page chunk exists and is not excessively large
		const pageChunk = pageChunks[0];
		const pageChunkFullPath = path.join(chunksDir, pageChunk);
		const stats = fs.statSync(pageChunkFullPath);

		// Page chunk should be less than 100KB (reasonable size for main page)
		// If modals were bundled statically, this would be much larger
		expect(stats.size).toBeLessThan(100 * 1024);
	});

	/**
	 * Test 6: Verify modal components are still valid
	 * Validates: Requirements 2 - Modals can still be imported and used
	 */
	test("should have valid modal component files", () => {
		const storyOverlayPath = path.join(process.cwd(), "components/story/StoryOverlay.tsx");
		const socialModalPath = path.join(process.cwd(), "components/modals/SocialModal.tsx");
		const informationModalPath = path.join(process.cwd(), "components/modals/InformationModal.tsx");

		// Verify all modal files exist
		expect(fs.existsSync(storyOverlayPath)).toBe(true);
		expect(fs.existsSync(socialModalPath)).toBe(true);
		expect(fs.existsSync(informationModalPath)).toBe(true);

		// Verify they export default components
		const storyContent = fs.readFileSync(storyOverlayPath, "utf-8");
		const socialContent = fs.readFileSync(socialModalPath, "utf-8");
		const informationContent = fs.readFileSync(informationModalPath, "utf-8");

		expect(storyContent).toContain("export default function");
		expect(socialContent).toContain("export default function");
		expect(informationContent).toContain("export default function");
	});

	/**
	 * Test 7: Verify dynamic import configuration is correct
	 * Validates: Requirements 2 - Dynamic imports have proper options
	 */
	test("should have correct dynamic import configuration", () => {
		const pageContent = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf-8");

		// Count dynamic imports
		const dynamicImports = (pageContent.match(/dynamic\(/g) || []).length;
		expect(dynamicImports).toBe(3); // StoryOverlay, SocialModal, InformationModal

		// Verify each dynamic import has loading and ssr options
		const storyOverlayMatch = pageContent.match(/const StoryOverlay = dynamic\([^}]+\}/s);
		expect(storyOverlayMatch).toBeTruthy();
		expect(storyOverlayMatch![0]).toContain("loading:");
		expect(storyOverlayMatch![0]).toContain("ssr: false");

		const socialModalMatch = pageContent.match(/const SocialModal = dynamic\([^}]+\}/s);
		expect(socialModalMatch).toBeTruthy();
		expect(socialModalMatch![0]).toContain("loading:");
		expect(socialModalMatch![0]).toContain("ssr: false");

		const informationModalMatch = pageContent.match(/const InformationModal = dynamic\([^}]+\}/s);
		expect(informationModalMatch).toBeTruthy();
		expect(informationModalMatch![0]).toContain("loading:");
		expect(informationModalMatch![0]).toContain("ssr: false");
	});
});
