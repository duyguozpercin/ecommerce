/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
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
    
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
