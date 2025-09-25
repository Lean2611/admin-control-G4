import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // No detiene el build si hay errores de ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;