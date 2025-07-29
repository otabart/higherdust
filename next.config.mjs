/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['wagmi']
  },
  // Ensure static files are properly handled
  trailingSlash: false,
  // Disable static optimization for this app due to wagmi
  staticPageGenerationTimeout: 120
};

export default nextConfig;
