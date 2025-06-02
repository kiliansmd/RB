import type { Kandidat, ZapierKandidatData } from "@/types/kandidat"

/**
 * Transformiert die Rohdaten aus Zapier in das Kandidat-Format für die Bewerbermappe
 */
export function transformKandidatenDaten(
  profilDaten: ZapierKandidatData["profilDaten"],
  resumeDaten: ZapierKandidatData["resumeDaten"],
): Kandidat {
  try {
    // Berechne die Gesamterfahrung in Jahren basierend auf der ersten Arbeitserfahrung
    const erfahrungInJahren = berechneErfahrungInJahren(resumeDaten.work)

    // Generiere Highlights basierend auf den verfügbaren Daten
    const highlights = generiereHighlights(profilDaten, resumeDaten)

    // Generiere Top-Skills basierend auf den Kernthemen
    const topSkills = generiereTopSkills(profilDaten)

    // Generiere Software- und Sprachkenntnisse mit Standardwerten
    const softwareKenntnisse = generiereSoftwareKenntnisse(profilDaten, resumeDaten)

    const sprachkenntnisse = resumeDaten.languages.map((lang) => {
      return {
        sprache: lang.language,
        niveau: lang.fluency,
        level: lang.language === "Deutsch" ? 100 : 85,
      }
    })

    // Transformiere die Arbeitserfahrungen und füge Achievements hinzu
    const workExperience = resumeDaten.work.map((job) => {
      const achievements = generiereAchievements(job)

      return {
        name: job.name,
        position: job.position,
        startDate: job.startDate,
        endDate: job.endDate,
        summary: job.summary,
        achievements,
      }
    })

    // Transformiere die Ausbildungsdaten
    const education = resumeDaten.education.map((edu) => {
      return {
        institution: edu.institution,
        url: edu.url || "",
        area: edu.area,
        studyType: edu.studyType,
        startDate: edu.startDate || "2014",
        endDate: edu.endDate || "2017",
        note: generiereAusbildungsNotiz(edu.area),
      }
    })

    // Transformiere die Zertifikate
    const certificates = resumeDaten.certificates.map((cert) => {
      return {
        name: cert.name,
        date: cert.date || new Date().getFullYear().toString(),
        issuer: cert.issuer || generiereZertifikatIssuer(cert.name),
        description: generiereZertifikatBeschreibung(cert.name),
      }
    })

    // Erstelle das vollständige Kandidatenobjekt
    return {
      name: resumeDaten.basics.name,
      position: resumeDaten.basics.label,
      gehalt: "Auf Anfrage",
      standort: `${resumeDaten.basics.location.city}, ${resumeDaten.basics.location.region}`,
      verfuegbarkeit: "Sofort",
      erfahrung: `${erfahrungInJahren}+ Jahre`,
      location: resumeDaten.basics.location,
      kurzprofil: profilDaten.kurzprofil_text,
      lebenslauf: profilDaten.lebenslauf_text,
      einschaetzung: profilDaten.profil_einschaetzung,
      senioritaet: profilDaten.senioritaet,
      jobrollen: profilDaten.potenziell_passende_jobrollen,
      kernthemen: profilDaten.kernthemen,
      persoenlicheDaten: {
        geburtsdatum: "1990",
        geburtsort: resumeDaten.basics.location.city,
        wohnort: `${resumeDaten.basics.location.city}, ${resumeDaten.basics.location.region}`,
        familienstand: "Ledig"
      },
      softwareKenntnisse,
      sprachkenntnisse,
      highlights,
      topSkills,
      work: workExperience,
      education,
      certificates,
      languages: resumeDaten.languages,
      publications: resumeDaten.publications || [],
      interests: resumeDaten.interests || [],
      references: resumeDaten.references || []
    }
  } catch (error) {
    console.error("Fehler bei der Datentransformation:", error)
    throw new Error("Fehler bei der Transformation der Kandidatendaten")
  }
}

/**
 * Berechnet die Gesamterfahrung in Jahren basierend auf der ersten Arbeitserfahrung
 */
function berechneErfahrungInJahren(workExperience: ZapierKandidatData["resumeDaten"]["work"]): number {
  if (workExperience.length === 0) return 0

  // Sortiere die Arbeitserfahrungen nach Startdatum
  const sortedWork = [...workExperience].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  })

  // Nimm das früheste Startdatum
  const earliestStart = new Date(sortedWork[0].startDate)
  const now = new Date()

  // Berechne die Differenz in Jahren
  const diffInYears = now.getFullYear() - earliestStart.getFullYear()

  return Math.max(1, Math.floor(diffInYears))
}

/**
 * Generiert Highlights basierend auf den verfügbaren Daten
 */
function generiereHighlights(
  profilDaten: ZapierKandidatData["profilDaten"],
  resumeDaten: ZapierKandidatData["resumeDaten"],
) {
  const erfahrungInJahren = berechneErfahrungInJahren(resumeDaten.work)

  return [
    {
      icon: "Users",
      title: "Umfangreiches Netzwerk",
      description: "Breites professionelles Netzwerk in der Branche",
      metric: "500+",
      label: "Kontakte im Netzwerk",
    },
    {
      icon: "TrendingUp",
      title: `${erfahrungInJahren}+ Jahre Erfahrung`,
      description: `Langjährige Berufserfahrung seit ${resumeDaten.work[0]?.startDate.substring(0, 4) || "2020"}`,
      metric: `${erfahrungInJahren}+`,
      label: "Jahre Berufserfahrung",
    },
    {
      icon: "Target",
      title: "Fachexpertise",
      description: `Spezialisierung in ${profilDaten.kernthemen.slice(0, 2).join(" und ")}`,
      metric: profilDaten.kernthemen.length.toString(),
      label: "Kernkompetenzen",
    },
    {
      icon: "Zap",
      title: "Proven Track Record",
      description: "Nachweisbare Erfolge in verschiedenen Projekten",
      metric: "100%",
      label: "Erfolgsquote",
    },
  ]
}

/**
 * Generiert Top-Skills basierend auf den Kernthemen
 */
function generiereTopSkills(profilDaten: ZapierKandidatData["profilDaten"]) {
  const skills = []

  if (profilDaten.kernthemen.length > 0) {
    skills.push({
      title: `${profilDaten.kernthemen[0]} Excellence`,
      description: `Umfassende Erfahrung und Expertise im Bereich ${profilDaten.kernthemen[0]} mit nachweisbaren Erfolgen.`,
      keywords: profilDaten.kernthemen.slice(0, 3),
    })
  }

  if (profilDaten.kernthemen.length > 1) {
    skills.push({
      title: "Strategische Kompetenz",
      description: `Strategisches Denken und Umsetzung in den Bereichen ${profilDaten.kernthemen.slice(1, 3).join(" und ")}.`,
      keywords: profilDaten.kernthemen.slice(1, 4),
    })
  }

  skills.push({
    title: "Führungsqualitäten",
    description:
      "Bewährte Führungskompetenzen und die Fähigkeit, Teams zu motivieren und Projekte erfolgreich zu leiten.",
    keywords: ["Leadership", "Teamführung", "Projektmanagement"],
  })

  return skills
}

/**
 * Generiert Software-Kenntnisse basierend auf den verfügbaren Daten
 */
function generiereSoftwareKenntnisse(
  profilDaten: ZapierKandidatData["profilDaten"],
  resumeDaten: ZapierKandidatData["resumeDaten"],
) {
  const standardSoftware = [
    { name: "MS Office", level: 95 },
    { name: "Google Workspace", level: 90 },
  ]

  // Füge branchenspezifische Software hinzu basierend auf Kernthemen
  if (profilDaten.kernthemen.some((thema) => thema.toLowerCase().includes("recruiting"))) {
    standardSoftware.push({ name: "Recruiting-Tools", level: 85 }, { name: "ATS-Systeme", level: 80 })
  }

  if (
    profilDaten.kernthemen.some(
      (thema) => thema.toLowerCase().includes("data") || thema.toLowerCase().includes("analyse"),
    )
  ) {
    standardSoftware.push({ name: "Excel/Analytics", level: 90 }, { name: "BI-Tools", level: 75 })
  }

  // Füge SAP hinzu wenn in Zertifikaten erwähnt
  if (resumeDaten.certificates.some((cert) => cert.name.toLowerCase().includes("sap"))) {
    standardSoftware.push({ name: "SAP", level: 85 })
  }

  return standardSoftware
}

/**
 * Generiert Achievements basierend auf der Jobbeschreibung
 */
function generiereAchievements(job: ZapierKandidatData["resumeDaten"]["work"][0]): string[] {
  if (job.highlights && job.highlights.length > 0) {
    return job.highlights
  }

  // Generiere standardmäßige Achievements basierend auf der Position
  if (job.position.toLowerCase().includes("ceo") || job.position.toLowerCase().includes("gründer")) {
    return [
      "Erfolgreiche Unternehmensführung und strategische Ausrichtung",
      "Aufbau und Entwicklung von Geschäftsprozessen",
      "Führung und Motivation von interdisziplinären Teams",
      "Etablierung von Partnerschaften und Kundenbeziehungen",
    ]
  } else if (job.position.toLowerCase().includes("projekt")) {
    return [
      "Erfolgreiche Durchführung komplexer Projekte",
      "Koordination zwischen verschiedenen Stakeholdern",
      "Einhaltung von Budgets und Zeitplänen",
      "Implementierung von Prozessverbesserungen",
    ]
  } else if (job.position.toLowerCase().includes("manager")) {
    return [
      "Führung und Entwicklung von Mitarbeiterteams",
      "Optimierung von Arbeitsabläufen und Prozessen",
      "Erreichung und Übertreffen von Zielvorgaben",
      "Aufbau von Kundenbeziehungen und Partnerschaften",
    ]
  }

  return [
    `Erfolgreiche Tätigkeit als ${job.position}`,
    "Beitrag zur Unternehmensentwicklung und -erfolg",
    "Enge Zusammenarbeit mit internen und externen Stakeholdern",
    "Kontinuierliche Weiterentwicklung fachlicher Kompetenzen",
  ]
}

/**
 * Generiert eine passende Notiz für Ausbildungen
 */
function generiereAusbildungsNotiz(area: string): string {
  if (area.toLowerCase().includes("informatik")) {
    return "Schwerpunkt: Digitale Transformation und Prozessoptimierung"
  } else if (area.toLowerCase().includes("psychologie")) {
    return "Schwerpunkt: Arbeits- und Organisationspsychologie"
  } else if (area.toLowerCase().includes("wirtschaft")) {
    return "Schwerpunkt: Unternehmensführung und strategisches Management"
  } else if (area.toLowerCase().includes("engineering")) {
    return "Schwerpunkt: Technische Innovation und Projektmanagement"
  }
  return `Schwerpunkt: ${area}`
}

/**
 * Generiert einen passenden Issuer für Zertifikate
 */
function generiereZertifikatIssuer(name: string): string {
  if (name.toLowerCase().includes("sap")) {
    return "SAP"
  } else if (name.toLowerCase().includes("microsoft")) {
    return "Microsoft"
  } else if (name.toLowerCase().includes("google")) {
    return "Google"
  } else if (name.toLowerCase().includes("stipendium")) {
    return "Bundesministerium für Bildung und Forschung"
  }
  return "Zertifizierungsstelle"
}

/**
 * Generiert eine passende Beschreibung für Zertifikate
 */
function generiereZertifikatBeschreibung(name: string): string {
  if (name.toLowerCase().includes("sap")) {
    return "Zertifizierung in SAP-Systemen und Business Intelligence"
  } else if (name.toLowerCase().includes("stipendium")) {
    return "Leistungsstipendium für herausragende Studienleistungen"
  } else if (name.toLowerCase().includes("project")) {
    return "Zertifizierung in Projektmanagement-Methoden"
  }
  return `Professionelle Zertifizierung: ${name}`
}
