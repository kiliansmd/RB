import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

function initializeFirebase() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Development mode - use mock data
  if (!projectId || !clientEmail || !privateKey) {
    console.warn('🔧 Firebase credentials missing - using mock mode');
    return null;
  }

  try {
    // Fix private key format
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });
    
    console.log('✅ Firebase Admin initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    return null;
  }
}

// Initialize on module load
const firebaseApp = initializeFirebase();

// Export database instance or null for mock mode
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

// Helper to check if we're in mock mode
export const isFirebaseMockMode = () => !firebaseApp;
