// Import from the centralized firebase-admin configuration
import { db } from './firebase-admin';

// Function to check if we should use mock mode
export const isFirebaseMockMode = () => {
  return !db;
};

// Re-export the Firestore instance
export { db };