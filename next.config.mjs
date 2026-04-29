/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow markdown files to be imported as raw text via the loader below.
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
