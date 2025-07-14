
/** @type {import('next').NextConfig} */
const nextConfig = {
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
            ...(config.resolve.fallback || {}),
            fs: false,
            module: false,
            path: false,
            net: false,
            tls: false,
            http2: false,
            child_process: false,
            // events needs to be polyfilled for the browser
            events: (await import('path')).resolve('events/'),
        };
    }
    
    // Enable WebAssembly support, required by some dependencies.
    config.experiments = { ...(config.experiments || {}), asyncWebAssembly: true };

    return config;
  },
};

export default nextConfig;
