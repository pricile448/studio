
import type {NextConfig} from 'next';

const nextConfig = async (): Promise<NextConfig> => {
  const { default: path } = await import('path');

  return {
    /* config options here */
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'placehold.co',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    webpack: (config, { isServer }) => {
      // This is to fix a build error with Genkit and its dependencies.
      // It prevents webpack from trying to bundle server-side packages for the client.
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          module: false,
          path: false,
          net: false,
          tls: false,
          events: require.resolve('events/'),
        };
      }

      return config;
    },
  };
};

export default nextConfig;
