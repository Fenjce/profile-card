/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "i.pravatar.cc",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "via.placeholder.com",
			},
			{
				protocol: "https",
				hostname: "i.pinimg.com",
			},
			{
				protocol: "https",
				hostname: "*.public.blob.vercel-storage.com",
			},
		],
	},
	// Tối ưu cho Vercel
	swcMinify: true,
	// Suppress webpack cache warnings về case sensitivity trên Windows
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.infrastructureLogging = {
				level: "error",
			};
		}
		// Ignore webpack cache warnings về case sensitivity
		config.ignoreWarnings = [
			{
				module: /node_modules/,
				message: /Resolving.*doesn't lead to expected result/,
			},
		];
		return config;
	},
	// Enable static exports nếu cần
	// output: 'export', // Uncomment nếu muốn static export
};

module.exports = nextConfig;
