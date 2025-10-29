/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'siltyntxitqkzjsngbcq.supabase.co',
            },
        ],
    },
};

export default nextConfig;