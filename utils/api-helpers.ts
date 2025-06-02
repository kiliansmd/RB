import type { ZapierKandidatData } from "@/types/kandidat"

/**
 * Validiert die eingehenden Zapier-Daten
 */
export function validateZapierData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Prüfe ob grundlegende Struktur vorhanden ist
  if (!data.id) {
    errors.push("Kandidaten-ID ist erforderlich")
  }

  if (!data.profilDaten) {
    errors.push("Profil-Daten sind erforderlich")
  } else {
    // Validiere Profil-Daten
    const requiredProfilFields = [
      "kurzprofil_text",
      "lebenslauf_text",
      "profil_einschaetzung",
      "senioritaet",
      "potenziell_passende_jobrollen",
      "kernthemen",
    ]

    requiredProfilFields.forEach((field) => {
      if (!data.profilDaten[field]) {
        errors.push(`Profil-Feld '${field}' ist erforderlich`)
      }
    })

    // Prüfe Arrays
    if (!Array.isArray(data.profilDaten.potenziell_passende_jobrollen)) {
      errors.push("'potenziell_passende_jobrollen' muss ein Array sein")
    }

    if (!Array.isArray(data.profilDaten.kernthemen)) {
      errors.push("'kernthemen' muss ein Array sein")
    }
  }

  if (!data.resumeDaten) {
    errors.push("Resume-Daten sind erforderlich")
  } else {
    // Validiere Resume-Daten
    if (!data.resumeDaten.basics) {
      errors.push("Resume 'basics' sind erforderlich")
    } else {
      const requiredBasicsFields = ["name", "label", "location"]
      requiredBasicsFields.forEach((field) => {
        if (!data.resumeDaten.basics[field]) {
          errors.push(`Resume basics '${field}' ist erforderlich`)
        }
      })

      if (data.resumeDaten.basics.location && !data.resumeDaten.basics.location.city) {
        errors.push("Location 'city' ist erforderlich")
      }
    }

    // Prüfe Arrays
    if (!Array.isArray(data.resumeDaten.work)) {
      errors.push("Resume 'work' muss ein Array sein")
    }

    if (!Array.isArray(data.resumeDaten.education)) {
      errors.push("Resume 'education' muss ein Array sein")
    }

    if (!Array.isArray(data.resumeDaten.languages)) {
      errors.push("Resume 'languages' muss ein Array sein")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitisiert und normalisiert die eingehenden Daten
 */
export function sanitizeZapierData(data: any): ZapierKandidatData {
  return {
    id: String(data.id).trim(),
    profilDaten: {
      kurzprofil_text: String(data.profilDaten.kurzprofil_text || "").trim(),
      lebenslauf_text: String(data.profilDaten.lebenslauf_text || "").trim(),
      profil_einschaetzung: String(data.profilDaten.profil_einschaetzung || "").trim(),
      senioritaet: String(data.profilDaten.senioritaet || "Junior").trim(),
      potenziell_passende_jobrollen: Array.isArray(data.profilDaten.potenziell_passende_jobrollen)
        ? data.profilDaten.potenziell_passende_jobrollen.map((role: any) => String(role).trim())
        : [],
      kernthemen: Array.isArray(data.profilDaten.kernthemen)
        ? data.profilDaten.kernthemen.map((thema: any) => String(thema).trim())
        : [],
    },
    resumeDaten: {
      basics: {
        name: String(data.resumeDaten.basics?.name || "").trim(),
        label: String(data.resumeDaten.basics?.label || "").trim(),
        image: String(data.resumeDaten.basics?.image || "").trim(),
        email: String(data.resumeDaten.basics?.email || "").trim(),
        phone: String(data.resumeDaten.basics?.phone || "").trim(),
        url: String(data.resumeDaten.basics?.url || "").trim(),
        summary: String(data.resumeDaten.basics?.summary || "").trim(),
        location: {
          address: String(data.resumeDaten.basics?.location?.address || "").trim(),
          postalCode: String(data.resumeDaten.basics?.location?.postalCode || "").trim(),
          city: String(data.resumeDaten.basics?.location?.city || "").trim(),
          countryCode: String(data.resumeDaten.basics?.location?.countryCode || "DE").trim(),
          region: String(data.resumeDaten.basics?.location?.region || "").trim(),
        },
        profiles: Array.isArray(data.resumeDaten.basics?.profiles) ? data.resumeDaten.basics.profiles : [],
      },
      work: Array.isArray(data.resumeDaten.work) ? data.resumeDaten.work : [],
      volunteer: Array.isArray(data.resumeDaten.volunteer) ? data.resumeDaten.volunteer : [],
      education: Array.isArray(data.resumeDaten.education) ? data.resumeDaten.education : [],
      awards: Array.isArray(data.resumeDaten.awards) ? data.resumeDaten.awards : [],
      certificates: Array.isArray(data.resumeDaten.certificates) ? data.resumeDaten.certificates : [],
      publications: Array.isArray(data.resumeDaten.publications) ? data.resumeDaten.publications : [],
      skills: Array.isArray(data.resumeDaten.skills) ? data.resumeDaten.skills : [],
      languages: Array.isArray(data.resumeDaten.languages) ? data.resumeDaten.languages : [],
      interests: Array.isArray(data.resumeDaten.interests) ? data.resumeDaten.interests : [],
      references: Array.isArray(data.resumeDaten.references) ? data.resumeDaten.references : [],
      projects: Array.isArray(data.resumeDaten.projects) ? data.resumeDaten.projects : [],
    },
  }
}

/**
 * Generiert eine sichere Kandidaten-ID falls keine vorhanden ist
 */
export function generateKandidatId(name: string): string {
  const timestamp = Date.now()
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  return `${nameSlug}-${timestamp}`
}

/**
 * Logging-Utility für API-Aufrufe
 */
export function logApiCall(endpoint: string, method: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${method} ${endpoint}`, data ? { dataKeys: Object.keys(data) } : "")
}

/**
 * Error-Handler für API-Routen
 */
export function handleApiError(error: any, context: string) {
  console.error(`[API Error] ${context}:`, error)

  if (error.name === "ValidationError") {
    return {
      status: 400,
      message: "Validierungsfehler",
      details: error.message,
    }
  }

  if (error.name === "NotFoundError") {
    return {
      status: 404,
      message: "Ressource nicht gefunden",
      details: error.message,
    }
  }

  return {
    status: 500,
    message: "Interner Serverfehler",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  }
}
