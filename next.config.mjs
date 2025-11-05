/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // ADD THIS LINE to disable all Next.js optimization
        unoptimized: true,

        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'siltyntxitqkzjsngbcq.supabase.co',
            },
        ],
    },
};

export default nextConfig;