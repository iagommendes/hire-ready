// Static export (for GitHub Pages) is enabled by setting STATIC_EXPORT=true.
// On a project Pages site the app is served under /<repo>, so we honor
// NEXT_PUBLIC_BASE_PATH (e.g. "/hire-ready") for both routing and assets.
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isStaticExport
    ? { output: "export", images: { unoptimized: true } }
    : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
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
