// utils/anonymize-helpers.ts - Hilfsfunktionen für Anonymisierung von Dokumentennamen

/**
 * Generiert einen anonymisierten Dokumentennamen basierend auf Position, ID und Datum
 * Format: "Senior-Developer-A1B2-Jan24"
 */
export function generateAnonymousDocumentName(
  title?: string,
  candidateId?: string,
  uploadedAt?: { _seconds: number } | number
): string {
  // Position normalisieren
  const normalizedTitle = normalizeJobTitle(title);
  
  // ID-Suffix generieren (letzte 4 Zeichen oder Hash)
  const idSuffix = generateIdSuffix(candidateId);
  
  // Datum-Suffix generieren (MonJahr Format)
  const dateSuffix = generateDateSuffix(uploadedAt);
  
  return `${normalizedTitle}-${idSuffix}-${dateSuffix}`;
}

/**
 * Normalisiert Job-Titel für die Anonymisierung
 */
function normalizeJobTitle(title?: string): string {
  if (!title) return 'Kandidat';
  
  // Entferne persönliche Präfixe und normalisiere
  const cleanTitle = title
    .replace(/^(Herr|Frau|Mr\.?|Ms\.?|Mrs\.?)\s+/i, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-äöüß]/gi, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
  
  // Kürze zu lange Titel
  const words = cleanTitle.split('-');
  if (words.length > 3) {
    return words.slice(0, 3).join('-');
  }
  
  return cleanTitle || 'Kandidat';
}

/**
 * Generiert ein kurzes ID-Suffix
 */
function generateIdSuffix(candidateId?: string): string {
  if (!candidateId) {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  
  // Verwende die letzten 4 Zeichen oder generiere einen Hash
  if (candidateId.length >= 4) {
    return candidateId.slice(-4).toUpperCase();
  }
  
  // Für kurze IDs: einfacher Hash
  let hash = 0;
  for (let i = 0; i < candidateId.length; i++) {
    const char = candidateId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36).substring(0, 4).toUpperCase();
}

/**
 * Generiert ein Datum-Suffix im Format "MonJJ"
 */
function generateDateSuffix(uploadedAt?: { _seconds: number } | number): string {
  let timestamp: number;
  
  if (typeof uploadedAt === 'number') {
    timestamp = uploadedAt;
  } else if (uploadedAt && typeof uploadedAt === 'object' && '_seconds' in uploadedAt) {
    timestamp = uploadedAt._seconds * 1000;
  } else {
    timestamp = Date.now();
  }
  
  const date = new Date(timestamp);
  const monthNames = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
  ];
  
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  
  return `${month}${year}`;
}

/**
 * Generiert einen anonymen Kandidatennamen für die Anzeige
 * Format: "Kandidat:in A" oder "Senior Developer (A1B2)"
 */
export function generateAnonymousCandidateName(
  title?: string,
  candidateId?: string,
  index?: number
): string {
  if (!title && typeof index === 'number') {
    // Fallback: Alphabetische Bezeichnung
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[index % letters.length];
    return `Kandidat:in ${letter}`;
  }
  
  if (title) {
    const normalizedTitle = normalizeJobTitle(title);
    const idSuffix = generateIdSuffix(candidateId);
    return `${normalizedTitle.replace(/-/g, ' ')} (${idSuffix})`;
  }
  
  const idSuffix = generateIdSuffix(candidateId);
  return `Kandidat (${idSuffix})`;
}

/**
 * Extrahiert Seniority-Level aus dem Titel
 */
export function extractSeniorityFromTitle(title?: string): string {
  if (!title) return 'Mid-Level';
  
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
    return 'Senior';
  }
  
  if (titleLower.includes('junior') || titleLower.includes('trainee') || titleLower.includes('intern')) {
    return 'Junior';
  }
  
  return 'Mid-Level';
}

/**
 * Generiert eine anonyme E-Mail-Adresse für interne Referenz
 */
export function generateAnonymousEmail(candidateId?: string): string {
  const idSuffix = generateIdSuffix(candidateId);
  return `kandidat-${idSuffix.toLowerCase()}@anonymized.local`;
} 