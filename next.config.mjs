// next.config.mjs (OPTIMIZED)
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'], // Modern formats first
        deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Mobile-first sizes
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Thumbnail sizes
        minimumCacheTTL: 60 * 60 * 24 * 7, // Cache for 1 week
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // Update with your actual image domains
            },
        ],
    },
    // Enable SWC minification for faster builds
    swcMinify: true,
    // Optimize production builds
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production', // Remove console.logs in production
    },
    // Enable React strict mode for better performance
    reactStrictMode: true,
    // Experimental features for better performance
    experimental: {
        optimizeCss: true, // Optimize CSS
        optimizePackageImports: ['lucide-react', 'framer-motion'], // Tree shake these packages
    },
    // Webpack optimizations
    webpack: (config, { dev, isServer }) => {
        // Production optimizations
        if (!dev && !isServer) {
            config.optimization = {
                ...config.optimization,
                moduleIds: 'deterministic',
                runtimeChunk: 'single',
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // Vendor chunk for node_modules
                        vendor: {
                            name: 'vendor',
                            chunks: 'all',
                            test: /node_modules/,
                            priority: 20
                        },
                        // Common chunk for shared code
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            priority: 10,
                            reuseExistingChunk: true,
                            enforce: true
                        }
                    }
                }
            };
        }
        return config;
    },
};

export default nextConfig;