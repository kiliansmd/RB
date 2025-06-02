import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check if the app is already initialized to avoid multiple instances
const apps = getApps();

if (!apps.length) {
  // Initialize Firebase Admin with credentials
  try {
    console.log(`🔥 Initializing Firebase with project: ${process.env.FIREBASE_PROJECT_ID}`);
    
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    throw error;
  }
}

// Export Firestore instance
export const db = getFirestore(); 