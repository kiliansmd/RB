import { Kandidat } from '@/types/kandidat'
import { 
  PseudonymizedKandidat, 
  PseudonymizationOptions, 
  PseudonymizationResult,
  CompanySize,
  IndustryCategory,
  REGION_MAPPINGS
} from '@/types/pseudonymized'

/**
 * Main pseudonymization function
 * Transforms all personal data in a Kandidat profile to anonymized alternatives
 */
export function pseudonymizeProfile(
  profile: Kandidat,
  options: PseudonymizationOptions = {}
): PseudonymizationResult {
  const {
    seed,
    candidateIndex = 0,
    devMode = process.env.NODE_ENV === 'development',
    preserveChronology = true,
    dateShiftRange = 2
  } = options

  // Initialize pseudo-random generator with seed for consistent results
  const rng = seed ? createSeededRNG(seed) : Math.random

  const transformationsApplied: string[] = []
  const originalDataDetected: string[] = []

  // Track original data for dev mode
  if (devMode) {
    if (profile.name) originalDataDetected.push('name')
    if (profile.location?.city) originalDataDetected.push('location.city')
    if (profile.persoenlicheDaten?.wohnort) originalDataDetected.push('persoenlicheDaten.wohnort')
    if (profile.work?.length > 0) originalDataDetected.push('work.companies')
    if (profile.education?.length > 0) originalDataDetected.push('education.institutions')
  }

  // Generate candidate identifier
  const candidateLetter = String.fromCharCode(65 + (candidateIndex % 26)) // A, B, C, ...
  const pseudonymizedName = `Kandidat:in ${candidateLetter}`
  transformationsApplied.push('name → sequential identifier')

  // Pseudonymize location
  const pseudonymizedLocation = {
    address: "Anonymisiert",
    postalCode: "XXXXX",
    city: generalizeLocation(profile.location?.city || ""),
    countryCode: profile.location?.countryCode || "DE",
    region: generalizeLocation(profile.location?.city || "")
  }
  if (profile.location?.city) transformationsApplied.push('location → regionalized')

  // Pseudonymize personal data
  const pseudonymizedPersoenlicheDaten = {
    geburtsdatum: profile.persoenlicheDaten?.geburtsdatum ? 
      shiftDate(profile.persoenlicheDaten.geburtsdatum, Math.floor(rng() * dateShiftRange * 2) - dateShiftRange) : "",
    geburtsort: generalizeLocation(profile.persoenlicheDaten?.geburtsort || ""),
    wohnort: generalizeLocation(profile.persoenlicheDaten?.wohnort || ""),
    familienstand: profile.persoenlicheDaten?.familienstand || ""
  }
  if (profile.persoenlicheDaten?.geburtsdatum) transformationsApplied.push('dates → shifted')
  if (profile.persoenlicheDaten?.wohnort) transformationsApplied.push('personal locations → regionalized')

  // Pseudonymize work experience with chronology preservation
  const workExperiences = [...(profile.work || [])]
  let pseudonymizedWork = workExperiences.map((work, index) => ({
    name: categorizeCompany(work.name),
    position: work.position, // Keep role titles as they're not personally identifiable
    startDate: work.startDate,
    endDate: work.endDate,
    summary: work.summary, // Keep as skills-focused
    achievements: work.achievements || []
  }))

  // Apply date shifts while preserving chronology
  if (preserveChronology && pseudonymizedWork.length > 0) {
    const baseShift = Math.floor(rng() * dateShiftRange * 2) - dateShiftRange
    pseudonymizedWork = pseudonymizedWork.map((work, index) => ({
      ...work,
      startDate: shiftDate(work.startDate, baseShift),
      endDate: shiftDate(work.endDate, baseShift)
    }))
    transformationsApplied.push('work dates → chronology-preserving shift')
  }

  if (profile.work?.length > 0) transformationsApplied.push('companies → categorized')

  // Pseudonymize education
  const pseudonymizedEducation = (profile.education || []).map(edu => ({
    institution: categorizeEducation(edu.institution),
    url: "", // Remove URLs
    area: edu.area, // Keep field of study
    studyType: edu.studyType, // Keep degree type
    startDate: shiftDate(edu.startDate, Math.floor(rng() * dateShiftRange * 2) - dateShiftRange),
    endDate: shiftDate(edu.endDate, Math.floor(rng() * dateShiftRange * 2) - dateShiftRange),
    note: edu.note // Keep as is or could be filtered if too specific
  }))
  if (profile.education?.length > 0) transformationsApplied.push('education institutions → categorized')

  // Create pseudonymized profile
  const pseudonymizedProfile: PseudonymizedKandidat = {
    ...profile,
    name: pseudonymizedName,
    standort: generalizeLocation(profile.standort || ""), // Also pseudonymize standort field
    location: pseudonymizedLocation,
    persoenlicheDaten: pseudonymizedPersoenlicheDaten,
    work: pseudonymizedWork,
    education: pseudonymizedEducation
  }

  const result: PseudonymizationResult = {
    data: pseudonymizedProfile,
    metadata: {
      originalDataDetected,
      transformationsApplied,
      timestamp: new Date().toISOString(),
      seedUsed: seed
    }
  }

  // Development mode logging
  if (devMode) {
    console.group('🔒 Pseudonymization Applied')
    console.table([
      { field: 'name', original: profile.name, pseudonymized: pseudonymizedName },
      { field: 'location', original: profile.location?.city, pseudonymized: pseudonymizedLocation.city },
      { field: 'standort', original: profile.standort, pseudonymized: pseudonymizedProfile.standort }
    ])
    console.log('Transformations:', transformationsApplied)
    console.log('Original PII detected:', originalDataDetected)
    console.groupEnd()
  }

  return result
}

/**
 * Categorize company names into industry categories with size estimates
 */
function categorizeCompany(companyName: string): string {
  if (!companyName) return "Unternehmen"

  const name = companyName.toLowerCase()
  
  // Detect industry
  let industry = IndustryCategory.OTHER
  let size = CompanySize.MEDIUM

  // Software/Tech companies
  if (name.includes('sap') || name.includes('oracle') || name.includes('microsoft') || 
      name.includes('ibm') || name.includes('google') || name.includes('amazon')) {
    industry = IndustryCategory.SOFTWARE
    size = CompanySize.ENTERPRISE
  }
  else if (name.includes('software') || name.includes('tech') || name.includes('digital') ||
           name.includes('it') || name.includes('data') || name.includes('cloud')) {
    industry = IndustryCategory.SOFTWARE
    size = estimateCompanySize(name)
  }
  
  // Consulting
  else if (name.includes('consulting') || name.includes('beratung') || name.includes('advisory') ||
           name.includes('mckinsey') || name.includes('bcg') || name.includes('deloitte') ||
           name.includes('pwc') || name.includes('kpmg') || name.includes('ey')) {
    industry = IndustryCategory.CONSULTING
    size = name.includes('mckinsey') || name.includes('bcg') ? CompanySize.LARGE : estimateCompanySize(name)
  }
  
  // Finance
  else if (name.includes('bank') || name.includes('finance') || name.includes('invest') ||
           name.includes('asset') || name.includes('capital') || name.includes('deutsche bank') ||
           name.includes('commerzbank') || name.includes('allianz')) {
    industry = IndustryCategory.FINANCE
    size = CompanySize.LARGE
  }
  
  // Automotive
  else if (name.includes('bmw') || name.includes('mercedes') || name.includes('volkswagen') ||
           name.includes('audi') || name.includes('porsche') || name.includes('automotive') ||
           name.includes('auto')) {
    industry = IndustryCategory.AUTOMOTIVE
    size = CompanySize.ENTERPRISE
  }
  
  // Startups (detected by legal form)
  else if (name.includes('gmbh') || name.includes('ug') || name.includes('startup')) {
    industry = IndustryCategory.STARTUP
    size = CompanySize.STARTUP
  }
  
  // Government/Public sector
  else if (name.includes('bundesamt') || name.includes('ministerium') || name.includes('behörde') ||
           name.includes('stadt') || name.includes('kommune') || name.includes('öffentlich')) {
    industry = IndustryCategory.GOVERNMENT
    size = CompanySize.LARGE
  }
  
  // Education
  else if (name.includes('universität') || name.includes('hochschule') || name.includes('uni') ||
           name.includes('tu') || name.includes('fh') || name.includes('akademie')) {
    industry = IndustryCategory.EDUCATION
    size = CompanySize.LARGE
  }
  
  // Default size estimation if not explicitly set
  else {
    size = estimateCompanySize(name)
  }

  return `${industry} (${size})`
}

/**
 * Estimate company size based on name indicators
 */
function estimateCompanySize(companyName: string): CompanySize {
  const name = companyName.toLowerCase()
  
  // Large enterprise indicators
  if (name.includes('ag') || name.includes('se') || name.includes('group') || 
      name.includes('holding') || name.includes('international') || name.includes('global')) {
    return CompanySize.ENTERPRISE
  }
  
  // Startup indicators
  if (name.includes('ug') || name.includes('startup') || name.includes('labs')) {
    return CompanySize.STARTUP
  }
  
  // Small company indicators
  if (name.includes('gbr') || name.includes('einzelunternehmen')) {
    return CompanySize.SMALL
  }
  
  // Default to medium
  return CompanySize.MEDIUM
}

/**
 * Categorize educational institutions
 */
function categorizeEducation(institutionName: string): string {
  if (!institutionName) return "Bildungseinrichtung"

  const name = institutionName.toLowerCase()
  
  // Technical universities
  if (name.includes('tu ') || name.includes('technische universität') || 
      name.includes('technical university') || name.includes('rwth') ||
      name.includes('kit') || name.includes('tum')) {
    
    // Determine region
    if (name.includes('münchen') || name.includes('tum')) {
      return "Technische Universität in Bayern"
    } else if (name.includes('aachen') || name.includes('rwth')) {
      return "Technische Hochschule in NRW"
    } else if (name.includes('berlin')) {
      return "Technische Universität in Berlin"
    } else if (name.includes('dresden')) {
      return "Technische Universität in Sachsen"
    } else if (name.includes('karlsruhe') || name.includes('kit')) {
      return "Technische Hochschule in Baden-Württemberg"
    }
    return "Technische Universität"
  }
  
  // Regular universities
  else if (name.includes('universität') || name.includes('university') || name.includes('uni ')) {
    const region = extractRegionFromInstitution(name)
    return `Universität${region ? ` in ${region}` : ""}`
  }
  
  // Universities of applied sciences
  else if (name.includes('hochschule') || name.includes('fh ') || name.includes('fachhochschule')) {
    const region = extractRegionFromInstitution(name)
    return `Hochschule für angewandte Wissenschaften${region ? ` in ${region}` : ""}`
  }
  
  // Business schools
  else if (name.includes('business school') || name.includes('management') || name.includes('economic')) {
    return "Wirtschaftshochschule"
  }
  
  return "Bildungseinrichtung"
}

/**
 * Extract region from institution name
 */
function extractRegionFromInstitution(institutionName: string): string {
  const name = institutionName.toLowerCase()
  
  // Check for city names and map to regions
  for (const [city, region] of Object.entries(REGION_MAPPINGS)) {
    if (name.includes(city.toLowerCase())) {
      return region.split(',')[0] // Just the state/region part
    }
  }
  
  return ""
}

/**
 * Generalize location to region
 */
function generalizeLocation(location: string): string {
  if (!location) return "Deutschland"
  
  // Direct mapping
  if (REGION_MAPPINGS[location]) {
    return REGION_MAPPINGS[location]
  }
  
  // Fuzzy matching for partial city names
  const locationLower = location.toLowerCase()
  for (const [city, region] of Object.entries(REGION_MAPPINGS)) {
    if (locationLower.includes(city.toLowerCase()) || city.toLowerCase().includes(locationLower)) {
      return region
    }
  }
  
  // Default fallback
  return "Deutschland"
}

/**
 * Shift date while preserving format
 * Supports: "YYYY-MM", "YYYY", "Present", "MM/YYYY", "YYYY-MM-DD"
 */
function shiftDate(dateStr: string, shiftMonths: number): string {
  if (!dateStr || dateStr === "Present" || dateStr === "Heute" || dateStr === "Current") {
    return dateStr
  }

  try {
    let date: Date
    let format: string

    // Detect format and parse
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // YYYY-MM-DD
      date = new Date(dateStr)
      format = 'YYYY-MM-DD'
    } else if (/^\d{4}-\d{2}$/.test(dateStr)) {
      // YYYY-MM
      const [year, month] = dateStr.split('-')
      date = new Date(parseInt(year), parseInt(month) - 1, 1)
      format = 'YYYY-MM'
    } else if (/^\d{2}\/\d{4}$/.test(dateStr)) {
      // MM/YYYY
      const [month, year] = dateStr.split('/')
      date = new Date(parseInt(year), parseInt(month) - 1, 1)
      format = 'MM/YYYY'
    } else if (/^\d{4}$/.test(dateStr)) {
      // YYYY
      date = new Date(parseInt(dateStr), 0, 1)
      format = 'YYYY'
    } else {
      // Unknown format, return as-is
      return dateStr
    }

    // Apply shift
    date.setMonth(date.getMonth() + shiftMonths)

    // Format back to original format
    switch (format) {
      case 'YYYY-MM-DD':
        return date.toISOString().split('T')[0]
      case 'YYYY-MM':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      case 'MM/YYYY':
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
      case 'YYYY':
        return date.getFullYear().toString()
      default:
        return dateStr
    }
  } catch (error) {
    // If parsing fails, return original
    console.warn(`Failed to parse date: ${dateStr}`, error)
    return dateStr
  }
}

/**
 * Create a seeded random number generator for consistent results
 */
function createSeededRNG(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return function() {
    hash = ((hash * 1664525) + 1013904223) % Math.pow(2, 32)
    return (hash / Math.pow(2, 32)) + 0.5
  }
}

/**
 * Utility function to check if data contains PII that should be pseudonymized
 */
export function containsPII(data: any): boolean {
  if (!data) return false
  
  const piiFields = ['name', 'email', 'phone', 'address']
  
  for (const field of piiFields) {
    if (data[field]) return true
  }
  
  return false
}

/**
 * Utility function for batch pseudonymization
 */
export function pseudonymizeMultipleProfiles(
  profiles: Kandidat[],
  options: PseudonymizationOptions = {}
): PseudonymizationResult[] {
  return profiles.map((profile, index) => 
    pseudonymizeProfile(profile, { ...options, candidateIndex: index })
  )
} 