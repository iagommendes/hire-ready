/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pdfjs-dist ships a `canvas` optional dependency that is only needed in
    // Node. We never render to a Node canvas (parsing runs in the browser), so
    // we stub it out to keep the client bundle clean.
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
