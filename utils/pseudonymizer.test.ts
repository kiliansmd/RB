// Basic test structure without Jest dependencies
// Run with: npm test or jest if configured

import { pseudonymizeProfile, containsPII, pseudonymizeMultipleProfiles } from './pseudonymizer'
import { Kandidat } from '@/types/kandidat'
import { PseudonymizationOptions } from '@/types/pseudonymized'

// Simple test assertion function
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  assert(actual === expected, message || `Expected ${expected}, got ${actual}`)
}

function assertMatch(actual: string, pattern: RegExp, message?: string): void {
  assert(pattern.test(actual), message || `Expected ${actual} to match ${pattern}`)
}

// Mock candidate data for testing
const mockKandidat: Kandidat = {
  name: "Max Mustermann",
  position: "Senior Software Entwickler",
  gehalt: "80.000 - 100.000 EUR",
  standort: "München",
  verfuegbarkeit: "Sofort",
  erfahrung: "8+ Jahre",
  location: {
    address: "Musterstraße 123",
    postalCode: "80331",
    city: "München",
    countryCode: "DE",
    region: "Bayern"
  },
  kurzprofil: "Erfahrener Entwickler mit Fokus auf Backend-Technologien",
  lebenslauf: "Detaillierter Lebenslauf...",
  einschaetzung: "Sehr guter Kandidat",
  senioritaet: "Senior",
  jobrollen: ["Backend Developer", "Full Stack Developer"],
  kernthemen: ["JavaScript", "Node.js", "React", "Docker"],
  persoenlicheDaten: {
    geburtsdatum: "1990-05",
    geburtsort: "München", 
    wohnort: "München",
    familienstand: "Ledig"
  },
  softwareKenntnisse: [
    { name: "JavaScript", level: 95 },
    { name: "Python", level: 80 }
  ],
  sprachkenntnisse: [
    { sprache: "Deutsch", niveau: "Muttersprache", level: 100 },
    { sprache: "Englisch", niveau: "Berufliche Kenntnisse", level: 85 }
  ],
  highlights: [
    { icon: "trophy", title: "Elite Performance", description: "Top 1%", metric: "95%", label: "Success Rate" }
  ],
  topSkills: [
    { title: "Backend Development", description: "Expert level", keywords: ["Node.js", "Express"] }
  ],
  work: [
    {
      name: "SAP SE",
      position: "Senior Developer",
      startDate: "2020-01",
      endDate: "Present",
      summary: "Enterprise software development",
      achievements: ["Led team of 5 developers", "Implemented microservices architecture"]
    },
    {
      name: "StartupXY GmbH",
      position: "Full Stack Developer", 
      startDate: "2018-06",
      endDate: "2019-12",
      summary: "Full stack development for fintech startup",
      achievements: ["Built MVP from scratch", "Increased user engagement by 40%"]
    }
  ],
  education: [
    {
      institution: "TU München",
      url: "https://www.tum.de",
      area: "Informatik",
      studyType: "Master of Science",
      startDate: "2012-10",
      endDate: "2015-03",
      note: "Schwerpunkt Software Engineering"
    },
    {
      institution: "RWTH Aachen",
      url: "https://www.rwth-aachen.de",
      area: "Informatik",
      studyType: "Bachelor of Science", 
      startDate: "2009-10",
      endDate: "2012-09",
      note: "Abschluss mit Auszeichnung"
    }
  ],
  certificates: [
    {
      name: "AWS Certified Solutions Architect",
      date: "2021-03",
      issuer: "Amazon Web Services",
      description: "Cloud architecture certification"
    }
  ],
  languages: [
    { language: "Deutsch", fluency: "Native" },
    { language: "Englisch", fluency: "Professional" }
  ],
  publications: [],
  interests: [{ name: "Open Source" }],
  references: [{ name: "John Doe", reference: "Excellent developer" }]
}

// Test runner function
export function runPseudonymizationTests(): void {
  console.log('🔒 Running Pseudonymization Tests...\n')

  try {
    // Test 1: Name pseudonymization
    console.log('Test 1: Name pseudonymization')
    const result1 = pseudonymizeProfile(mockKandidat, { candidateIndex: 0 })
    assertEqual(result1.data.name, 'Kandidat:in A')
    
    const result2 = pseudonymizeProfile(mockKandidat, { candidateIndex: 1 })
    assertEqual(result2.data.name, 'Kandidat:in B')
    console.log('✅ Passed\n')

    // Test 2: Location regionalization
    console.log('Test 2: Location regionalization')
    const result = pseudonymizeProfile(mockKandidat)
    assertEqual(result.data.location.address, 'Anonymisiert')
    assertEqual(result.data.location.postalCode, 'XXXXX')
    assertEqual(result.data.location.city, 'Bayern, Süddeutschland')
    assertEqual(result.data.standort, 'Bayern, Süddeutschland')
    console.log('✅ Passed\n')

    // Test 3: Company categorization
    console.log('Test 3: Company categorization')
    assertEqual(result.data.work[0].name, 'Software-Unternehmen (10.000+ MA)')
    assertEqual(result.data.work[1].name, 'Tech-Startup (10-50 MA)')
    console.log('✅ Passed\n')

    // Test 4: Education categorization
    console.log('Test 4: Education categorization')
    assertEqual(result.data.education[0].institution, 'Technische Universität in Bayern')
    assertEqual(result.data.education[1].institution, 'Technische Hochschule in NRW')
    console.log('✅ Passed\n')

    // Test 5: Date format preservation
    console.log('Test 5: Date format preservation')
    const dateResult = pseudonymizeProfile(mockKandidat, { dateShiftRange: 1 })
    assertMatch(dateResult.data.work[0].startDate, /^\d{4}-\d{2}$/)
    assertEqual(dateResult.data.work[0].endDate, 'Present')
    console.log('✅ Passed\n')

    // Test 6: Consistent seeded results
    console.log('Test 6: Consistent seeded results')
    const seed = 'test-seed-123'
    const seededResult1 = pseudonymizeProfile(mockKandidat, { seed })
    const seededResult2 = pseudonymizeProfile(mockKandidat, { seed })
    assertEqual(seededResult1.data.persoenlicheDaten.geburtsdatum, seededResult2.data.persoenlicheDaten.geburtsdatum)
    console.log('✅ Passed\n')

    // Test 7: Transformation tracking
    console.log('Test 7: Transformation tracking')
    assert(result.metadata.transformationsApplied.includes('name → sequential identifier'), 'Should track name transformation')
    assert(result.metadata.transformationsApplied.includes('location → regionalized'), 'Should track location transformation')
    assert(result.metadata.transformationsApplied.includes('companies → categorized'), 'Should track company transformation')
    console.log('✅ Passed\n')

    // Test 8: PII detection
    console.log('Test 8: PII detection')
    const dataWithPII = { name: 'John Doe', email: 'john@example.com' }
    const dataWithoutPII = { skills: ['JavaScript'], experience: '5 years' }
    assert(containsPII(dataWithPII), 'Should detect PII')
    assert(!containsPII(dataWithoutPII), 'Should not detect PII in clean data')
    assert(!containsPII(null), 'Should handle null data')
    console.log('✅ Passed\n')

    // Test 9: Multiple profiles
    console.log('Test 9: Multiple profile pseudonymization')
    const profiles = [mockKandidat, mockKandidat, mockKandidat]
    const results = pseudonymizeMultipleProfiles(profiles)
    assertEqual(results.length, 3)
    assertEqual(results[0].data.name, 'Kandidat:in A')
    assertEqual(results[1].data.name, 'Kandidat:in B')
    assertEqual(results[2].data.name, 'Kandidat:in C')
    console.log('✅ Passed\n')

    // Test 10: Edge cases
    console.log('Test 10: Edge case handling')
    const incompleteKandidat: Partial<Kandidat> = {
      name: "Test User",
      position: "Developer"
    }
    const edgeResult = pseudonymizeProfile(incompleteKandidat as Kandidat)
    assertEqual(edgeResult.data.name, 'Kandidat:in A')
    assertEqual(edgeResult.data.location.city, 'Deutschland')
    console.log('✅ Passed\n')

    console.log('🎉 All tests passed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

// Test specific company categorizations
export function testCompanyCategorization(): void {
  console.log('🏢 Testing Company Categorization...\n')

  const testCases = [
    { input: 'Microsoft Deutschland GmbH', expected: 'Software-Unternehmen (10.000+ MA)' },
    { input: 'McKinsey & Company', expected: 'Beratungsunternehmen (1.000-10.000 MA)' },
    { input: 'Deutsche Bank AG', expected: 'Finanzdienstleister (1.000-10.000 MA)' },
    { input: 'BMW Group', expected: 'Automotive-Konzern (10.000+ MA)' },
    { input: 'TechStart UG', expected: 'Tech-Startup (10-50 MA)' },
    { input: 'Bundesamt für Sicherheit', expected: 'Öffentlicher Sektor (1.000-10.000 MA)' }
  ]

  testCases.forEach(({ input, expected }, index) => {
    const testKandidat = {
      ...mockKandidat,
      work: [{
        ...mockKandidat.work[0],
        name: input
      }]
    }
    
    const result = pseudonymizeProfile(testKandidat)
    try {
      assertEqual(result.data.work[0].name, expected)
      console.log(`✅ Test ${index + 1}: "${input}" → "${expected}"`)
    } catch (error) {
      console.error(`❌ Test ${index + 1} failed: "${input}"`)
      console.error(`Expected: "${expected}"`)
      console.error(`Got: "${result.data.work[0].name}"`)
      throw error
    }
  })

  console.log('\n🎉 All company categorization tests passed!')
}

// Test location regionalization
export function testLocationRegionalization(): void {
  console.log('🗺️ Testing Location Regionalization...\n')

  const locationCases = [
    { input: 'München', expected: 'Bayern, Süddeutschland' },
    { input: 'Hamburg', expected: 'Norddeutschland, Hansestadt' },
    { input: 'Berlin', expected: 'Berlin/Brandenburg, Ostdeutschland' },
    { input: 'Stuttgart', expected: 'Baden-Württemberg, Süddeutschland' },
    { input: 'Köln', expected: 'Nordrhein-Westfalen, Westdeutschland' },
    { input: 'UnknownCity', expected: 'Deutschland' }
  ]

  locationCases.forEach(({ input, expected }, index) => {
    const testKandidat = {
      ...mockKandidat,
      location: { ...mockKandidat.location, city: input },
      standort: input
    }
    
    const result = pseudonymizeProfile(testKandidat)
    try {
      assertEqual(result.data.location.city, expected)
      assertEqual(result.data.standort, expected)
      console.log(`✅ Test ${index + 1}: "${input}" → "${expected}"`)
    } catch (error) {
      console.error(`❌ Test ${index + 1} failed: "${input}"`)
      throw error
    }
  })

  console.log('\n🎉 All location regionalization tests passed!')
}

// Run all tests if this file is executed directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // Running in Node.js environment
  try {
    runPseudonymizationTests()
    testCompanyCategorization()
    testLocationRegionalization()
  } catch (error) {
    process.exit(1)
  }
} 