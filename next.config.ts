import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Ensure the email template ships with the /api/subscribe serverless function
  outputFileTracingIncludes: {
    "/api/subscribe": ["./emails/welcome-onboarding.html"],
  },
};

export default withNextIntl(nextConfig);
