// Fichier : app/debug-env/page.js
'use client';
// Composant temporaire pour tester les variables d'environnement

export default function DebugEnv() {
  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Variables d'environnement</h1>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} style={{ margin: '10px 0' }}>
          <strong>{key}:</strong> {value ? '✅ SET' : '❌ MISSING'}
          {value && <span> (Longueur: {value.length})</span>}
        </div>
      ))}
    </div>
  );
}
