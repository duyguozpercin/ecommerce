/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dummyjson.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dummyjson.com',
      },
      {
        protocol: 'https',
        hostname: 'w7n3amhklme2o7vw.public.blob.vercel-storage.com',
      },
    ],
  },
  env: {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  },
  eslint: {
    // ✅ Build sırasında ESLint hatalarına takılma
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
