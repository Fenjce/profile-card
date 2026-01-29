"use client";

import React, { ReactNode, ErrorInfo } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Catches component errors and displays a fallback UI.
 * Logs errors to console for debugging.
 *
 * Validates: Requirements 5 (Stability)
 */
export default class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error to console for debugging
		console.error("Error caught by Error Boundary:", error);
		console.error("Error Info:", errorInfo);
		console.error("Component Stack:", errorInfo.componentStack);
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							minHeight: "100vh",
							backgroundColor: "#f5f5f5",
							padding: "20px",
							fontFamily: "Space Grotesk, sans-serif",
						}}
					>
						<div
							style={{
								backgroundColor: "white",
								borderRadius: "12px",
								padding: "40px",
								maxWidth: "500px",
								boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
								textAlign: "center",
							}}
						>
							<h1
								style={{
									fontSize: "24px",
									fontWeight: "600",
									color: "#333",
									marginBottom: "16px",
								}}
							>
								Oops! Something went wrong
							</h1>
							<p
								style={{
									fontSize: "14px",
									color: "#666",
									marginBottom: "24px",
									lineHeight: "1.6",
								}}
							>
								We encountered an unexpected error. Please try refreshing the page.
							</p>
							{this.state.error && (
								<details
									style={{
										marginBottom: "24px",
										textAlign: "left",
										backgroundColor: "#f9f9f9",
										padding: "12px",
										borderRadius: "8px",
										border: "1px solid #e0e0e0",
									}}
								>
									<summary
										style={{
											cursor: "pointer",
											fontWeight: "500",
											color: "#666",
											marginBottom: "8px",
										}}
									>
										Error Details
									</summary>
									<pre
										style={{
											fontSize: "12px",
											color: "#d32f2f",
											overflow: "auto",
											maxHeight: "200px",
											margin: "8px 0 0 0",
										}}
									>
										{this.state.error.toString()}
									</pre>
								</details>
							)}
							<button
								onClick={() => window.location.reload()}
								style={{
									backgroundColor: "#007bff",
									color: "white",
									border: "none",
									padding: "10px 24px",
									borderRadius: "6px",
									fontSize: "14px",
									fontWeight: "500",
									cursor: "pointer",
									transition: "background-color 0.2s",
								}}
								onMouseEnter={(e) => {
									(e.target as HTMLButtonElement).style.backgroundColor = "#0056b3";
								}}
								onMouseLeave={(e) => {
									(e.target as HTMLButtonElement).style.backgroundColor = "#007bff";
								}}
							>
								Refresh Page
							</button>
						</div>
					</div>
				)
			);
		}

		return this.props.children;
	}
}
