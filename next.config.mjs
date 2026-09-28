const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? "/attendance-predictor" : "",
  assetPrefix: isGithubPages ? "/attendance-predictor" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: isGithubPages ? true : false,
  ...(isGithubPages
    ? {}
    : {
        headers: async () => [
          {
            source: "/(.*)",
            headers: [
              {
                key: "X-Frame-Options",
                value: "DENY",
              },
              {
                key: "X-Content-Type-Options",
                value: "nosniff",
              },
              {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
              },
              {
                key: "Permissions-Policy",
                value: "camera=(), microphone=(), geolocation=()",
              },
            ],
          },
        ],
      }),
};

export default nextConfig;
