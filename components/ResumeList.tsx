// components/ResumeList.tsx - Premium Redesign mit NEU Tags und verbessertem Design
'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Calendar, MapPin, Briefcase, ChevronLeft, ChevronRight, Clock, Star, Eye, Sparkles, Shield } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { generateAnonymousDocumentName, generateAnonymousCandidateName, extractSeniorityFromTitle } from '@/utils/anonymize-helpers';
import { appConfig } from '@/config/app.config';

interface Resume {
  id: string;
  name?: string;
  title?: string;
  fileName: string;
  uploadedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  contact?: {
    location_city?: string;
    location_country?: string;
  };
  derived?: {
    years_of_experience?: number;
  };
  skills?: string[];
  senioritaet?: string;
  lastViewed?: number; // Timestamp der letzten Ansicht
  isNew?: boolean; // Computed: noch nie angesehen
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ResumeList = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [viewedResumes, setViewedResumes] = useState<Set<string>>(new Set());
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load viewed resumes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const viewed = localStorage.getItem('viewedResumes');
      if (viewed) {
        setViewedResumes(new Set(JSON.parse(viewed)));
      }
    }
  }, []);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/get-resumes?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const resumesData = result.data.resumes || [];
        
        // Sort by upload date (newest first) and add isNew flag
        const sortedResumes = resumesData
          .sort((a: Resume, b: Resume) => {
            return b.uploadedAt._seconds - a.uploadedAt._seconds;
          })
          .map((resume: Resume) => ({
            ...resume,
            isNew: !viewedResumes.has(resume.id)
          }));
        
        setResumes(sortedResumes);
        setPagination(result.data.pagination || null);
      } else {
        setResumes(result || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  }, [searchParams, viewedResumes]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleResumeClick = (id: string) => {
    // Mark as viewed
    const newViewed = new Set(viewedResumes);
    newViewed.add(id);
    setViewedResumes(newViewed);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewedResumes', JSON.stringify([...newViewed]));
    }
    
    // Update local state to remove "NEW" badge immediately
    setResumes(prev => prev.map(resume => 
      resume.id === id ? { ...resume, isNew: false } : resume
    ));
    
    router.push(`/candidate/${id}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/resumes?${params.toString()}`);
  };

  const formatDate = (uploadedAt: { _seconds: number }) => {
    const date = new Date(uploadedAt._seconds * 1000);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      return 'Gerade eben';
    } else if (diffInHours < 24) {
      return `vor ${Math.floor(diffInHours)} Stunden`;
    } else if (diffInDays < 7) {
      return `vor ${Math.floor(diffInDays)} Tagen`;
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getSeniorityColor = (seniority?: string) => {
    switch (seniority?.toLowerCase()) {
      case 'senior':
        return 'bg-gradient-to-r from-gray-900/10 to-gray-800/10 text-gray-900 border-gray-900/30 shadow-lg';
      case 'mid':
      case 'mid-level':
        return 'bg-gradient-to-r from-gray-700/10 to-gray-600/10 text-gray-700 border-gray-700/30 shadow-lg';
      case 'junior':
        return 'bg-gradient-to-r from-gray-500/10 to-gray-400/10 text-gray-500 border-gray-500/30 shadow-lg';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border-gray-200 shadow-sm';
    }
  };

  const getSkillBadgeColor = (skill: string) => {
    const hash = skill.toLowerCase().charCodeAt(0);
    if (hash % 4 === 0) {
      return 'bg-gray-900/10 text-gray-900 border-gray-900/20 hover:bg-gray-900/20 transition-all duration-200';
    } else if (hash % 4 === 1) {
      return 'bg-gray-700/10 text-gray-700 border-gray-700/20 hover:bg-gray-700/20 transition-all duration-200';
    } else if (hash % 4 === 2) {
      return 'bg-gray-600/10 text-gray-600 border-gray-600/20 hover:bg-gray-600/20 transition-all duration-200';
    }
    return 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100 transition-all duration-200';
  };

  // Hilfsfunktion für anonymisierte Namen
  const getDisplayName = (resume: Resume, index: number) => {
    return generateAnonymousCandidateName(resume.title, resume.id, index);
  };

  // Hilfsfunktion für Share-Button Namen
  const getShareName = (resume: Resume, index: number) => {
    return generateAnonymousDocumentName(resume.title, resume.id, resume.uploadedAt);
  };

  // Hilfsfunktion für Seniority (falls nicht vorhanden)
  const getEffectiveSeniority = (resume: Resume) => {
    return resume.senioritaet || extractSeniorityFromTitle(resume.title);
  };

  // Premium Skeleton mit Animation
  if (loading && resumes.length === 0) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-500 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6 flex-1">
                <div className="relative">
                  <Skeleton className="h-16 w-16 rounded-2xl" />
                  <div className="absolute -top-2 -right-2">
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-48" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-6 w-16 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-red/5 to-red/5 rounded-3xl border border-red/10 p-12">
        <div className="w-20 h-20 bg-red/10 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Fehler beim Laden</h3>
        <p className="text-gray-700 mb-6 max-w-md">{error}</p>
        <Button 
          onClick={fetchResumes} 
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Star className="h-4 w-4 mr-2" />
          Erneut versuchen
        </Button>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border border-gray-200 p-12">
        <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center mb-8 relative">
          <FileText className="h-12 w-12 text-white" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-gray-900" />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Noch keine Kandidaten</h3>
        <p className="text-lg text-gray-700 mb-8 max-w-md">
          {searchParams.toString() 
            ? 'Versuchen Sie es mit anderen Filterkriterien.'
            : 'Laden Sie den ersten Lebenslauf hoch, um zu beginnen.'}
        </p>
        {searchParams.toString() ? (
          <Button 
            onClick={() => router.push('/resumes')} 
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Filter zurücksetzen
          </Button>
        ) : (
          <Button 
            onClick={() => router.push('/')} 
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FileText className="h-5 w-5 mr-2" />
            Ersten CV hochladen
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Header - Premium Design */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {pagination?.total || resumes.length} Kandidaten gefunden
            </h2>
            <p className="text-gray-200 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Vollständig pseudonymisiert und DSGVO-konform
            </p>
          </div>
          <div className="flex items-center gap-3">
            {resumes.filter(r => r.isNew).length > 0 && (
              <div className="flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-xl border border-yellow-400/30">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">
                  {resumes.filter(r => r.isNew).length} neue
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="font-medium text-sm">Anonymisiert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Resume Cards */}
      <div className="space-y-6">
        {resumes.map((resume, index) => (
          <div
            key={resume.id}
            onClick={() => handleResumeClick(resume.id)}
            className="group relative bg-white p-8 rounded-3xl shadow-sm border border-gray-200 hover:shadow-2xl hover:border-gray-900/30 transition-all duration-500 cursor-pointer overflow-hidden"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'slideInUp 0.6s ease-out forwards'
            }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/0 via-transparent to-gray-800/0 group-hover:from-gray-900/5 group-hover:to-gray-800/5 transition-all duration-500 rounded-3xl" />
            
            {/* NEW Badge - Premium Style */}
            {resume.isNew && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-2xl shadow-lg animate-pulse">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-bold text-sm">NEU</span>
                  </div>
                </div>
              </div>
            )}

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-start gap-6 flex-1">
                {/* Enhanced Icon - Premium Design */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  {resume.isNew && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                      {getDisplayName(resume, index)}
                    </h3>
                    {(() => {
                      const effectiveSeniority = getEffectiveSeniority(resume);
                      return effectiveSeniority && effectiveSeniority !== 'Mid-Level' ? (
                        <Badge className={`${getSeniorityColor(effectiveSeniority)} font-semibold px-4 py-1.5`}>
                          {effectiveSeniority}
                        </Badge>
                      ) : null;
                    })()}
                    {!resume.isNew && (
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Eye className="h-4 w-4" />
                        <span>Bereits angesehen</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Title */}
                  {resume.title && (
                    <p className="text-lg font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded-xl inline-block">
                      {resume.title}
                    </p>
                  )}
                  
                  {/* Meta Information - Premium Style */}
                  <div className="flex flex-wrap items-center gap-6 text-gray-700">
                    <div className="flex items-center gap-2 bg-gray-900/5 px-3 py-2 rounded-xl">
                      <Calendar className="h-5 w-5 text-gray-900" />
                      <span className="font-medium">{formatDate(resume.uploadedAt)}</span>
                    </div>
                    
                    {(resume.contact?.location_city || resume.contact?.location_country) && (
                      <div className="flex items-center gap-2 bg-gray-700/5 px-3 py-2 rounded-xl">
                        <MapPin className="h-5 w-5 text-gray-700" />
                        <span className="font-medium">
                          {[resume.contact.location_city, resume.contact.location_country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {resume.derived?.years_of_experience !== undefined && (
                      <div className="flex items-center gap-2 bg-gray-600/5 px-3 py-2 rounded-xl">
                        <Briefcase className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{resume.derived.years_of_experience} Jahre Erfahrung</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Skills - Premium Design */}
                  {resume.skills && resume.skills.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {resume.skills.slice(0, 6).map((skill, skillIndex) => (
                        <Badge 
                          key={skillIndex} 
                          variant="outline"
                          className={`${getSkillBadgeColor(skill)} font-medium px-3 py-1.5 shadow-sm`}
                        >
                          {skill}
                        </Badge>
                      ))}
                      {resume.skills.length > 6 && (
                        <Badge 
                          variant="outline"
                          className="bg-gray-50 text-gray-900 border-gray-200 font-medium px-3 py-1.5 shadow-sm"
                        >
                          +{resume.skills.length - 6} weitere Skills
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Action Button - Premium Design */}
              <div className="flex gap-3">
                <ShareButton
                  candidateId={resume.id}
                  candidateName={getDisplayName(resume, index)}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-green-600/10 hover:bg-green-600 text-green-600 hover:text-white border-green-600/30 hover:border-green-600"
                />
                <Button
                  variant="ghost"
                  size="lg"
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-900/10 hover:bg-gray-900 text-gray-900 hover:text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl font-semibold"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Profil ansehen
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Pagination - Premium Design */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium text-gray-900">
              Zeige {((pagination.page - 1) * pagination.limit) + 1} bis{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} von{' '}
              <span className="font-bold text-gray-900">{pagination.total}</span> Kandidaten
            </p>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-6 py-3 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-gray-300 hover:border-gray-900"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Zurück
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="lg"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-12 h-12 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ${
                        pageNum === pagination.page 
                          ? 'bg-gray-900 text-white shadow-lg' 
                          : 'border-gray-300 hover:bg-gray-900/10 hover:border-gray-900'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-6 py-3 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-gray-300 hover:border-gray-900"
              >
                Weiter
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};