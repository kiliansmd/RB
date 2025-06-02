import { transformKandidatenDaten } from "@/utils/data-transformer"
import type { Kandidat, AccountManager } from "@/types/kandidat"

// Beispiel für einen Account Manager
const defaultAccountManager: AccountManager = {
  name: "Daniela Sentesch",
  position: "Senior Talent Acquisition Manager",
  email: "d.sentesch@getexperts.de",
  phone: "+49 221 123456789",
}

/**
 * Lädt die Kandidatendaten aus den bereitgestellten JSON-Dateien
 */
export async function loadKandidatenDaten(): Promise<{
  kandidat: Kandidat
  accountManager: AccountManager
}> {
  try {
    // In einer echten Anwendung würden diese Daten von einer API geladen werden
    // Hier verwenden wir die statischen Daten aus den JSON-Dateien
    const profilDaten = {
      kurzprofil_text:
        "Kandidat:in A ist Gründer:in und CEO einer spezialisierten Personalberatung im DACH-Raum, die sich auf IT, Engineering und Sales fokussiert. Mit über vier Jahren Erfahrung in der Leitung von Recruiting-Prozessen hat er/sie innovative Ansätze entwickelt, die messbare Ergebnisse und hohe Prozesssicherheit gewährleisten. Durch ein umfangreiches Netzwerk von über 5.000 qualifizierten Fachkräften und eine datengetriebene Ansprache von passiven Kandidat:innen hat Kandidat:in A sich als vertrauenswürdiger Partner für Unternehmen etabliert, die auf der Suche nach hochqualifizierten Talenten sind. Seine/ihre Expertise erstreckt sich über verschiedene Branchen, darunter Cloud-Technologien, Embedded Systems und Business Development, was ihn/sie zu einem wertvollen Ansprechpartner für Fachbereichsleiter:innen und HR-Manager:innen macht.",
      lebenslauf_text:
        "Kandidat:in A ist Gründer:in und CEO einer innovativen Personalberatung, die sich auf die Rekrutierung von Fachkräften in den Bereichen IT, Engineering und Sales im DACH-Raum spezialisiert hat. Seit 2021 leitet er/sie erfolgreich die Geschäfte und hat dabei den Rekrutierungsprozess neu definiert, um maximale Prozesssicherheit und nachweisbaren ROI zu gewährleisten. Zuvor sammelte er/sie wertvolle Erfahrungen in verschiedenen Positionen, unter anderem im Projektmanagement bei einem großen Beratungsunternehmen sowie in der Assistenz der Geschäftsführung. Mit einem Bachelor-Abschluss in Wirtschaftsinformatik und einem weiteren in Psychologie bringt Kandidat:in A eine fundierte akademische Grundlage mit, die durch relevante Zertifizierungen, wie die SAP Certified Application Associate, ergänzt wird. Seine/ihre Sprachkenntnisse in Deutsch und Englisch ermöglichen eine effektive Kommunikation in internationalen Kontexten.",
      profil_einschaetzung:
        "Kandidat:in A bringt umfangreiche Erfahrung im Recruiting und eine starke unternehmerische Denkweise mit. Seine/ihre Fähigkeit, maßgeschneiderte Rekrutierungsstrategien zu entwickeln und ein breites Netzwerk von Fachkräften zu nutzen, macht ihn/sie zu einem idealen Partner für Unternehmen, die auf der Suche nach hochqualifizierten Talenten sind. Die Kombination aus technischer Expertise und einem tiefen Verständnis für die Bedürfnisse der Branche positioniert Kandidat:in A als wertvolle Ressource für Fachbereichsleiter:innen und HR-Manager:innen.",
      senioritaet: "Senior",
      potenziell_passende_jobrollen: ["Leiter:in Recruiting", "Talent Acquisition Manager", "HR Business Partner"],
      kernthemen: ["Recruiting", "Talent Acquisition", "Prozessoptimierung", "Datenanalyse"],
    }

    const resumeDaten = {
      basics: {
        name: "Kandidat:in A",
        label: "Gründer:in & CEO",
        image: "",
        email: "",
        phone: "",
        url: "",
        summary:
          "Gründer:in und CEO einer spezialisierten Personalberatung im DACH-Raum mit Fokus auf IT, Engineering und Sales.",
        location: {
          address: "Rudolfplatz 3",
          postalCode: "50674",
          city: "Köln",
          countryCode: "DE",
          region: "Nordrhein-Westfalen",
        },
        profiles: [],
      },
      work: [
        {
          name: "getexperts GmbH",
          position: "Gründer:in & CEO",
          url: "",
          startDate: "2021-01-01",
          endDate: "Present",
          summary: "Spezialisierte Personalberatung für IT, Engineering und Sales im DACH-Raum.",
          highlights: [],
        },
        {
          name: "Accenture",
          position: "Projektmitarbeiter",
          url: "",
          startDate: "2021-04-01",
          endDate: "2021-07-01",
          summary: "Mitwirkung im Projektmanagement.",
          highlights: [],
        },
        {
          name: "H&PS Project/Program Management Office",
          position: "Projektmitarbeiter",
          url: "",
          startDate: "2020-10-01",
          endDate: "2021-03-01",
          summary: "Unterstützung im Projektmanagement.",
          highlights: [],
        },
        {
          name: "THE 9TH",
          position: "Assistenz der Geschäftsführung",
          url: "",
          startDate: "2019-10-01",
          endDate: "2020-09-01",
          summary: "Assistenzaufgaben im Management.",
          highlights: [],
        },
        {
          name: "ABRACON GmbH",
          position: "Praktikant:in SAP Business Intelligence",
          url: "",
          startDate: "2017-02-01",
          endDate: "2019-09-01",
          summary: "Praktische Erfahrungen im Bereich SAP Business Intelligence.",
          highlights: [],
        },
      ],
      volunteer: [],
      education: [
        {
          institution: "Hochschule Bonn-Rhein-Sieg",
          url: "",
          area: "Wirtschaftsinformatik",
          studyType: "Bachelor of Science",
          startDate: "",
          endDate: "",
          score: "",
          courses: [],
        },
        {
          institution: "FernUniversität in Hagen",
          url: "",
          area: "Psychologie",
          studyType: "Bachelor of Science",
          startDate: "",
          endDate: "",
          score: "",
          courses: [],
        },
      ],
      awards: [],
      certificates: [
        {
          name: "SAP Certified Application Associate",
          date: "",
          issuer: "",
          url: "",
        },
        {
          name: "Stipendium",
          date: "",
          issuer: "",
          url: "",
        },
      ],
      publications: [],
      skills: [],
      languages: [
        {
          language: "Deutsch",
          fluency: "Muttersprache",
        },
        {
          language: "Englisch",
          fluency: "Berufliche Kenntnisse",
        },
      ],
      interests: [],
      references: [],
      projects: [],
    }

    // Transformiere die Daten in das benötigte Format
    const kandidat = transformKandidatenDaten(profilDaten, resumeDaten)

    return {
      kandidat,
      accountManager: defaultAccountManager,
    }
  } catch (error) {
    console.error("Fehler beim Laden der Kandidatendaten:", error)
    throw new Error("Fehler beim Laden der Kandidatendaten")
  }
}
