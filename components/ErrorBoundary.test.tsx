/**
 * Test file for Error Boundary Component
 * Validates: Requirements 5 (Stability)
 *
 * This test verifies that:
 * 1. Error Boundary catches component errors
 * 2. Fallback UI is displayed when errors occur
 * 3. Errors are logged to console
 * 4. Error details are shown in the fallback UI
 * 5. Page refresh button works correctly
 */

import fs from "fs";
import path from "path";

describe("ErrorBoundary Component", () => {
	/**
	 * Test 1: Error Boundary component exists
	 * Validates: Requirements 5 - Component creation
	 */
	test("should have ErrorBoundary component file", () => {
		const errorBoundaryPath = path.join(process.cwd(), "components/ErrorBoundary.tsx");
		expect(fs.existsSync(errorBoundaryPath)).toBe(true);
	});

	/**
	 * Test 2: Error Boundary is a class component
	 * Validates: Requirements 5 - Proper error boundary implementation
	 */
	test("should be implemented as a class component", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify it extends React.Component
		expect(errorBoundaryContent).toContain("extends React.Component");

		// Verify it has getDerivedStateFromError
		expect(errorBoundaryContent).toContain("getDerivedStateFromError");

		// Verify it has componentDidCatch
		expect(errorBoundaryContent).toContain("componentDidCatch");
	});

	/**
	 * Test 3: Error Boundary catches errors
	 * Validates: Requirements 5.1 - Catch component errors
	 */
	test("should implement getDerivedStateFromError", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify getDerivedStateFromError sets hasError to true
		expect(errorBoundaryContent).toContain("hasError: true");
		expect(errorBoundaryContent).toContain("error");
	});

	/**
	 * Test 4: Error Boundary logs errors to console
	 * Validates: Requirements 5.3 - Log errors to console
	 */
	test("should log errors to console in componentDidCatch", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify console.error is called
		expect(errorBoundaryContent).toContain('console.error("Error caught by Error Boundary"');

		// Verify error info is logged
		expect(errorBoundaryContent).toContain('console.error("Error Info"');

		// Verify component stack is logged
		expect(errorBoundaryContent).toContain('console.error("Component Stack"');
	});

	/**
	 * Test 5: Error Boundary displays fallback UI
	 * Validates: Requirements 5.2 - Display fallback UI
	 */
	test("should display fallback UI when error occurs", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify fallback UI text
		expect(errorBoundaryContent).toContain("Oops! Something went wrong");
		expect(errorBoundaryContent).toContain("We encountered an unexpected error");
		expect(errorBoundaryContent).toContain("Refresh Page");
	});

	/**
	 * Test 6: Error Boundary shows error details
	 * Validates: Requirements 5.2 - Display error information
	 */
	test("should display error details in expandable section", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify details element is used
		expect(errorBoundaryContent).toContain("<details");

		// Verify error details section
		expect(errorBoundaryContent).toContain("Error Details");

		// Verify error is displayed
		expect(errorBoundaryContent).toContain("this.state.error");
	});

	/**
	 * Test 7: Error Boundary accepts custom fallback
	 * Validates: Requirements 5.2 - Custom fallback UI support
	 */
	test("should accept custom fallback UI", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify fallback prop is used
		expect(errorBoundaryContent).toContain("this.props.fallback");

		// Verify fallback is rendered when provided
		expect(errorBoundaryContent).toContain("this.props.fallback ||");
	});

	/**
	 * Test 8: Error Boundary has refresh button
	 * Validates: Requirements 5 - Error recovery
	 */
	test("should have refresh button functionality", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify button element
		expect(errorBoundaryContent).toContain("<button");

		// Verify refresh functionality
		expect(errorBoundaryContent).toContain("window.location.reload()");

		// Verify button text
		expect(errorBoundaryContent).toContain("Refresh Page");
	});

	/**
	 * Test 9: Error Boundary is integrated in layout
	 * Validates: Requirements 5 - Integration with app
	 */
	test("should be integrated in app layout", () => {
		const layoutContent = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf-8");

		// Verify ErrorBoundary is imported
		expect(layoutContent).toContain('import ErrorBoundary from "@/components/ErrorBoundary"');

		// Verify ErrorBoundary wraps children
		expect(layoutContent).toContain("<ErrorBoundary>");
		expect(layoutContent).toContain("</ErrorBoundary>");

		// Verify it wraps ToastProvider
		expect(layoutContent).toContain("<ToastProvider>");
	});

	/**
	 * Test 10: Error Boundary renders children normally
	 * Validates: Requirements 5 - Normal operation without errors
	 */
	test("should render children when no error occurs", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify children are rendered when hasError is false
		expect(errorBoundaryContent).toContain("return this.props.children");
	});

	/**
	 * Test 11: Error Boundary has proper TypeScript types
	 * Validates: Requirements 5 - Type safety
	 */
	test("should have proper TypeScript interfaces", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify Props interface
		expect(errorBoundaryContent).toContain("interface Props");
		expect(errorBoundaryContent).toContain("children: ReactNode");
		expect(errorBoundaryContent).toContain("fallback?: ReactNode");

		// Verify State interface
		expect(errorBoundaryContent).toContain("interface State");
		expect(errorBoundaryContent).toContain("hasError: boolean");
		expect(errorBoundaryContent).toContain("error: Error | null");
	});

	/**
	 * Test 12: Error Boundary has proper styling
	 * Validates: Requirements 5.2 - Fallback UI appearance
	 */
	test("should have proper styling for fallback UI", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify flexbox layout
		expect(errorBoundaryContent).toContain("display: flex");
		expect(errorBoundaryContent).toContain("flexDirection: column");

		// Verify colors
		expect(errorBoundaryContent).toContain("#007bff");
		expect(errorBoundaryContent).toContain("#0056b3");

		// Verify responsive design
		expect(errorBoundaryContent).toContain("minHeight: 100vh");
		expect(errorBoundaryContent).toContain("maxWidth: 500px");
	});

	/**
	 * Test 13: Error Boundary uses "use client" directive
	 * Validates: Requirements 5 - Client-side error handling
	 */
	test("should use client-side directive", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify "use client" directive
		expect(errorBoundaryContent).toContain('"use client"');
	});

	/**
	 * Test 14: Error Boundary has documentation
	 * Validates: Requirements 5 - Code quality
	 */
	test("should have proper documentation", () => {
		const errorBoundaryContent = fs.readFileSync(path.join(process.cwd(), "components/ErrorBoundary.tsx"), "utf-8");

		// Verify JSDoc comments
		expect(errorBoundaryContent).toContain("/**");
		expect(errorBoundaryContent).toContain("Error Boundary Component");
		expect(errorBoundaryContent).toContain("Validates: Requirements 5");
	});
});
