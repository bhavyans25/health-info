/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@instaclone/shared', '@instaclone/db'],
};

module.exports = nextConfig;
