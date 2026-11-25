import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Extra widths avoid sending 256px logos into 100px mobile containers at 2x DPR.
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 192, 200, 224, 256, 320, 384],
    // Next.js 16 requires custom optimizer qualities to be explicitly allowed.
    qualities: [70, 75],
  },
};

export default nextConfig;
