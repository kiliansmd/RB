import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiHandler = (req: Request, context?: Record<string, unknown>) => Promise<Response>;

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: Request, context?: Record<string, unknown>) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            details: error.errors,
          },
          { status: 400 }
        );
      }

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          );
        }
      }

      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development' 
            ? (error instanceof Error ? error.message : 'Unknown error')
            : undefined,
        },
        { status: 500 }
      );
    }
  };
}

export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req: Request, context?: Record<string, unknown>) => {
    const apiKey = req.headers.get('x-api-key');
    
    // Für Development überspringen
    if (process.env.NODE_ENV === 'development') {
      return handler(req, context);
    }
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return handler(req, context);
  };
}

// Rate Limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000
): (handler: ApiHandler) => ApiHandler {
  return (handler: ApiHandler) => {
    return async (req: Request, context?: Record<string, unknown>) => {
      const ip = req.headers.get('x-forwarded-for') || 'anonymous';
      const now = Date.now();
      
      const record = requestCounts.get(ip);
      
      if (!record || now > record.resetTime) {
        requestCounts.set(ip, {
          count: 1,
          resetTime: now + windowMs,
        });
      } else if (record.count >= maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
      } else {
        record.count++;
      }
      
      return handler(req, context);
    };
  };
} 