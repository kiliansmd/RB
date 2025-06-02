import { z } from 'zod';

// Contact Schema
const contactSchema = z.object({
  location_city: z.string().optional(),
  location_country: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional(),
  phone: z.string().optional(),
  linkedin: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  twitter: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
});

// Employment History Schema
const employmentSchema = z.object({
  company: z.string().min(1, "Firmenname erforderlich"),
  position: z.string().min(1, "Position erforderlich"),
  startDate: z.string(),
  endDate: z.string(),
  description: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
});

// Education Schema
const educationSchema = z.object({
  institution: z.string().min(1, "Institution erforderlich"),
  degree: z.string().optional(),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  graduationDate: z.string().optional(),
  url: z.string().url().optional().nullable(),
  note: z.string().optional(),
});

// Language Schema
const languageSchema = z.union([
  z.string(),
  z.object({
    language: z.string().min(1, "Sprache erforderlich"),
    fluency: z.string().optional(),
  })
]);

// Certificate Schema
const certificateSchema = z.object({
  name: z.string().min(1, "Zertifikatsname erforderlich"),
  date: z.string().optional(),
  issuer: z.string().optional(),
  description: z.string().optional(),
});

// Main Resume Schema
export const resumeSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  title: z.string().min(1, "Position ist erforderlich"),
  brief: z.string().optional(),
  contact: contactSchema.optional(),
  employment_history: z.array(employmentSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(languageSchema).optional(),
  derived: z.object({
    years_of_experience: z.number().optional(),
    approximate_age: z.number().optional(),
  }).optional(),
  certificates: z.array(certificateSchema).optional(),
  fileName: z.string().optional(),
  uploadedAt: z.any().optional(),
  gehalt: z.string().optional(),
  verfuegbarkeit: z.string().optional(),
  persoenlicheDaten: z.object({
    geburtsdatum: z.string().optional(),
    geburtsort: z.string().optional(),
    wohnort: z.string().optional(),
    familienstand: z.string().optional(),
  }).optional(),
  location: z.object({
    address: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    countryCode: z.string().optional(),
    region: z.string().optional(),
  }).optional(),
});

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "Datei darf maximal 10MB groß sein",
    })
    .refine((file) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png'
      ];
      return allowedTypes.includes(file.type);
    }, {
      message: "Nur PDF, DOC, DOCX und PNG Dateien sind erlaubt",
    }),
});

// Kandidat Search Schema
export const searchSchema = z.object({
  query: z.string().optional(),
  seniority: z.enum(['junior', 'mid', 'senior']).optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  availability: z.enum(['immediately', 'within_month', 'within_3_months', 'negotiable']).optional(),
  minExperience: z.number().min(0).optional(),
  maxExperience: z.number().max(50).optional(),
  sortBy: z.enum(['name', 'experience', 'uploadedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// API Response Wrapper
export function createApiResponse<T>(data: T, success: boolean = true) {
  return {
    success,
    data,
    timestamp: new Date().toISOString(),
  };
}

// Validation Helper
export async function validateRequest<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): Promise<T> {
  return schema.parseAsync(data);
} 