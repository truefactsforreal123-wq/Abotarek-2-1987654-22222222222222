import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Wikimedia Commons (koshari / mahalabia / tamarind photos)
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Flickr CDN (Openverse results)
      { protocol: "https", hostname: "live.staticflickr.com" },
    ],
  },
};

export default nextConfig;
