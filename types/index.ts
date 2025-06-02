export interface Resume {
  id: string;
  name?: string;
  title?: string;
  fileName?: string;
  uploadedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  contact?: {
    location_city?: string;
    location_country?: string;
    email?: string;
  };
  derived?: {
    years_of_experience?: number;
  };
  skills?: string[];
  senioritaet?: string;
}

export interface Kandidat {
  id?: string;
  name: string;
  position: string;
  gehalt: string;
  standort: string;
  verfuegbarkeit: string;
  erfahrung: string;
  location: {
    address: string;
    postalCode: string;
    city: string;
    countryCode: string;
    region: string;
  };
  kurzprofil: string;
  senioritaet: string;
  jobrollen: string[];
  kernthemen: string[];
  work: {
    name: string;
    position: string;
    startDate: string;
    endDate: string;
    summary: string;
    achievements: string[];
  }[];
  education: {
    institution: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate: string;
  }[];
  skills: string[];
  languages: {
    language: string;
    fluency: string;
  }[];
}

export interface AccountManager {
  id?: string;
  name: string;
  position: string;
  email: string;
  phone: string;
} 