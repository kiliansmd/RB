import { appConfig } from './app.config';

export const devConfig = {
  // Development mode settings
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Mock data settings
  useMockData: false, // Immer echte Daten verwenden
  
  // API settings
  api: {
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 100 // limit each IP to 100 requests per windowMs
    },
  },
  
  // Logging settings
  logging: {
    mockDataPrefix: '[MOCK]',
    firebasePrefix: '🔥',
  }
};

export default devConfig; 