export interface Location {
  address: string
  postalCode: string
  city: string
  countryCode: string
  region: string
}

export interface PersoenlicheDaten {
  geburtsdatum: string
  geburtsort: string
  wohnort: string
  familienstand: string
}

export interface SoftwareKenntnis {
  name: string
  level: number
}

export interface Sprachkenntnis {
  sprache: string
  niveau: string
  level: number
}

export interface Highlight {
  icon: string
  title: string
  description: string
  metric: string
  label: string
}

export interface TopSkill {
  title: string
  description: string
  keywords: string[]
}

export interface WorkExperience {
  name: string
  position: string
  startDate: string
  endDate: string
  summary: string
  achievements: string[]
}

export interface Education {
  institution: string
  url: string
  area: string
  studyType: string
  startDate: string
  endDate: string
  note: string
}

export interface Certificate {
  name: string
  date: string
  issuer: string
  description: string
}

export interface Language {
  language: string
  fluency: string
}

export interface Kandidat {
  name: string
  position: string
  gehalt: string
  standort: string
  verfuegbarkeit: string
  erfahrung: string
  location: Location
  kurzprofil: string
  lebenslauf: string
  einschaetzung: string
  senioritaet: string
  jobrollen: string[]
  kernthemen: string[]
  persoenlicheDaten: PersoenlicheDaten
  softwareKenntnisse: SoftwareKenntnis[]
  sprachkenntnisse: Sprachkenntnis[]
  highlights: Highlight[]
  topSkills: TopSkill[]
  work: WorkExperience[]
  education: Education[]
  certificates: Certificate[]
  languages: Language[]
  publications: any[]
  interests: Array<{ name?: string }>
  references: Array<{ name?: string; reference?: string }>
}

export interface AccountManager {
  name: string
  position: string
  email: string
  phone: string
}

export interface NavigationItem {
  id: string
  label: string
}

// Zusätzliche Typen für API-Responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface KandidatApiResponse {
  kandidat: Kandidat
  accountManager: AccountManager
  navSections: NavigationItem[]
  timestamp: string
}

// Typen für Zapier-Integration
export interface ZapierKandidatData {
  id: string
  profilDaten: {
    kurzprofil_text: string
    lebenslauf_text: string
    profil_einschaetzung: string
    senioritaet: string
    potenziell_passende_jobrollen: string[]
    kernthemen: string[]
  }
  resumeDaten: {
    basics: {
      name: string
      label: string
      image: string
      email: string
      phone: string
      url: string
      summary: string
      location: Location
      profiles: any[]
    }
    work: Array<{
      name: string
      position: string
      url: string
      startDate: string
      endDate: string
      summary: string
      highlights: string[]
    }>
    volunteer: any[]
    education: Array<{
      institution: string
      url: string
      area: string
      studyType: string
      startDate: string
      endDate: string
      score: string
      courses: string[]
    }>
    awards: any[]
    certificates: Array<{
      name: string
      date: string
      issuer: string
      url: string
    }>
    publications: any[]
    skills: any[]
    languages: Array<{
      language: string
      fluency: string
    }>
    interests: any[]
    references: any[]
    projects: any[]
  }
}
