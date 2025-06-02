'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { KandidatenProfile } from '@/components/kandidaten-profile';
import { ResumeSkeleton } from '@/components/ui/resume-skeleton';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { MobileMenu } from '@/components/MobileMenu';
import { PseudonymizationDebug } from '@/components/PseudonymizationDebug';
import { generateAnonymousCandidateName } from '@/utils/anonymize-helpers';
import { appConfig } from '@/config/app.config';
import type { Kandidat, AccountManager, NavigationItem } from '@/types/kandidat';
import { useToast } from '@/hooks/use-toast';
import { transformKandidatenDaten } from '@/utils/data-transformer';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import { pseudonymizeProfile } from '@/utils/pseudonymizer';
import type { PseudonymizationResult } from '@/types/pseudonymized';

interface ParsedResume {
  name?: string;
  title?: string;
  brief?: string;
  contact?: {
    location_city?: string;
    location_country?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string | null;
    twitter?: string | null;
    website?: string | null;
  };
  employment_history?: Array<{
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string[];
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    graduationDate?: string;
    url?: string | null;
    area?: string;
    studyType?: string;
    note?: string;
  }>;
  skills?: string[];
  languages?: Array<{
    language?: string;
    fluency?: string;
  }> | string[];
  derived?: {
    years_of_experience?: number;
    approximate_age?: number;
  };
  fileName?: string;
  uploadedAt?: {
    _seconds?: number;
    _nanoseconds?: number;
  };
  certificates?: Array<{
    name?: string;
    description?: string;
    date?: string;
    issuer?: string;
  }>;
  publications?: any[];
  interests?: any[];
  references?: any[];
  gehalt?: string;
  verfuegbarkeit?: string;
  persoenlicheDaten?: {
    geburtsdatum?: string;
    geburtsort?: string;
    wohnort?: string;
    familienstand?: string;
  };
  location?: {
    address?: string;
    postalCode?: string;
    city?: string;
    countryCode?: string;
    region?: string;
  };
}

export default function CandidateDetailsPage() {
  const { id } = useParams();
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [pseudonymizationMetadata, setPseudonymizationMetadata] = useState<PseudonymizationResult['metadata'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const response = await fetch(`/api/resume/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch resume data');
        }
        
        const result = await response.json();
        
        // Handle API response wrapper
        let data = result.data || result;
        
        // Handle Firebase data structure where actual data is under 'parsed'
        if (data.parsed) {
          data = { ...data.parsed, ...data }; // Merge parsed data with any additional metadata
        }
        
        console.log("Fetched resume data:", data);
        
        // 🔒 APPLY PSEUDONYMIZATION IMMEDIATELY AFTER FETCH
        // Convert resume data to Kandidat format first, then pseudonymize
        const kandidatData = mapResumeToKandidat(data);
        
        // Apply pseudonymization with sequential naming based on ID
        const candidateIndex = typeof id === 'string' ? parseInt(id.slice(-1)) || 0 : 0;
        const pseudonymizationOptions = {
          candidateIndex,
          devMode: process.env.NODE_ENV === 'development',
          preserveChronology: true,
          dateShiftRange: 2
        };
        
        const pseudonymizationResult = pseudonymizeProfile(kandidatData, pseudonymizationOptions);
        
        // Convert pseudonymized Kandidat back to ParsedResume format for compatibility
        const pseudonymizedResumeData = mapKandidatToResume(pseudonymizationResult.data);
        
        // Store both pseudonymized data and metadata
        setResumeData(pseudonymizedResumeData);
        setPseudonymizationMetadata(pseudonymizationResult.metadata);
        
        // Development mode: Log pseudonymization results
        if (process.env.NODE_ENV === 'development') {
          console.group('🔒 Pseudonymization Applied');
          console.log('Original data PII detected:', pseudonymizationResult.metadata.originalDataDetected);
          console.log('Transformations applied:', pseudonymizationResult.metadata.transformationsApplied);
          console.log('Pseudonymized data preview:', {
            name: pseudonymizationResult.data.name,
            location: pseudonymizationResult.data.location?.city,
            companies: pseudonymizationResult.data.work?.map(w => w.name)
          });
          console.groupEnd();
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resume data';
        setError(errorMessage);
        
        toast({
          title: 'Fehler beim Laden',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResumeData();
    }
  }, [id, toast]);

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    if (dateStr === 'Present') return 'Heute';
    
    try {
      let date;
      if (dateStr.includes('-')) {
        date = new Date(dateStr);
      } else if (dateStr.match(/^\d{4}$/)) {
        date = new Date(parseInt(dateStr), 0, 1);
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) return dateStr;
      
      return new Intl.DateTimeFormat('de-DE', { 
        year: 'numeric', 
        month: 'long'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const mapResumeToKandidat = (resume: ParsedResume): Kandidat => {
    if (!resume) {
      return {
        name: '',
        position: '',
        gehalt: 'Auf Anfrage',
        standort: '',
        verfuegbarkeit: 'Sofort',
        erfahrung: '0 Jahre',
        location: { address: '', postalCode: '', city: '', countryCode: '', region: '' },
        kurzprofil: '',
        lebenslauf: '',
        einschaetzung: '',
        senioritaet: 'Mid-Level',
        jobrollen: [],
        kernthemen: [],
        persoenlicheDaten: { geburtsdatum: '', geburtsort: '', wohnort: '', familienstand: '' },
        softwareKenntnisse: [],
        sprachkenntnisse: [],
        highlights: [],
        topSkills: [],
        work: [],
        education: [],
        certificates: [],
        languages: [],
        publications: [],
        interests: [],
        references: [],
      } as Kandidat; 
    }

    const contact = resume.contact || {};
    const derived = resume.derived || {};
    const personalData = resume.persoenlicheDaten || {};
    const skills = Array.isArray(resume.skills) ? resume.skills : [];
    const languages = Array.isArray(resume.languages) ? resume.languages : [];
    const employmentHistory = Array.isArray(resume.employment_history) ? resume.employment_history : [];
    const education = Array.isArray(resume.education) ? resume.education : [];
    const certificates = Array.isArray(resume.certificates) ? resume.certificates : [];

    return {
      name: resume.name || '',
      position: resume.title || '',
      gehalt: resume.gehalt || 'Auf Anfrage',
      standort: `${contact.location_city || ''}, ${contact.location_country || ''}`,
      verfuegbarkeit: resume.verfuegbarkeit || 'Sofort',
      erfahrung: `${derived.years_of_experience ?? 0} Jahre`,
      location: {
        address: resume.location?.address || '',
        postalCode: resume.location?.postalCode || '',
        city: contact.location_city || '',
        countryCode: contact.location_country || '',
        region: resume.location?.region || '',
      },
      kurzprofil: resume.brief || '',
      lebenslauf: '',
      einschaetzung: resume.brief || '',
      senioritaet: (derived.years_of_experience ?? 0) > 5 ? 'Senior' : 'Mid-Level',
      jobrollen: resume.title ? [resume.title] : [],
      kernthemen: skills,
      persoenlicheDaten: {
        geburtsdatum: personalData.geburtsdatum || '',
        geburtsort: personalData.geburtsort || '',
        wohnort: personalData.wohnort || contact.location_city || '',
        familienstand: personalData.familienstand || '',
      },
      softwareKenntnisse: skills.map((skill: any) => ({
        name: (typeof skill === 'string' ? skill : skill?.name) || '',
        level: (typeof skill === 'object' ? skill?.level : undefined) ?? 80
      })),
      sprachkenntnisse: languages.map((lang: any) => ({
        sprache: (typeof lang === 'string' ? lang : lang?.language) || '',
        niveau: (typeof lang === 'object' ? lang?.fluency : 'Fließend') || 'Fließend',
        level: (typeof lang === 'object' ? lang?.level : undefined) ?? 80
      })),
      highlights: [
        { icon: 'Users', title: 'Netzwerk', description: 'Umfangreiches professionelles Netzwerk', metric: '500+', label: 'Kontakte' },
        { icon: 'TrendingUp', title: `${derived.years_of_experience ?? 0}+ Jahre`, description: 'Berufserfahrung', metric: `${derived.years_of_experience ?? 0}+`, label: 'Jahre Erfahrung' },
        { icon: 'Target', title: 'Expertise', description: `Spezialist für ${skills.slice(0, 2).join(' und ')}`, metric: skills.length.toString(), label: 'Kernkompetenzen' },
        { icon: 'Zap', title: 'Verfügbar', description: resume.verfuegbarkeit || 'Sofort verfügbar', metric: '100%', label: 'Einsatzbereit' }
      ],
      topSkills: skills.slice(0, 3).map((skill: any) => ({
        title: (typeof skill === 'string' ? skill : skill?.title) || '',
        description: '',
        keywords: [],
      })),
      work: employmentHistory.map((job: any) => ({
        name: job?.company || '',
        position: job?.title || job?.position || '',
        startDate: formatDate(job?.start_date) || formatDate(job?.startDate) || '',
        endDate: job?.end_date === 'Present' || job?.endDate === 'Present' ? 'Heute' : formatDate(job?.end_date) || formatDate(job?.endDate) || '',
        summary: (Array.isArray(job?.responsibilities) ? job.responsibilities.join('\n') : (Array.isArray(job?.description) ? job.description.join('\n') : job?.responsibilities || job?.description)) || '',
        achievements: Array.isArray(job?.responsibilities) ? job.responsibilities : (Array.isArray(job?.description) ? job.description : []),
      })).filter(job => job.name || job.position),
      education: education.map((edu: any) => ({
        institution: edu?.institution_name || edu?.institution || '',
        url: edu?.url || '',
        area: edu?.area || edu?.degree || '',
        studyType: edu?.studyType || edu?.degree || '',
        startDate: formatDate(edu?.start_date) || formatDate(edu?.startDate) || formatDate(edu?.graduationDate) || '',
        endDate: formatDate(edu?.end_date) || formatDate(edu?.endDate) || formatDate(edu?.graduationDate) || '',
        note: edu?.note || ''
      })).filter(edu => edu.institution || edu.area),
      certificates: certificates.map((cert: any) => ({
         name: cert?.name || '',
         description: cert?.description || '',
         date: cert?.date || '',
         issuer: cert?.issuer || '',
      })).filter(cert => cert.name),
      languages: languages.map((lang: any) => ({
         language: (typeof lang === 'string' ? lang : lang?.language) || '',
         fluency: (typeof lang === 'object' ? lang?.fluency : 'Fließend') || 'Fließend'
      })).filter(lang => lang.language),
      publications: [],
      interests: [],
      references: [],
    };
  };

  const mapKandidatToResume = (kandidat: any): ParsedResume => {
    return {
      name: kandidat.name,
      title: kandidat.position,
      brief: kandidat.kurzprofil,
      contact: {
        location_city: kandidat.location?.city,
        location_country: kandidat.location?.countryCode,
        email: '', // Anonymized
        phone: '', // Anonymized
        linkedin: '', // Anonymized
        github: null,
        twitter: null,
        website: null,
      },
      employment_history: kandidat.work?.map((job: any) => ({
        company: job.name,
        position: job.position,
        startDate: job.startDate,
        endDate: job.endDate,
        description: job.achievements || []
      })) || [],
      education: kandidat.education?.map((edu: any) => ({
        institution: edu.institution,
        area: edu.area,
        studyType: edu.studyType,
        startDate: edu.startDate,
        endDate: edu.endDate,
        url: edu.url,
        note: edu.note
      })) || [],
      skills: kandidat.kernthemen || [],
      languages: kandidat.languages?.map((lang: any) => ({
        language: lang.language,
        fluency: lang.fluency
      })) || [],
      derived: {
        years_of_experience: parseInt(kandidat.erfahrung?.split(' ')[0]) || 0,
        approximate_age: undefined // Anonymized
      },
      certificates: kandidat.certificates || [],
      publications: [],
      interests: [],
      references: [],
      gehalt: kandidat.gehalt,
      verfuegbarkeit: kandidat.verfuegbarkeit,
      persoenlicheDaten: kandidat.persoenlicheDaten,
      location: kandidat.location
    };
  };

  const mockAccountManager: AccountManager = {
    name: 'John Doe',
    position: 'Account Manager',
    email: appConfig.company.contact.email,
    phone: appConfig.company.contact.phone,
  };

  const generateNavSections = (resume: ParsedResume): NavigationItem[] => {
    const sections: NavigationItem[] = [
      { id: 'profile', label: 'Profil' }
    ];

    if (Array.isArray(resume.employment_history) && resume.employment_history.length > 0) {
      sections.push({ id: 'experience', label: 'Berufserfahrung' });
    }
    if (Array.isArray(resume.education) && resume.education.length > 0) {
      sections.push({ id: 'education', label: 'Ausbildung' });
    }
    if (Array.isArray(resume.skills) && resume.skills.length > 0) {
      sections.push({ id: 'skills', label: 'Fähigkeiten' });
    }
    if (Array.isArray(resume.languages) && resume.languages.length > 0) {
      sections.push({ id: 'languages', label: 'Sprachen' });
    }

    return sections;
  };

  if (loading) {
    return (
      <>
        <BreadcrumbNav items={[
          { label: 'Kandidaten', href: '/resumes' },
          { label: 'Wird geladen...' }
        ]} />
        <ResumeSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <BreadcrumbNav items={[
          { label: 'Kandidaten', href: '/resumes' },
          { label: 'Fehler' }
        ]} />
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-950 mb-2">
              Kandidat konnte nicht geladen werden
            </h2>
            <p className="text-gray-950 mb-4">{error}</p>
            <a 
              href="/resumes"
              className="text-blue hover:text-blue underline"
            >
              Zurück zur Übersicht
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (!resumeData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <BreadcrumbNav items={[
          { label: 'Kandidaten', href: '/resumes' },
          { label: 'Nicht gefunden' }
        ]} />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-950">Keine Daten gefunden</p>
        </div>
      </main>
    );
  }

  const kandidat = mapResumeToKandidat(resumeData);
  const navSections = generateNavSections(resumeData);

  return (
    <div className="min-h-screen bg-white">
      {/* Secure Link Header */}
      <div className="bg-black border-b border-gray-800 text-white p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-auto flex items-center justify-center">
              <Image 
                src="/logo-white.png" 
                alt="Company Logo" 
                width={214} 
                height={32} 
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <BreadcrumbNav items={[
        { label: 'Kandidaten', href: '/resumes' },
        { label: generateAnonymousCandidateName(kandidat.name) }
      ]} />
      
      <div className="fixed top-4 right-4 z-50 flex gap-2 print:hidden">
        <MobileMenu navSections={navSections} kandidatName={generateAnonymousCandidateName(kandidat.name)} />
      </div>
      
      <main id="main" className="min-h-screen bg-white">
        <KandidatenProfile
          kandidat={kandidat}
          accountManager={mockAccountManager}
          navSections={navSections}
        />
      </main>

      {/* Pseudonymization Debug Panel (Development Only) */}
      {pseudonymizationMetadata && (
        <PseudonymizationDebug 
          metadata={pseudonymizationMetadata} 
          className="print:hidden"
        />
      )}
    </div>
  );
}