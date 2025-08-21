// next.config.mjs
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // disable PWA in dev
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // devIndicators: false,

  // Add i18n config here
  i18n: {
    locales: ['en', 'ms'], // English + Malay
    defaultLocale: 'en',
  },
};

export default withPWA(nextConfig);
