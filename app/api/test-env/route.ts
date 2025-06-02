import { NextResponse } from 'next/server';

export async function GET() {
  // Liste aller konfigurierten Umgebungsvariablen (ohne Werte)
  const configuredVars = {
    // Firebase Konfiguration
    FIREBASE_STORAGE_BUCKET: !!process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_DATABASE_URL: !!process.env.FIREBASE_DATABASE_URL,
    FIREBASE_CLIENT_ID: !!process.env.FIREBASE_CLIENT_ID,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    
    // API Keys
    WEBSCRAPER_API_KEY: !!process.env.WEBSCRAPER_API_KEY,
    RESUMEPARSER_API_KEY: !!process.env.RESUMEPARSER_API_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    
    // URLs und Endpoints
    NEXT_PUBLIC_RESUME_PARSER_URL: !!process.env.NEXT_PUBLIC_RESUME_PARSER_URL,
    NEXT_PUBLIC_RESUME_PARSER_API: !!process.env.NEXT_PUBLIC_RESUME_PARSER_API,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  };

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    configuredVars,
  });
} 