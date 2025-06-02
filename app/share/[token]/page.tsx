'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { KandidatenProfile } from '@/components/kandidaten-profile';
import { ResumeSkeleton } from '@/components/ui/resume-skeleton';
import { Clock, Shield, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { generateAnonymousDocumentName } from '@/utils/anonymize-helpers';
import type { Kandidat, AccountManager, NavigationItem } from '@/types/kandidat';
import { pseudonymizeProfile } from '@/utils/pseudonymizer';
import { appConfig } from '@/config/app.config';

interface ShareLinkData {
  candidateId: string;
  expiresAt: number;
  accessCount: number;
  maxAccess?: number;
  metadata?: {
    candidateName?: string;
    sharedBy?: string;
  };
}

interface ParsedResume {
  name?: string;
  title?: string;
  brief?: string;
  contact?: any;
  employment_history?: any[];
  education?: any[];
  skills?: string[];
  languages?: any[];
  derived?: any;
  fileName?: string;
  uploadedAt?: any;
  certificates?: any[];
  publications?: any[];
  interests?: any[];
  references?: any[];
  gehalt?: string;
  verfuegbarkeit?: string;
  persoenlicheDaten?: any;
  location?: any;
}

export default function SharePage() {
  const { token } = useParams();
  const [shareData, setShareData] = useState<ShareLinkData | null>(null);
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateAndFetchData = async () => {
      try {
        // Validate share link
        const shareResponse = await fetch(`/api/share-link?token=${token}`);
        
        if (!shareResponse.ok) {
          const errorData = await shareResponse.json();
          throw new Error(errorData.error || 'Share-Link ist ungültig');
        }
        
        const shareResult = await shareResponse.json();
        const linkData = shareResult.data;
        setShareData(linkData);
        
        // Fetch candidate data
        const candidateResponse = await fetch(`/api/resume/${linkData.candidateId}`);
        
        if (!candidateResponse.ok) {
          throw new Error('Kandidat konnte nicht geladen werden');
        }
        
        const candidateResult = await candidateResponse.json();
        let data = candidateResult.data || candidateResult;
        
        if (data.parsed) {
          data = { ...data.parsed, ...data };
        }
        
        // Apply pseudonymization
        const kandidatData = mapResumeToKandidat(data);
        const candidateIndex = parseInt(linkData.candidateId.slice(-1)) || 0;
        const pseudonymizationOptions = {
          candidateIndex,
          devMode: false, // Always false for shared links
          preserveChronology: true,
          dateShiftRange: 2
        };
        
        const pseudonymizationResult = pseudonymizeProfile(kandidatData, pseudonymizationOptions);
        const pseudonymizedResumeData = mapKandidatToResume(pseudonymizationResult.data);
        
        setResumeData(pseudonymizedResumeData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      validateAndFetchData();
    }
  }, [token]);

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
        email: '',
        phone: '',
        linkedin: '',
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
        approximate_age: undefined
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('de-DE');
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return 'Abgelaufen';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} Tag${days > 1 ? 'e' : ''}`;
    return `${hours} Stunde${hours > 1 ? 'n' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-bold">Sicherer Kandidaten-Link</h1>
                <p className="text-blue-100">Wird geladen...</p>
              </div>
            </div>
          </div>
        </div>
        <ResumeSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-200 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Link nicht verfügbar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Der Link könnte abgelaufen sein</p>
            <p>• Die maximale Anzahl von Zugriffen wurde erreicht</p>
            <p>• Der Link wurde widerrufen</p>
          </div>
        </div>
      </div>
    );
  }

  if (!shareData || !resumeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Keine Daten verfügbar</p>
        </div>
      </div>
    );
  }

  const kandidat = mapResumeToKandidat(resumeData);
  const mockAccountManager: AccountManager = {
    name: 'Account Manager',
    position: 'Kundenbetreuung',
    email: appConfig.company.contact.email,
    phone: appConfig.company.contact.phone,
  };

  const navSections: NavigationItem[] = [
    { id: 'profile', label: 'Profil' },
    { id: 'experience', label: 'Berufserfahrung' },
    { id: 'education', label: 'Ausbildung' },
    { id: 'skills', label: 'Fähigkeiten' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Secure Link Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-bold">Sicherer Kandidaten-Link</h1>
                <p className="text-blue-100">
                  {shareData.metadata?.candidateName && `Profil: ${generateAnonymousDocumentName(resumeData?.title, shareData.candidateId, resumeData?.uploadedAt)}`}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2 bg-blue-600/50 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>Gültig noch: {formatTimeRemaining(shareData.expiresAt)}</span>
              </div>
              
              <div className="flex items-center gap-2 bg-blue-600/50 px-3 py-2 rounded-lg">
                <Eye className="h-4 w-4" />
                <span>
                  Aufrufe: {shareData.accessCount}
                  {shareData.maxAccess && ` / ${shareData.maxAccess}`}
                </span>
              </div>
              
              <div className="flex items-center gap-2 bg-green-600/50 px-3 py-2 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span>DSGVO-konform</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Profile */}
      <main>
        <KandidatenProfile
          kandidat={kandidat}
          accountManager={mockAccountManager}
          navSections={navSections}
        />
      </main>

      {/* Footer with sharing info */}
      <footer className="bg-gray-50 border-t border-gray-200 p-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
            <Shield className="h-4 w-4" />
            <span>
              Dieser Link wurde sicher geteilt und ist 
              <strong className="text-gray-900 mx-1">
                {formatTimeRemaining(shareData.expiresAt)}
              </strong>
              gültig
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Alle personenbezogenen Daten wurden automatisch pseudonymisiert • DSGVO-konform
          </p>
        </div>
      </footer>
    </div>
  );
} 