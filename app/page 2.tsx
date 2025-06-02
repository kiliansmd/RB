'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Upload, Zap, CheckCircle, Users, TrendingUp, Sparkles, ArrowRight, Brain, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [uploadedCount, setUploadedCount] = useState(0);
  const router = useRouter();

  const handleUploadSuccess = (data: any) => {
    setUploadedCount(prev => prev + 1);
    console.log('Upload successful:', data);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-achieve-ka/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-achieve-ka/10 via-blue/10 to-purple/10 rounded-3xl p-16 border border-achieve-ka/20 shadow-2xl">
              {/* Background Animation */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-achieve-ka/40 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-blue/40 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-yellow/30 to-transparent rounded-full blur-3xl animate-pulse delay-500" />
              </div>

              <div className="relative z-10 text-center space-y-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-achieve-ka to-blue rounded-3xl flex items-center justify-center shadow-2xl">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <div className="w-5 h-5 bg-yellow rounded-full animate-ping" />
                  <div className="w-4 h-4 bg-green rounded-full animate-ping delay-300" />
                  <div className="w-3 h-3 bg-blue rounded-full animate-ping delay-700" />
                </div>

                <h1 className="text-6xl font-bold text-gray-950 leading-tight">
                  KI-gestützte
                  <span className="bg-gradient-to-r from-achieve-ka to-blue bg-clip-text text-transparent block mt-2">
                    CV-Analyse
                  </span>
                </h1>
                
                <p className="text-2xl text-gray-950 max-w-4xl mx-auto leading-relaxed">
                  Laden Sie Lebensläufe hoch und lassen Sie unsere fortschrittliche KI 
                  automatisch alle relevanten Informationen extrahieren und strukturieren.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
                  <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/50 shadow-lg">
                    <Zap className="h-6 w-6 text-achieve-ka" />
                    <span className="font-semibold text-gray-950">Sofortige Analyse</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/50 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-green" />
                    <span className="font-semibold text-gray-950">Strukturierte Daten</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/50 shadow-lg">
                    <TrendingUp className="h-6 w-6 text-blue" />
                    <span className="font-semibold text-gray-950">Smart Insights</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-8">
                  <Button 
                    onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-gradient-to-r from-achieve-ka to-blue hover:from-achieve-ka/90 hover:to-blue/90 text-white px-12 py-6 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 group"
                  >
                    <Upload className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                    Jetzt CV hochladen
                    <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 group">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-achieve-ka/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-8 w-8 text-achieve-ka" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-950">{uploadedCount.toLocaleString()}+</h3>
                  <p className="text-lg text-gray-950 font-medium">Hochgeladene CVs</p>
                  <p className="text-sm text-gray-950">In dieser Session</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 group">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-blue" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-950">&lt; 30s</h3>
                  <p className="text-lg text-gray-950 font-medium">Analyse-Zeit</p>
                  <p className="text-sm text-gray-950">Durchschnittliche Verarbeitung</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 group">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-green" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-950">98%</h3>
                  <p className="text-lg text-gray-950 font-medium">Genauigkeit</p>
                  <p className="text-sm text-gray-950">KI-Datenextraktion</p>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div id="upload-section" className="scroll-mt-20">
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-achieve-ka/5 p-8 border-b border-gray-200">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold text-gray-950">Warum unsere CV-Analyse?</h2>
                  <p className="text-xl text-gray-950 max-w-3xl mx-auto">
                    Modernste KI-Technologie für präzise und schnelle Kandidatenanalyse
                  </p>
                </div>
              </div>
              
              <div className="p-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center space-y-4 group">
                    <div className="w-20 h-20 bg-gradient-to-br from-achieve-ka/10 to-blue/10 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <Brain className="h-10 w-10 text-achieve-ka" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-950">KI-Powered</h3>
                    <p className="text-gray-950">Modernste Algorithmen für präzise Datenextraktion aus jedem CV-Format</p>
                  </div>

                  <div className="text-center space-y-4 group">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue/10 to-green/10 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <Zap className="h-10 w-10 text-blue" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-950">Blitzschnell</h3>
                    <p className="text-gray-950">Vollständige Analyse in unter 30 Sekunden - von Upload bis strukturiertes Profil</p>
                  </div>

                  <div className="text-center space-y-4 group">
                    <div className="w-20 h-20 bg-gradient-to-br from-green/10 to-yellow/10 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <CheckCircle className="h-10 w-10 text-green" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-950">Hochpräzise</h3>
                    <p className="text-gray-950">98% Genauigkeit bei der Extraktion von Skills, Erfahrung und Kontaktdaten</p>
                  </div>

                  <div className="text-center space-y-4 group">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow/10 to-achieve-ka/10 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <Sparkles className="h-10 w-10 text-yellow" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-950">Smart Insights</h3>
                    <p className="text-gray-950">Automatische Seniorität-Einschätzung und Skill-Kategorisierung</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-achieve-ka/5 to-blue/5 rounded-3xl p-12 border border-achieve-ka/10 text-center">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="h-8 w-8 text-achieve-ka animate-pulse" />
                  <h3 className="text-3xl font-bold text-gray-950">Bereit loszulegen?</h3>
                  <Sparkles className="h-8 w-8 text-blue animate-pulse delay-500" />
                </div>
                <p className="text-xl text-gray-950">
                  Erleben Sie die Zukunft der Kandidatenanalyse. 
                  Laden Sie Ihren ersten CV hoch und lassen Sie sich überraschen!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                  <Button 
                    onClick={() => router.push('/resumes')}
                    variant="outline"
                    className="px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-achieve-ka text-achieve-ka hover:bg-achieve-ka hover:text-white transition-all duration-300"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Alle Kandidaten ansehen
                  </Button>
                  <Button 
                    onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-gradient-to-r from-achieve-ka to-blue hover:from-achieve-ka/90 hover:to-blue/90 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    CV hochladen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
