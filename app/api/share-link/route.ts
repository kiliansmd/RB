import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Vercel KV für persistente Speicherung (mit Fallback für Development)
let kv: any = null;

async function getKV() {
  if (kv) return kv;
  
  try {
    const { kv: vercelKV } = await import('@vercel/kv');
    kv = vercelKV;
    return kv;
  } catch (error) {
    console.warn('⚠️ Vercel KV nicht verfügbar, verwende In-Memory Storage für Development');
    return null;
  }
}

// Fallback In-Memory Storage für Development
const memoryStorage = new Map<string, {
  candidateId: string;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  maxAccess?: number;
  metadata?: {
    candidateName?: string;
    sharedBy?: string;
    ipAddress?: string;
  };
}>();

interface CreateShareLinkRequest {
  candidateId: string;
  expirationHours?: number;
  maxAccess?: number;
  metadata?: {
    candidateName?: string;
    sharedBy?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateShareLinkRequest = await request.json();
    const { candidateId, expirationHours = 168, maxAccess, metadata } = body; // 7 Tage Standard

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID ist erforderlich' },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (expirationHours * 60 * 60 * 1000);
    
    const linkData = {
      candidateId,
      expiresAt,
      createdAt: Date.now(),
      accessCount: 0,
      maxAccess,
      metadata: {
        ...metadata,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    };

    // Store link data
    const kvClient = await getKV();
    if (kvClient) {
      // Production: Vercel KV mit automatischem TTL
      const ttlSeconds = Math.floor(expirationHours * 60 * 60);
      await kvClient.setex(`share:${token}`, ttlSeconds, JSON.stringify(linkData));
    } else {
      // Development: In-Memory Storage
      memoryStorage.set(token, linkData);
    }

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   request.headers.get('origin') || 
                   'http://localhost:3000';
    
    const shareUrl = `${baseUrl}/share/${token}`;

    return NextResponse.json({
      success: true,
      data: {
        shareUrl,
        token,
        expiresAt,
        expirationHours,
        maxAccess,
        metadata
      }
    });

  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Share-Links' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
        { status: 400 }
      );
    }

    // Get link data
    const kvClient = await getKV();
    let linkData = null;

    if (kvClient) {
      // Production: Vercel KV
      const data = await kvClient.get(`share:${token}`);
      linkData = data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
    } else {
      // Development: In-Memory Storage
      linkData = memoryStorage.get(token);
    }
    
    if (!linkData) {
      return NextResponse.json(
        { error: 'Share-Link nicht gefunden' },
        { status: 404 }
      );
    }

    // Check expiration
    if (Date.now() > linkData.expiresAt) {
      if (kvClient) {
        await kvClient.del(`share:${token}`);
      } else {
        memoryStorage.delete(token);
      }
      return NextResponse.json(
        { error: 'Share-Link ist abgelaufen' },
        { status: 410 }
      );
    }

    // Check access limits
    if (linkData.maxAccess && linkData.accessCount >= linkData.maxAccess) {
      return NextResponse.json(
        { error: 'Maximale Anzahl von Zugriffen erreicht' },
        { status: 429 }
      );
    }

    // Increment access count
    linkData.accessCount += 1;
    
    if (kvClient) {
      const ttlSeconds = Math.floor((linkData.expiresAt - Date.now()) / 1000);
      if (ttlSeconds > 0) {
        await kvClient.setex(`share:${token}`, ttlSeconds, JSON.stringify(linkData));
      }
    } else {
      memoryStorage.set(token, linkData);
    }

    return NextResponse.json({
      success: true,
      data: {
        candidateId: linkData.candidateId,
        expiresAt: linkData.expiresAt,
        accessCount: linkData.accessCount,
        maxAccess: linkData.maxAccess,
        metadata: linkData.metadata
      }
    });

  } catch (error) {
    console.error('Error validating share link:', error);
    return NextResponse.json(
      { error: 'Fehler beim Validieren des Share-Links' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
        { status: 400 }
      );
    }

    const kvClient = await getKV();
    let exists = false;

    if (kvClient) {
      const data = await kvClient.get(`share:${token}`);
      exists = !!data;
      if (exists) {
        await kvClient.del(`share:${token}`);
      }
    } else {
      exists = memoryStorage.has(token);
      memoryStorage.delete(token);
    }

    return NextResponse.json({
      success: true,
      data: { deleted: exists }
    });

  } catch (error) {
    console.error('Error deleting share link:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Share-Links' },
      { status: 500 }
    );
  }
} 