'use client';

import { useState, Suspense } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ResumeListWrapper } from '@/components/ResumeListWrapper';
import { ResumeSearchWrapper } from '@/components/ResumeSearchWrapper';
import { Upload, Users, Shield, Search, FileText, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'candidates'>('upload');
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleUploadSuccess = (data: any) => {
    setUploadedCount(prev => prev + 1);
    setTimeout(() => {
      setActiveTab('candidates');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Navigation Header */}
      <header className="bg-black border-b border-gray-800 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-white.png" 
                alt="Company Logo" 
                width={214} 
                height={32} 
                className="object-contain"
              />
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>DSGVO-konform</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Compact Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              KI-gestützte Bewerberverwaltung
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Erstellen Sie Bewerbermappen oder durchsuchen Sie bestehende Profile
            </p>

            {/* Simple Tab Navigation */}
            <div className="flex items-center justify-center">
              <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      activeTab === 'upload'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Bewerbermappe erstellen
                  </button>
                  <button
                    onClick={() => setActiveTab('candidates')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      activeTab === 'candidates'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Profile einsehen
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'upload' ? (
              /* Upload Section */
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Neue Bewerbermappe erstellen
                      </h2>
                      <p className="text-gray-600">CV hochladen und automatisch analysieren lassen</p>
                    </div>
                  </div>
                  
                  {uploadedCount > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        <span>{uploadedCount} CV(s) erfolgreich verarbeitet</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <FileUpload onUploadSuccess={handleUploadSuccess} />
                </div>
              </div>
            ) : (
              /* Candidates Section */
              <div className="space-y-6">
                {/* Search Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Search className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Profile durchsuchen
                        </h2>
                        <p className="text-gray-600">Finden Sie passende Kandidaten</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <Suspense fallback={
                      <div className="animate-pulse bg-gray-100 h-16 rounded-lg"></div>
                    }>
                      <ResumeSearchWrapper />
                    </Suspense>
                  </div>
                </div>

                {/* Candidates List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            Kandidaten-Profile
                          </h2>
                          <p className="text-gray-600">Anonymisierte Bewerberdaten</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                        <Shield className="h-4 w-4" />
                        <span>DSGVO-konform</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <Suspense fallback={
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-lg"></div>
                        ))}
                      </div>
                    }>
                      <ResumeListWrapper />
                    </Suspense>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="mt-16 bg-black text-white border-t border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-white.png" 
                alt="Company Logo" 
                width={214} 
                height={32} 
                className="object-contain"
              />
            </div>
            <div className="text-sm text-gray-400">
              KI-gestützte Bewerberverwaltung mit DSGVO-Compliance
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}