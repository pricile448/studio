// src/lib/config/env.ts
// =============================================================================
// Configuration centralisée des variables d'environnement
// =============================================================================

/**
 * Interface pour la configuration Firebase
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Interface pour la configuration Mailgun
 */
export interface MailgunConfig {
  apiKey: string;
  domain: string;
  fromEmail?: string;
}

/**
 * Interface pour la configuration Cloudinary
 */
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
}

/**
 * Interface pour la configuration Gemini AI
 */
export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

/**
 * Interface pour la configuration Admin
 */
export interface AdminConfig {
  serviceAccountKey: string;
  adminEmails: string[];
  jwtSecret: string;
  encryptionKey: string;
}

/**
 * Interface pour la configuration globale
 */
export interface AppConfig {
  appUrl: string;
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// =============================================================================
// VALIDATION DES VARIABLES D'ENVIRONNEMENT
// =============================================================================

/**
 * Valide et récupère la configuration Firebase
 */
export function getFirebaseConfig(): FirebaseConfig {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`🔥 Firebase - Variables d'environnement manquantes: ${missing.join(', ')}`);
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
  };
}

/**
 * Valide et récupère la configuration Mailgun
 */
export function getMailgunConfig(): MailgunConfig {
  const requiredVars = ['MAILGUN_API_KEY', 'MAILGUN_DOMAIN'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`📧 Mailgun - Variables d'environnement manquantes: ${missing.join(', ')}`);
  }

  return {
    apiKey: process.env.MAILGUN_API_KEY!,
    domain: process.env.MAILGUN_DOMAIN!,
    fromEmail: process.env.MAILGUN_FROM_EMAIL
  };
}

/**
 * Valide et récupère la configuration Cloudinary
 */
export function getCloudinaryConfig(): CloudinaryConfig {
  const requiredVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`☁️ Cloudinary - Variables d'environnement manquantes: ${missing.join(', ')}`);
  }

  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  };
}

/**
 * Valide et récupère la configuration Gemini
 */
export function getGeminiConfig(): GeminiConfig {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('🤖 Gemini - Variable GEMINI_API_KEY manquante');
  }

  return {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-pro'
  };
}

/**
 * Valide et récupère la configuration Admin
 */
export function getAdminConfig(): AdminConfig {
  const requiredVars = [
    'FIREBASE_SERVICE_ACCOUNT_KEY',
    'ADMIN_EMAILS',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`🔐 Admin - Variables d'environnement manquantes: ${missing.join(', ')}`);
  }

  // Validation de la clé de chiffrement (doit faire 32 caractères)
  if (process.env.ENCRYPTION_KEY!.length !== 32) {
    throw new Error('🔐 Admin - ENCRYPTION_KEY doit faire exactement 32 caractères');
  }

  return {
    serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY!,
    adminEmails: process.env.ADMIN_EMAILS!.split(',').map(email => email.trim()),
    jwtSecret: process.env.JWT_SECRET!,
    encryptionKey: process.env.ENCRYPTION_KEY!
  };
}

/**
 * Valide et récupère la configuration de l'application
 */
export function getAppConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    appUrl,
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production'
  };
}

// =============================================================================
// EXPORTS PRINCIPAUX
// =============================================================================

// Configurations singletons (lazy loading)
let firebaseConfig: FirebaseConfig | null = null;
let mailgunConfig: MailgunConfig | null = null;
let cloudinaryConfig: CloudinaryConfig | null = null;
let geminiConfig: GeminiConfig | null = null;
let adminConfig: AdminConfig | null = null;
let appConfig: AppConfig | null = null;

export const firebase = () => {
  if (!firebaseConfig) firebaseConfig = getFirebaseConfig();
  return firebaseConfig;
};

export const mailgun = () => {
  if (!mailgunConfig) mailgunConfig = getMailgunConfig();
  return mailgunConfig;
};

export const cloudinary = () => {
  if (!cloudinaryConfig) cloudinaryConfig = getCloudinaryConfig();
  return cloudinaryConfig;
};

export const gemini = () => {
  if (!geminiConfig) geminiConfig = getGeminiConfig();
  return geminiConfig;
};

export const admin = () => {
  if (!adminConfig) adminConfig = getAdminConfig();
  return adminConfig;
};

export const app = () => {
  if (!appConfig) appConfig = getAppConfig();
  return appConfig;
};

// =============================================================================
// UTILITAIRES DE DIAGNOSTIC
// =============================================================================

/**
 * Vérifie toutes les configurations
 */
export function diagnoseAllConfigs(): {
  status: 'success' | 'error';
  results: Array<{
    service: string;
    status: 'ok' | 'error';
    message: string;
  }>;
} {
  const results: Array<{
    service: string;
    status: 'ok' | 'error';
    message: string;
  }> = [];

  const services = [
    { name: '🔥 Firebase', fn: getFirebaseConfig },
    { name: '📧 Mailgun', fn: getMailgunConfig },
    { name: '☁️ Cloudinary', fn: getCloudinaryConfig },
    { name: '🤖 Gemini', fn: getGeminiConfig },
    { name: '🔐 Admin', fn: getAdminConfig },
    { name: '⚙️ App', fn: getAppConfig }
  ];

  let hasErrors = false;

  for (const service of services) {
    try {
      service.fn();
      results.push({
        service: service.name,
        status: 'ok',
        message: 'Configuration valide ✅'
      });
    } catch (error) {
      hasErrors = true;
      results.push({
        service: service.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  return {
    status: hasErrors ? 'error' : 'success',
    results
  };
}

/**
 * Affiche un rapport de diagnostic dans la console
 */
export function logDiagnosticReport(): void {
  const diagnosis = diagnoseAllConfigs();
  
  console.log('\n📊 RAPPORT DE CONFIGURATION');
  console.log('================================');
  
  diagnosis.results.forEach(result => {
    const icon = result.status === 'ok' ? '✅' : '❌';
    console.log(`${icon} ${result.service}: ${result.message}`);
  });
  
  console.log('================================');
  console.log(`📈 Statut global: ${diagnosis.status === 'success' ? '✅ TOUT OK' : '❌ ERREURS DÉTECTÉES'}`);
  console.log('');
}

// =============================================================================
// TYPES D'EXPORT POUR L'AUTOCOMPLÉTION
// =============================================================================

export type {
  FirebaseConfig,
  MailgunConfig,
  CloudinaryConfig,
  GeminiConfig,
  AdminConfig,
  AppConfig
};
