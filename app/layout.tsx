import "./globals.css";
import "./components.css";
import "./modals.css";
import type { Metadata, Viewport } from "next";
import DisableZoom from "@/components/ui/DisableZoom";
import { ToastProvider } from "@/components/providers/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
	title: "Profile Card",
	description: "Beautiful profile card with stories",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="vi" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
			</head>
			<body className="light-mode" suppressHydrationWarning>
				<DisableZoom />
				<ErrorBoundary>
					<ToastProvider>{children}</ToastProvider>
				</ErrorBoundary>
			</body>
		</html>
	);
}
