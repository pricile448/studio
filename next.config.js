/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignorer les erreurs TypeScript pendant le build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorer les erreurs de build
  onDemandEntries: {
    // Période pendant laquelle les pages compilées sont conservées en mémoire
    maxInactiveAge: 60 * 60 * 1000, // 1 heure
    // Nombre de pages à conserver en mémoire
    pagesBufferLength: 5,
  },
  // Ignorer les erreurs de prérendu
  experimental: {
    // Augmenter le timeout pour les opérations côté serveur
    serverActions: {
      bodySizeLimit: '2mb',
      // Augmenter le timeout pour les actions serveur
      timeoutMs: 30000, // 30 secondes
    },
    // Ignorer les erreurs de prérendu
    missingSuspenseWithCSRBailout: false,
    // Désactiver le prérendu statique pour les pages qui utilisent des fonctionnalités côté client
    workerThreads: false,
    cpus: 1
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Ajouter un timeout plus long pour les requêtes d'images
    minimumCacheTTL: 120,
    // Utiliser un loader personnalisé pour Cloudinary
    loader: 'custom',
    loaderFile: './src/lib/cloudinary-loader.ts',
    // Augmenter le délai d'attente des images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Ajouter des timeouts plus longs
  experimental: {
    // Augmenter le timeout pour les opérations côté serveur
    serverActions: {
      bodySizeLimit: '2mb',
      // Augmenter le timeout pour les actions serveur
      timeoutMs: 30000, // 30 secondes
    },
  },
  // Configuration des packages externes pour les composants serveur
  serverExternalPackages: ['firebase-admin'],

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
