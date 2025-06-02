'use client';

import { ResumeSearchWrapper } from '@/components/ResumeSearchWrapper';
import { ResumeListWrapper } from '@/components/ResumeListWrapper';
import { FileText, Sparkles, Users, TrendingUp, Clock, Search, Filter, Shield, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function ResumesPage() {

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="bg-black border-b border-gray-800 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-auto flex items-center justify-center p-2">
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
              
              <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>DSGVO-konform</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 shadow-2xl border border-gray-700/20">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-6 lg:max-w-2xl">
                  <h2 className="text-4xl font-bold text-white">
                    Vereinbaren Sie ein Kennenlernen
                  </h2>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    Entdecken Sie, wie unsere Experten Ihr Team optimal ergänzen können. Wir finden gemeinsam die perfekte Lösung für Ihre Anforderungen.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      onClick={() => window.location.href = 'mailto:kontakt@getexperts.de'}
                      className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                    >
                      <Calendar className="h-5 w-5" />
                      Termin vereinbaren
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    <Button 
                      onClick={() => window.location.href = 'tel:+4921117607313'}
                      variant="outline"
                      className="border-2 border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300"
                    >
                      Jetzt anrufen
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4 lg:text-right">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <Clock className="h-5 w-5 text-green-400" />
                    <span className="text-white font-medium">Schnelle Reaktionszeit</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-medium">Persönliche Beratung</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <Shield className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-medium">DSGVO-konform</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 shadow-2xl border border-gray-700/20">
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-3">
                    <Image 
                      src="/logo-white.png" 
                      alt="Company Logo" 
                      width={48} 
                      height={48} 
                    />
                  </div>
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-ping delay-300" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping delay-700" />
                </div>

                <h1 className="text-6xl font-bold text-white mb-6">
                  Exklusive
                  <span className="bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent block mt-2">
                    Kandidaten
                  </span>
                </h1>
                
                <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                  Premium Kandidatenportal mit vollständiger DSGVO-Anonymisierung. 
                  Professionelle Profile für höchste Ansprüche von Acme Inc.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6 text-gray-900" />
                      </div>
                      <h3 className="text-lg font-bold text-white">DSGVO-konform</h3>
                    </div>
                    <p className="text-gray-300 text-sm">Vollständig anonymisiert und rechtssicher</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-gray-900" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Pseudonymisiert</h3>
                    </div>
                    <p className="text-gray-300 text-sm">Automatische PII-Entfernung bei Upload</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-gray-900" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Premium Insights</h3>
                    </div>
                    <p className="text-gray-300 text-sm">KI-gestützte Kandidatenanalyse</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-700/20 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                    <Search className="h-6 w-6 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">Erweiterte Suche & Filter</h2>
                    <p className="text-gray-300">Finden Sie den perfekten Kandidaten mit präzisen Filteroptionen</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20">
                    <Filter className="h-5 w-5" />
                    <span className="font-medium">Smart Filter</span>
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-white rounded-t-3xl">
                <ResumeSearchWrapper />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-700/20 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-gray-900" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Kandidaten Portfolio</h2>
                      <p className="text-gray-300">Alle Profile pseudonymisiert und DSGVO-konform</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">●</div>
                      <div className="text-xs text-gray-300">Live Updates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">⚡</div>
                      <div className="text-xs text-gray-300">KI-Analyse</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400">✨</div>
                      <div className="text-xs text-gray-300">Premium Design</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-white rounded-t-3xl">
                <ResumeListWrapper />
              </div>
            </div>
          </div>
        </div>

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
    </>
  );
}