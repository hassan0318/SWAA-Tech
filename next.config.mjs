/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com", // from your earlier error
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // in case you use normal Unsplash
      },
    ],
  },
};

export default nextConfig;
