/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack(config, { isServer }) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    // Ajouté pour corriger l'erreur "Module not found: Can't resolve 'net'"
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        child_process: false,
        http2: false,
      };
    }

    // Ajout d'alias pour corriger les erreurs de build liées aux imports "node:*"
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:events': 'events',
      'node:process': 'process',
      'node:stream': 'stream-browserify',
      'node:util': 'util',
    };

    return config;
  },
};

module.exports = nextConfig;
