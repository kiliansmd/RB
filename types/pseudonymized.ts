import { Kandidat, AccountManager, NavigationItem } from './kandidat'

// Pseudonymized version of the Kandidat interface
// Same structure but with anonymized data
export interface PseudonymizedKandidat extends Omit<Kandidat, 'name' | 'location' | 'persoenlicheDaten' | 'work' | 'education'> {
  name: string // "Kandidat:in A", "Kandidat:in B", etc.
  location: PseudonymizedLocation
  persoenlicheDaten: PseudonymizedPersoenlicheDaten
  work: PseudonymizedWorkExperience[]
  education: PseudonymizedEducation[]
}

export interface PseudonymizedLocation {
  address: string // "Anonymisiert"
  postalCode: string // "XXXXX"
  city: string // Regionalized: "Bayern, Süddeutschland"
  countryCode: string // Keep as is
  region: string // Generalized region
}

export interface PseudonymizedPersoenlicheDaten {
  geburtsdatum: string // Shifted date, keep format
  geburtsort: string // Regionalized
  wohnort: string // Regionalized
  familienstand: string // Keep as is (not personally identifiable)
}

export interface PseudonymizedWorkExperience {
  name: string // Categorized company: "Enterprise-Software-Konzern (10.000+ MA)"
  position: string // Keep role titles (not personally identifiable)
  startDate: string // Shifted by ±1-2 months
  endDate: string // Shifted by ±1-2 months, preserve chronology
  summary: string // Keep as is (skills-focused, not personal)
  achievements: string[] // Keep as is (achievement descriptions, not personal)
}

export interface PseudonymizedEducation {
  institution: string // "Technische Universität in Bayern"
  url: string // Remove or anonymize
  area: string // Keep as is (field of study)
  studyType: string // Keep as is (degree type)
  startDate: string // Shifted date
  endDate: string // Shifted date
  note: string // Keep as is or anonymize if too specific
}

// Options for pseudonymization
export interface PseudonymizationOptions {
  seed?: string // For deterministic results in testing
  candidateIndex?: number // For sequential naming "A", "B", "C"
  devMode?: boolean // Show comparison in development
  preserveChronology?: boolean // Ensure date order remains correct (default: true)
  dateShiftRange?: number // Months to shift dates by (default: 1-2)
}

// Result interface for the pseudonymization process
export interface PseudonymizationResult {
  data: PseudonymizedKandidat
  metadata: {
    originalDataDetected: string[] // List of detected PII fields
    transformationsApplied: string[] // List of transformations performed
    timestamp: string
    seedUsed?: string
  }
}

// Company categorization enums
export enum CompanySize {
  STARTUP = "10-50 MA",
  SMALL = "50-250 MA", 
  MEDIUM = "250-1.000 MA",
  LARGE = "1.000-10.000 MA",
  ENTERPRISE = "10.000+ MA"
}

export enum IndustryCategory {
  SOFTWARE = "Software-Unternehmen",
  CONSULTING = "Beratungsunternehmen",
  FINANCE = "Finanzdienstleister",
  AUTOMOTIVE = "Automotive-Konzern",
  HEALTHCARE = "Gesundheitswesen",
  RETAIL = "Einzelhandel",
  MANUFACTURING = "Produktionsunternehmen",
  STARTUP = "Tech-Startup",
  GOVERNMENT = "Öffentlicher Sektor",
  EDUCATION = "Bildungseinrichtung",
  OTHER = "Branchenübergreifend"
}

// Location mapping for German regions
export interface RegionMapping {
  [city: string]: string
}

export const REGION_MAPPINGS: RegionMapping = {
  // Bayern
  "München": "Bayern, Süddeutschland",
  "Nürnberg": "Bayern, Süddeutschland", 
  "Augsburg": "Bayern, Süddeutschland",
  "Regensburg": "Bayern, Süddeutschland",
  
  // Baden-Württemberg
  "Stuttgart": "Baden-Württemberg, Süddeutschland",
  "Mannheim": "Baden-Württemberg, Süddeutschland",
  "Karlsruhe": "Baden-Württemberg, Süddeutschland",
  "Heidelberg": "Baden-Württemberg, Süddeutschland",
  
  // Nordrhein-Westfalen
  "Köln": "Nordrhein-Westfalen, Westdeutschland",
  "Düsseldorf": "Nordrhein-Westfalen, Westdeutschland",
  "Dortmund": "Nordrhein-Westfalen, Westdeutschland",
  "Essen": "Nordrhein-Westfalen, Westdeutschland",
  "Bonn": "Nordrhein-Westfalen, Westdeutschland",
  
  // Berlin/Brandenburg
  "Berlin": "Berlin/Brandenburg, Ostdeutschland",
  "Potsdam": "Berlin/Brandenburg, Ostdeutschland",
  
  // Hamburg/Schleswig-Holstein
  "Hamburg": "Norddeutschland, Hansestadt",
  "Kiel": "Schleswig-Holstein, Norddeutschland",
  "Lübeck": "Schleswig-Holstein, Norddeutschland",
  
  // Niedersachsen/Bremen
  "Hannover": "Niedersachsen, Norddeutschland",
  "Bremen": "Norddeutschland, Hansestadt",
  "Braunschweig": "Niedersachsen, Norddeutschland",
  "Osnabrück": "Niedersachsen, Norddeutschland",
  
  // Hessen
  "Frankfurt am Main": "Hessen, Rhein-Main-Gebiet",
  "Wiesbaden": "Hessen, Rhein-Main-Gebiet",
  "Kassel": "Hessen, Mitteldeutschland",
  "Darmstadt": "Hessen, Rhein-Main-Gebiet",
  
  // Sachsen
  "Dresden": "Sachsen, Ostdeutschland",
  "Leipzig": "Sachsen, Ostdeutschland",
  "Chemnitz": "Sachsen, Ostdeutschland",
  
  // Thüringen
  "Erfurt": "Thüringen, Mitteldeutschland",
  "Jena": "Thüringen, Mitteldeutschland",
  "Weimar": "Thüringen, Mitteldeutschland",
  
  // Sachsen-Anhalt
  "Magdeburg": "Sachsen-Anhalt, Ostdeutschland",
  "Halle": "Sachsen-Anhalt, Ostdeutschland",
  
  // Mecklenburg-Vorpommern
  "Rostock": "Mecklenburg-Vorpommern, Norddeutschland",
  "Schwerin": "Mecklenburg-Vorpommern, Norddeutschland",
  
  // Rheinland-Pfalz
  "Mainz": "Rheinland-Pfalz, Westdeutschland",
  "Koblenz": "Rheinland-Pfalz, Westdeutschland",
  "Ludwigshafen": "Rheinland-Pfalz, Westdeutschland",
  
  // Saarland
  "Saarbrücken": "Saarland, Westdeutschland"
} 