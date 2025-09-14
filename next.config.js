/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose'], // ✅ updated key

  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

module.exports = nextConfig;
