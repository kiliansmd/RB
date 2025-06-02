"use client"

import Image from "next/image"
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award,
    Briefcase,
    GraduationCap,
    Languages,
    CheckCircle,
    ArrowRight,
    Star,
    Users,
    Shield,
    Clock,
    Target,
    ChevronRight,
    Download,
    Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { getIconComponent } from "@/utils/icon-mapper"
import type { Kandidat, AccountManager, NavigationItem } from "@/types/kandidat"
import { useState, useEffect } from "react"

export function KandidatenProfile({
    kandidat,
    accountManager,
    navSections,
}: {
    kandidat: Kandidat
    accountManager: AccountManager
    navSections: NavigationItem[]
}) {
    const [isPrinting, setIsPrinting] = useState(false)
    const [printDate, setPrintDate] = useState<string>("")

    useEffect(() => {
        // Aktuelles Datum für den Ausdruck setzen
        const now = new Date()
        setPrintDate(
            now.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }),
        )
    }, [])

    // Export Options Hook
    const exportProfile = async (options: {
        format: 'pdf' | 'png' | 'jpeg',
        width?: number,
        quality?: number
    }) => {
        const { format, width = 1200, quality = 100 } = options
        
        try {
            const currentUrl = window.location.href
            
            const response = await fetch('/api/export-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: currentUrl,
                    width,
                    format,
                    quality,
                }),
            })

            if (!response.ok) {
                throw new Error('Export failed')
            }

            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = downloadUrl
            a.download = `kandidat-profil-${kandidat.name}-${new Date().toISOString().split('T')[0]}.${format}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(downloadUrl)
            document.body.removeChild(a)

            return true
        } catch (error) {
            console.error(`${format.toUpperCase()}-Export fehlgeschlagen:`, error)
            return false
        }
    }

    const handlePrint = async () => {
        setIsPrinting(true)

        try {
            // Try Puppeteer export first
            const success = await exportProfile({ 
                format: 'pdf', 
                width: 1500, 
                quality: 100 
            })
            
            if (!success) {
                throw new Error('Puppeteer export failed')
            }

        } catch (exportError) {
            console.error('Fehler beim PDF-Export:', exportError)
            
            // Fallback to the old method if Puppeteer fails
        try {
            // Dynamischer Import von html2pdf.js nur auf dem Client
            const html2pdf = (await import('html2pdf.js')).default;

            // Elemente temporär verstecken
            const elementsToHide = [
                document.querySelector("header"),
                document.querySelector("footer"),
                document.querySelector(".fixed.bottom-0"),
                document.querySelector(".fixed.bottom-6.right-6"),
                ...Array.from(document.querySelectorAll(".no-print-element")),
            ]

                elementsToHide.forEach((el) => {
                    if (el) el.classList.add("no-print")
            })

            // Druckvorschau-Elemente anzeigen
            const printElements = document.querySelectorAll(".print-only")
                printElements.forEach((el) => {
                    if (el) el.classList.remove("hidden")
            })

            // HTML2PDF Konfiguration
                const mainElement = document.querySelector('main')
            const opt = {
                margin: 0.2,
                filename: `kandidat-profil-${kandidat.name}.pdf`,
                    image: { 
                        type: 'jpeg', 
                        quality: 0.98 
                    },
                    html2canvas: { 
                        scale: 2 
                    },
                    jsPDF: { 
                        unit: 'in', 
                        format: 'a4', 
                        orientation: 'portrait' 
                    }
            }

            // PDF generieren
                await html2pdf().set(opt).from(mainElement).save()

            // Klassen wieder entfernen
                elementsToHide.forEach((el) => {
                    if (el) el.classList.remove("no-print")
                })

                printElements.forEach((el) => {
                    if (el) el.classList.add("hidden")
                })

            } catch (fallbackError) {
                console.error('Fallback-Export fehlgeschlagen:', fallbackError)
                alert('Export fehlgeschlagen. Bitte versuchen Sie es später erneut.')
            }
        } finally {
            setIsPrinting(false)
        }
    }

    const newLocal = <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-yellow to-yellow"></div>
        <CardContent className="p-6">
            <h3 className="text-heading-4 mb-6 text-gray-950 flex items-center">
                <Award className="h-5 w-5 text-yellow mr-2" />
                Zertifizierungen
            </h3>
            <div className="space-y-4">
                {kandidat?.certificates?.length > 0 ? kandidat.certificates.map((cert, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow/20 hover:bg-yellow-50 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                            <Award className="h-5 w-5 text-yellow" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-950">{cert.name}</h4>
                            <p className="text-sm text-gray-950">{cert.description}</p>
                            <div className="flex items-center mt-1 text-xs text-gray-950">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{cert.date}</span>
                                <span className="mx-2">•</span>
                                <span>{cert.issuer}</span>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-gray-950">Keine Zertifizierungen gefunden</p>}
            </div>
        </CardContent>
    </Card>
    return (
        <main className="min-h-screen bg-white text-gray-950">
            {/* Druckspezifische Kopfzeile - nur beim Drucken sichtbar */}
            {/* <div className="hidden print-only">
                <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-4">
                        <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/getexperts_Logo%20white_2022_Logo-J8GvQFrl6vrMOgCpmr7p26XTKi8yl7.png"
                            alt="getexperts Logo"
                            width={180}
                            height={40}
                            className="h-10 w-auto print-logo"
                        />
                        <div className="text-sm text-gray-950">
                            <p>Rudolfplatz 3, 50674 Köln</p>
                            <p>kontakt@getexperts.io | +49 2111 7607 313</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-950 text-right">
                        <p>Kandidatenprofil</p>
                        <p>Erstellt am: {printDate}</p>
                        <p>
                            Ref: #{kandidat.name.substring(0, 1)}
                            {Math.floor(Math.random() * 10000)}
                        </p>
                    </div>
                </div>
            </div> */}

            {/* Header mit exklusivem Design - 95% weißer Hintergrund */}
            <header className="border-b border-gray-200 sticky top-0 z-50 no-print-element shadow-xl backdrop-blur-md" 
                style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                }}>
                <div className="container mx-auto px-4 py-2 sm:py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4 sm:gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg p-2">
                                <Image 
                                    src="/logo-white.png" 
                                    alt="Company Logo" 
                                    width={32} 
                                    height={32} 
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-gray-900">Acme Inc.</span>
                                <span className="text-xs text-gray-600 hidden sm:block">Premium Recruiting</span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center space-x-6">
                            {navSections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors relative group font-medium"
                                >
                                    {section.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-700 to-gray-900 transition-all group-hover:w-full"></span>
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button 
                            onClick={() => {
                                const cvSection = document.getElementById('curriculum-vitae');
                                if (cvSection) {
                                    cvSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            className="bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 font-medium px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm flex items-center gap-1 rounded-lg backdrop-blur-sm transition-all duration-200"
                        >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            Direkt zum CV
                        </Button>
                        <Button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 flex items-center rounded-lg backdrop-blur-sm transition-all duration-200"
                        >
                            <Printer className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                            {isPrinting ? "Vorbereitung..." : "Drucken"}
                        </Button>
                        <Button className="font-bold px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 border-2 border-gray-900 shadow-lg hover:scale-105"
                            style={{ backgroundColor: '#1a1a1a', color: '#ffffff', borderColor: '#1a1a1a' }}
                        >
                            Kontakt aufnehmen
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section - Exklusives Premium Design mit 95% weißem Hintergrund */}
            <section className="py-6 sm:py-8 lg:py-12 relative overflow-hidden" 
                style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                }}>
                {/* Subtile Hintergrund-Patterns für Exklusivität */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gray-300 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-400 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-gray-500 rounded-full blur-2xl"></div>
                </div>
                
                {/* Elegante geometrische Muster */}
                <div className="absolute inset-0 opacity-3">
                    <div className="absolute top-10 right-10 w-20 h-20 border border-gray-300 rotate-45"></div>
                    <div className="absolute bottom-20 right-20 w-16 h-16 border border-gray-400 rotate-12"></div>
                    <div className="absolute top-1/2 right-1/4 w-12 h-12 border border-gray-300 rotate-45"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                            <div className="w-full lg:w-2/3">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <Badge className="bg-gray-100 text-gray-800 border border-gray-300 font-medium px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm backdrop-blur-sm">
                                        {kandidat.senioritaet} Expert Profile
                                    </Badge>
                                    <Badge className="bg-green-50 text-green-700 border border-green-200 font-medium px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm">
                                        Sofort verfügbar
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-gray-400 text-gray-700 font-medium px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm bg-gray-50 backdrop-blur-sm"
                                    >
                                        <span className="text-amber-600 mr-1">#</span>
                                        7100001451223
                                    </Badge>
                                </div>

                                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-heading-1 mb-1 text-gray-900 font-bold leading-tight">
                                    {kandidat.name}
                                </h1>
                                <h2 className="text-lg sm:text-xl md:text-heading-3 text-gray-700 font-medium mb-3 sm:mb-4">
                                    {kandidat.position}
                                </h2>

                                {/* Kompakte Grid für Key-Infos */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="flex items-center gap-1.5 text-gray-700 text-xs sm:text-sm">
                                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                        <span className="truncate">{kandidat.standort}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-700 text-xs sm:text-sm">
                                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                        <span className="truncate">{kandidat.verfuegbarkeit}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-700 text-xs sm:text-sm">
                                        <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                        <span className="truncate">{kandidat.erfahrung}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-700 text-xs sm:text-sm">
                                        <Award className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                        <span className="truncate">{kandidat.gehalt}</span>
                                    </div>
                                </div>

                                {/* Kompakte Skills Tags mit dunklem Design */}
                                <div className="flex flex-wrap gap-1.5 mt-2 sm:mt-3">
                                    {kandidat.kernthemen.slice(0, 6).map((thema, index) => (
                                        <Badge key={index} variant="outline" className="border-gray-300 bg-gray-50 text-gray-700 text-xs backdrop-blur-sm px-2 py-0.5 hover:bg-gray-100 transition-colors">
                                            {thema}
                                        </Badge>
                                    ))}
                                    {kandidat.kernthemen.length > 6 && (
                                        <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700 text-xs backdrop-blur-sm px-2 py-0.5">
                                            +{kandidat.kernthemen.length - 6} weitere
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Premium Quick Actions Sidebar mit dunklem Design */}
                            <div className="w-full lg:w-1/3 lg:pl-6">
                                <div className="bg-gray-900 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-2xl">
                                    <h3 className="text-white font-semibold mb-3 text-sm flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Exklusive Schnellübersicht
                                    </h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Verfügbarkeit:</span>
                                            <span className="text-green-400 font-medium">{kandidat.verfuegbarkeit}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Erfahrung:</span>
                                            <span className="text-white font-medium">{kandidat.erfahrung}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Standort:</span>
                                            <span className="text-white font-medium">{kandidat.standort}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Gehalt:</span>
                                            <span className="text-white font-medium">{kandidat.gehalt}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-700">
                                        <Button className="w-full font-bold text-sm py-2 rounded-lg transition-all duration-200 border-2 border-amber-500 shadow-lg hover:scale-105"
                                            style={{ backgroundColor: '#D97706', color: '#ffffff', borderColor: '#D97706' }}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Premium Termin vereinbaren
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kandidaten-Highlights Section */}
            <section id="highlights" className="py-10 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-heading-2 mb-3 text-black flex items-center border-b border-gray-200 pb-2">
                            <Star className="h-6 w-6 mr-2" style={{ color: '#D4AF37', fill: '#D4AF37' }} />
                            <span className="text-black">
                                Elite-Experte: Außergewöhnliche Erfolgsbilanz
                            </span>
                        </h2>
                        <p className="text-body-normal text-gray-950 mb-8">
                            Ein Top-1% Kandidat mit nachgewiesener Expertise und messbaren Erfolgen in kritischen Unternehmensprojekten
                        </p>

                        {/* Kompakte Highlights Grid mit harmonischem Design */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                            {kandidat.highlights.map((highlight, index) => {
                                const IconComponent = getIconComponent(highlight.icon)
                                // Enhanced content for each highlight mit einheitlichem Farbschema
                                const enhancedHighlights = [
                                    {
                                        ...highlight,
                                        title: "Elite-Netzwerk",
                                        description: "Fortune 500 Entscheidungsträger",
                                        color: "#3b82f6" // Blau
                                    },
                                    {
                                        ...highlight,
                                        title: "Marktführerschaft",
                                        description: "Kontinuierliche Performance seit 2021",
                                        color: "#3b82f6" // Blau
                                    },
                                    {
                                        ...highlight,
                                        title: "Kernexpertise",
                                        description: "Komplexe Recruiting-Strategien",
                                        color: "#3b82f6" // Blau
                                    },
                                    {
                                        ...highlight,
                                        title: "Projekt-Exzellenz",
                                        description: "100% Erfolgsquote, ROI-Steigerung",
                                        color: "#3b82f6" // Blau
                                    }
                                ]
                                const enhanced = enhancedHighlights[index] || highlight
                                return (
                                    <Card
                                        key={index}
                                        className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group relative"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: enhanced.color }}></div>
                                        <CardContent className="p-3 sm:p-4 text-center relative z-10">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:shadow-md transition-all duration-300" 
                                                style={{ 
                                                    background: `linear-gradient(135deg, ${enhanced.color}15 0%, ${enhanced.color}25 100%)`
                                                }}>
                                                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: enhanced.color }} />
                                            </div>
                                            <div className="text-xl sm:text-2xl font-bold text-gray-950 mb-1 group-hover:scale-105 transition-transform">{highlight.metric}</div>
                                            <div className="text-xs font-medium mb-1 sm:mb-2" style={{ color: enhanced.color }}>{highlight.label}</div>
                                            <h3 className="text-sm sm:text-base font-bold mb-1 text-gray-950 leading-tight">
                                                {enhanced.title}
                                            </h3>
                                            <p className="text-xs text-gray-950 leading-snug font-medium">{enhanced.description}</p>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        {/* Kompakte Zwei-Spalten Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent opacity-50"></div>
                                <CardContent className="p-4 relative z-10">
                                    <h3 className="text-lg font-bold mb-3 text-black flex items-center">
                                        <CheckCircle className="h-5 w-5 mr-2" style={{ color: '#625df5' }} />
                                        Elite-Qualifikationen
                                    </h3>
                                    <div className="space-y-2">
                                        {kandidat.certificates.slice(0, 3).map((cert, index) => (
                                            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                    <Award className="h-4 w-4 text-orange-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-black text-sm truncate">{cert.name}</h4>
                                                    <p className="text-xs text-gray-950 truncate">{cert.description}</p>
                                                    <div className="flex items-center mt-1 text-xs text-gray-950">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        <span>{cert.date}</span>
                                                        <span className="mx-1">•</span>
                                                        <span className="truncate">{cert.issuer}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {kandidat.certificates.length > 3 && (
                                            <div className="text-xs text-gray-950 text-center pt-1">
                                                +{kandidat.certificates.length - 3} weitere Zertifizierungen
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                <CardContent className="p-4 relative z-10">
                                    <h3 className="text-lg font-bold mb-3 text-black flex items-center">
                                        <Users className="h-5 w-5 mr-2" style={{ color: '#625df5' }} />
                                        Premium-Zugang
                                    </h3>
                                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="font-bold text-green text-sm">SOFORT VERFÜGBAR</span>
                                        </div>
                                        <p className="text-gray-950 font-semibold text-sm">
                                            Elite-Experte exklusiv über getexperts
                                        </p>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4" style={{ color: '#625df5' }} />
                                            <span className="text-gray-950 font-medium">14 Tage Startbereitschaft</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Shield className="h-4 w-4" style={{ color: '#625df5' }} />
                                            <span className="text-gray-950 font-medium">Premium-Exklusivität</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Target className="h-4 w-4" style={{ color: '#625df5' }} />
                                            <span className="text-gray-950 font-medium">VIP-Betreuung garantiert</span>
                                        </div>
                                    </div>
                                    <Button className="w-full text-white no-print-element shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] font-bold text-sm py-2.5" style={{ backgroundColor: '#D4AF37' }}>
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        Exklusivtermin sichern
                                    </Button>
                                    <p className="text-center text-gray-950 text-xs mt-2 italic">
                                        ⭐ Antwort binnen 2h garantiert
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Profile Section */}
            <section id="profil" className="py-10 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-heading-2 mb-3 text-black">Profil</h2>
                        <p className="text-body-normal text-gray-950 mb-6">
                            Vielseitiger Fachmann mit Erfahrung darin, durch Anpassungsfähigkeiten und eine kooperative Denkweise zum Geschäftserfolg beizutragen.
                        </p>

                        {/* Kompaktes Kurzprofil mit Avatar */}
                        {!!kandidat.kurzprofil && <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6 relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white shadow-lg" style={{ backgroundColor: '#625df5' }}>
                                            <span className="text-2xl font-bold text-white">{kandidat.name.charAt(0)}</span>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                            <CheckCircle className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold mb-2 text-black flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="mr-2"
                                            style={{ color: '#625df5' }}
                                        >
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                        Über mich
                                    </h3>
                                    <p className="text-gray-950 leading-relaxed mb-3 text-sm">
                                        {kandidat.kurzprofil}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {kandidat.kernthemen.slice(0, 4).map((thema, index) => (
                                            <div key={index} className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full shadow-sm border border-gray-200 hover:border-gray-200 transition-colors">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={{ color: '#625df5' }}
                                                >
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                </svg>
                                                <span className="text-xs text-gray-950 font-medium">{thema}</span>
                                            </div>
                                        ))}
                                        {kandidat.kernthemen.length > 4 && (
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full shadow-sm border border-gray-200">
                                                <span className="text-xs text-gray-950 font-medium">+{kandidat.kernthemen.length - 4}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>}

                        {/* Kompakte 3-Spalten Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Persönliche Daten - Kompakt */}
                            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-bold mb-4 text-gray-950 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-blue" />
                                        Persönliche Daten
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <Calendar className="h-4 w-4 text-blue" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-gray-950 text-xs block">Geboren</span>
                                                <span className="font-medium text-gray-950 text-sm">
                                                    {kandidat.persoenlicheDaten.geburtsdatum}
                                                </span>
                                                <span className="text-gray-950 text-xs">{kandidat.persoenlicheDaten.geburtsort}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="h-4 w-4 text-blue" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-gray-950 text-xs block">Wohnort</span>
                                                <span className="font-medium text-gray-950 text-sm">{kandidat.persoenlicheDaten.wohnort}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <Users className="h-4 w-4 text-blue" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-gray-950 text-xs block">Familienstand</span>
                                                <span className="font-medium text-gray-950 text-sm">{kandidat.persoenlicheDaten.familienstand}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Software-Kenntnisse - Kompakt */}
                            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-bold mb-4 text-gray-950 flex items-center">
                                        <Briefcase className="h-4 w-4 mr-2 text-blue" />
                                        Software-Kenntnisse
                                    </h3>
                                    <div className="space-y-3">
                                        {kandidat.softwareKenntnisse.slice(0, 4).map((software, index) => (
                                            <div key={index} className="text-gray-950">
                                                <div className="flex justify-between mb-1 items-center">
                                                    <div className="flex items-center">
                                                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center mr-2">
                                                            {software.name.includes("SAP") ? (
                                                                <span className="font-bold text-xs" style={{ color: '#625df5' }}>SAP</span>
                                                            ) : software.name.includes("Office") ? (
                                                                <span className="font-bold text-xs" style={{ color: '#625df5' }}>MS</span>
                                                            ) : software.name.includes("CRM") ? (
                                                                <span className="font-bold text-xs" style={{ color: '#625df5' }}>CRM</span>
                                                            ) : (
                                                                <span className="font-bold text-xs" style={{ color: '#625df5' }}>RT</span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-black text-sm truncate">{software.name}</span>
                                                    </div>
                                                    <span className="text-xs font-semibold" style={{ color: '#625df5' }}>{software.level}%</span>
                                                </div>
                                                <Progress
                                                    value={software.level || 0}
                                                    className="h-1.5 bg-gray-200"
                                                    indicatorClassName={`${software.level > 90
                                                        ? "bg-green"
                                                        : software.level > 80
                                                            ? ""
                                                            : software.level > 70
                                                                ? "bg-orange-500"
                                                                : "bg-orange-500"
                                                        }`}
                                                    style={software.level > 80 && software.level <= 90 ? { backgroundColor: '#625df5' } : {}}
                                                />
                                            </div>
                                        ))}
                                        {kandidat.softwareKenntnisse.length > 4 && (
                                            <div className="text-xs text-gray-950 text-center pt-1">
                                                +{kandidat.softwareKenntnisse.length - 4} weitere Tools
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sprachkenntnisse - Kompakt */}
                            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                                <div className="h-1" style={{ backgroundColor: '#625df5' }}></div>
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-bold mb-4 text-black flex items-center">
                                        <Languages className="h-4 w-4 mr-2" style={{ color: '#625df5' }} />
                                        Sprachkenntnisse
                                    </h3>
                                    <div className="space-y-3">
                                        {kandidat.sprachkenntnisse.map((sprache, index) => (
                                            <div key={index} className="text-gray-950">
                                                <div className="flex justify-between mb-1 items-center">
                                                    <div className="flex items-center">
                                                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center mr-2">
                                                            {sprache.sprache === "Deutsch" ? (
                                                                <span className="font-bold text-xs" style={{ color: '#625df5' }}>DE</span>
                                                            ) : sprache.sprache === "Englisch" ? (
                                                                <span className="font-bold text-xs" style={{ color: '#625df5' }}>EN</span>
                                                            ) : (
                                                                <span className="font-bold text-xs" style={{ color: '#625df5' }}>FR</span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-black text-sm">{sprache.sprache}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-950 px-2 py-0.5 bg-gray-50 rounded-full font-medium">
                                                        {sprache.niveau}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={sprache.level}
                                                    className="h-1.5 bg-gray-200"
                                                    indicatorClassName={`${sprache.niveau === "Muttersprache"
                                                        ? "bg-green"
                                                        : sprache.niveau === "Berufliche Kenntnisse"
                                                            ? ""
                                                            : "bg-orange-500"
                                                        }`}
                                                    style={sprache.niveau === "Berufliche Kenntnisse" ? { backgroundColor: '#625df5' } : {}}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Kompakte Zertifizierungen Sektion - 2 Spalten */}
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                                <div className="h-1 bg-orange-500"></div>
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-bold mb-4 text-black flex items-center">
                                        <Award className="h-4 w-4 text-orange-500 mr-2" />
                                        Zertifizierungen
              </h3>
                                    <div className="space-y-3">
                                        {kandidat?.certificates?.length > 0 ? kandidat.certificates.slice(0, 3).map((cert, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-3 p-2 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                    <Award className="h-4 w-4 text-orange-600" />
                    </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-black text-sm truncate">{cert.name}</h4>
                                                    <p className="text-xs text-gray-950 truncate">{cert.description}</p>
                                                    <div className="flex items-center mt-1 text-xs text-gray-950">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        <span>{cert.date}</span>
                                                        <span className="mx-1">•</span>
                                                        <span className="truncate">{cert.issuer}</span>
                    </div>
                  </div>
                    </div>
                                        )) : <p className="text-gray-950 text-sm">Keine Zertifizierungen gefunden</p>}
                                        {kandidat?.certificates?.length > 3 && (
                                            <div className="text-xs text-gray-950 text-center pt-1">
                                                +{kandidat.certificates.length - 3} weitere Zertifizierungen
                    </div>
                                        )}
                  </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                                <div className="h-1" style={{ backgroundColor: '#625df5' }}></div>
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-bold mb-4 text-black flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="mr-2"
                                            style={{ color: '#625df5' }}
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                        </svg>
                                        Kernkompetenzen
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {kandidat.kernthemen.map((thema, index) => (
                                                <div key={index} className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full shadow-sm border border-gray-200 hover:border-gray-200 transition-colors">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        style={{ color: '#625df5' }}
                                                    >
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                    </svg>
                                                    <span className="text-xs text-gray-950 font-medium">{thema}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Expertise Level Indicator */}
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-950">Expertise Level</span>
                                                <span className="text-sm font-bold" style={{ color: '#625df5' }}>Expert</span>
                                            </div>
                                            <Progress value={95} className="h-2 bg-gray-200" style={{ backgroundColor: '#625df5' }} />
                                            <p className="text-xs text-gray-950 mt-2">
                                                8+ Jahre Berufserfahrung in kritischen Projekten
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Education Section */}
            <section id="ausbildung" className="py-14 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-heading-2 mb-10 text-black flex items-center">
                            <GraduationCap className="h-7 w-7 mr-3" style={{ color: '#625df5' }} />
                            Ausbildung
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {kandidat.education.map((edu, index) => (
                                <Card
                                    key={index}
                                    className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <h3 className="text-heading-3 mb-2 text-black">{edu.studyType}</h3>
                                                <p className="text-black font-medium text-lg mb-2" style={{ color: '#625df5' }}>{edu.institution}</p>
                                                <p className="text-gray-950">{edu.area}</p>
                                                {edu.note && <p className="text-gray-950 text-sm italic">{edu.note}</p>}
                                            </div>
                                            <div className="text-gray-950 text-sm md:text-right">
                                                <span className="inline-block px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
                                                    {edu.startDate} - {edu.endDate}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Work Experience Section - Verbesserte Ästhetik */}
            <section id="erfahrung" className="py-14 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-heading-2 mb-4 text-black flex items-center">
                            <Briefcase className="h-7 w-7 mr-3" style={{ color: '#625df5' }} />
                            Berufserfahrung
                        </h2>
                        <p className="text-body-large text-gray-950 mb-10">Langjährige Expertise in verschiedenen Unternehmen</p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {kandidat.work.map((job, index) => {
                                return (
                                    <Card
                                        key={index}
                                        className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                                    >
                                        <CardContent className="p-6 md:p-8 relative">
                                            {job.endDate === "Present" && (
                                                <div className="absolute top-4 right-4">
                                                    <Badge className="bg-green-100 text-green font-medium px-3 py-1 shadow-md border border-green-200">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                        Aktuelle Position
                                                    </Badge>
                                                </div>
                                            )}
                                            <div className="flex flex-col justify-between gap-4 mb-6">
                                                <div className="flex-1">
                                                    <h3 className="text-heading-3 mb-2 text-black">{job.position}</h3>
                                                    <p className="font-medium text-lg mb-2" style={{ color: '#625df5' }}>{job.name}</p>
                                                    <p className="text-gray-950 leading-relaxed">{job.summary}</p>
                                                </div>
                                                <div className="text-gray-950 text-sm">
                                                    {!!job?.startDate && !!job?.endDate && <span
                                                        className={`inline-block px-4 py-2 rounded-full border font-medium ${!!job?.endDate && job.endDate === "Present"
                                                            ? "bg-green-50 border-green-200 text-green"
                                                            : "bg-gray-50 border-gray-200 text-gray-950"
                                                            }`}
                                                    >
                                                        {!!job?.startDate && new Date(job.startDate).toLocaleDateString("de-DE", { year: "numeric", month: "numeric" })} -
                                                        {!!job?.endDate && job.endDate === "Present"
                                                            ? " Heute"
                                                            : ` ${new Date(job.endDate).toLocaleDateString("de-DE", { year: "numeric", month: "numeric" })}`}
                                                    </span>}
                                                </div>
                                            </div>
                                            {job.achievements && job.achievements.length > 0 && (
                                                <div
                                                    className={`p-4 rounded-lg border ${job?.endDate && job.endDate === "Present" ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                                                        }`}
                                                >
                                                    <h4 className="font-semibold text-black mb-3 flex items-center">
                                                        <CheckCircle
                                                            className={`h-5 w-5 mr-2 ${job?.endDate && job.endDate === "Present" ? "text-green" : ""
                                                                }`}
                                                            style={job?.endDate && job.endDate !== "Present" ? { color: '#625df5' } : {}}
                                                        />
                                                        Erfolge & Verantwortlichkeiten
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {job.achievements.map((achievement, idx) => (
                                                            <li key={idx} className="flex items-start gap-3">
                                                                <CheckCircle
                                                                    className={`h-5 w-5 mt-1 flex-shrink-0 ${job?.endDate && job.endDate === "Present" ? "text-green" : ""
                                                                        }`}
                                                                    style={job?.endDate && job.endDate !== "Present" ? { color: '#625df5' } : {}}
                                                                />
                                                                <span className="text-gray-950">{achievement}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Modernized Design */}
            <footer id="kontakt" className="py-16 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white no-print-element relative overflow-hidden">
                {/* Enhanced background patterns */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-achieve-ka rounded-full blur-3xl"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        {/* Trust Indicators - Enhanced Card Design */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#625df5' }}>
                                    <Users className="h-7 w-7 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">5.000+</div>
                                <div className="text-gray-200 text-sm font-medium mb-3">Experten im Pool</div>
                                <div className="flex justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="h-4 w-4 text-yellow fill-yellow-600" style={{ color: '#D4AF37', fill: '#D4AF37' }} />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Star className="h-7 w-7 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">4.8/5</div>
                                <div className="text-gray-200 text-sm font-medium mb-3">Kundenbewertung</div>
                                <div className="flex justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="h-4 w-4 text-yellow fill-yellow-600" style={{ color: '#D4AF37', fill: '#D4AF37' }} />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Shield className="h-7 w-7 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">100%</div>
                                <div className="text-gray-200 text-sm font-medium mb-3">DSGVO-konform</div>
                                <div className="flex justify-center">
                                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold rounded-lg">
                                        Zertifiziert
                                    </Badge>
                            </div>
                                </div>
                            
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#625df5' }}>
                                    <Clock className="h-7 w-7 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">seit 2020</div>
                                <div className="text-gray-200 text-sm font-medium mb-3">Marktführer</div>
                                <div className="flex justify-center">
                                    <Badge className="bg-white/10 text-white border border-white/20 px-3 py-1 text-xs">
                                        Etabliert
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-12"></div>

                        {/* Main Footer Content - Enhanced Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
                            {/* Company Info */}
                            <div className="lg:col-span-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg p-2">
                                        <Image 
                                            src="/logo-white.png" 
                                            alt="Acme Inc Logo" 
                                            width={32} 
                                            height={32} 
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-white">Acme Inc.</div>
                                        <div className="text-gray-300 text-sm">Premium Recruiting Solutions</div>
                                    </div>
                                </div>
                                <p className="text-gray-200 leading-relaxed mb-6 text-lg">
                                    Spezialisiert auf die Vermittlung hochqualifizierter IT-Experten und Führungskräfte für anspruchsvolle Projekte.
                                </p>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="h-5 w-5 text-amber-400 fill-amber-400" style={{ color: '#D4AF37', fill: '#D4AF37' }} />
                                        ))}
                                    </div>
                                    <span className="text-white font-semibold">4.8/5 Sterne</span>
                                </div>
                                <p className="text-gray-950">Über 50 Partner setzen seit 2020 auf unsere Expertise</p>
                            </div>

                            {/* Contact Information */}
                            <div className="lg:col-span-1">
                                <h3 className="text-xl font-bold mb-6 text-white">Kontakt</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <MapPin className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div>
                                            <p className="text-white font-medium">Hauptsitz</p>
                                            <p className="text-gray-200">Rudolfplatz 3, 50674 Köln</p>
                                        </div>
                            </div>

                                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <Phone className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div>
                                            <p className="text-white font-medium">Telefon</p>
                                            <p className="text-gray-200">+49 2111 7607 313</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <Mail className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-white font-medium">E-Mail</p>
                                            <p className="text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer">kontakt@getexperts.io</p>
                                        </div>
                                </div>
                            </div>
                        </div>

                            {/* Certifications */}
                            <div className="lg:col-span-1">
                                <h3 className="text-xl font-bold mb-6 text-white">Zertifizierungen & Auszeichnungen</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <Shield className="h-6 w-6 text-emerald-400" />
                                        <div>
                                            <p className="text-white font-medium">ISO 27001</p>
                                            <p className="text-gray-200 text-sm">Informationssicherheit</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <CheckCircle className="h-6 w-6 text-emerald-400" />
                                        <div>
                                            <p className="text-white font-medium">DSGVO-konform</p>
                                            <p className="text-gray-200 text-sm">Datenschutz garantiert</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <Award className="h-6 w-6 text-amber-400" />
                                        <div>
                                            <p className="text-white font-medium">Top Employer 2024</p>
                                            <p className="text-gray-200 text-sm">Ausgezeichnet als Arbeitgeber</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-8"></div>

                        {/* Footer Bottom */}
                        <div className="flex flex-col md:flex-row justify-between items-center pt-8">
                            <div className="text-gray-950 mb-4 md:mb-0">
                                © {new Date().getFullYear()} Acme Inc. Alle Rechte vorbehalten.
                            </div>
                            <div className="flex gap-8 text-gray-950">
                                <a href="#" className="hover:text-white transition-colors font-medium">
                                    Datenschutz
                                </a>
                                <a href="#" className="hover:text-white transition-colors font-medium">
                                    Impressum
                                </a>
                                <a href="#" className="hover:text-white transition-colors font-medium">
                                    AGB
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Druckspezifische Fußzeile - nur beim Drucken sichtbar */}
            <div className="hidden print-only mt-8 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-950">
                        <p>© {new Date().getFullYear()} Acme Inc. Alle Rechte vorbehalten.</p>
                    </div>
                    <div className="text-sm text-gray-950">
                        <p>
                            Seite <span className="print-page-number"></span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Scroll to top button - Harmonisches Design */}
            <a
                href="#"
                className="fixed bottom-6 right-6 text-white p-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 no-print-element backdrop-blur-sm border border-white/20 hover:scale-110"
                style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
                }}
                aria-label="Zum Seitenanfang"
            >
                <ChevronRight className="h-5 w-5 rotate-[-90deg]" />
            </a>

            {/* Optimierte Sticky Bottom Bar - Schmal und ohne FAQ */}
            <div
                className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 no-print-element shadow-2xl backdrop-blur-md"
                style={{ 
                    backgroundColor: '#422DFF',
                    borderImage: 'linear-gradient(90deg, #422DFF, #422DFF) 1'
                }}
            >
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center justify-between gap-3">
                        {/* Hauptinhalt - optimiert und kompakt */}
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/20 bg-white/10 backdrop-blur-sm">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base tracking-tight leading-tight">
                                    Exklusives Gespräch vereinbaren
                                </h3>
                                <p className="text-blue-100 text-xs font-medium">
                                    Persönlicher Termin in nur 1 Minute • 100% erfolgsbasiert
                                </p>
                            </div>
                        </div>

                        {/* Rechts - Kompakte Action Buttons */}
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20">
                                <Clock className="h-3 w-3" />
                                <span>Sofort verfügbar</span>
                            </div>
                            <Button className="text-blue-900 font-bold px-4 py-2 shadow-lg border border-white transition-all duration-300 hover:scale-105 rounded-lg text-sm" 
                                style={{ backgroundColor: '#D4AF37', borderColor: '#ffffff' }}
                            >
                                <Calendar className="mr-1.5 h-4 w-4" />
                                Termin vorschlagen
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer für sticky bottom bar - reduziert */}
            <div className="h-16 no-print-element"></div>

            {/* Help Modal - Self-Service Center */}
            <div id="help-modal" className="hidden fixed inset-0 z-50 items-center justify-center bg-black/50 backdrop-blur-sm no-print-element">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-950">Self-Service Center</h2>
                                <p className="text-gray-950">Häufige Fragen und Vorgehen bei Interesse</p>
                            </div>
                            <Button 
                                onClick={() => {
                                    const modal = document.getElementById('help-modal');
                                    if (modal) {
                                        modal.classList.add('hidden');
                                        modal.classList.remove('flex');
                                    }
                                }}
                                className="p-2 hover:bg-gray-50 rounded-full"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-8">
                        {/* Vorgehen bei Interesse */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                            <h3 className="text-xl font-bold text-gray-950 mb-4 flex items-center">
                                <svg className="h-6 w-6 mr-2 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Vorgehen bei Interesse
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-blue font-bold">1</span>
                                    </div>
                                    <h4 className="font-semibold text-gray-950 mb-2">Erstgespräch</h4>
                                    <p className="text-sm text-gray-950">15-20 Min. unverbindliches Kennenlernen per Video-Call</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-blue font-bold">2</span>
                                    </div>
                                    <h4 className="font-semibold text-gray-950 mb-2">Kandidat-Interview</h4>
                                    <p className="text-sm text-gray-950">45-60 Min. detailliertes Gespräch mit dem Kandidaten</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-blue font-bold">3</span>
                                    </div>
                                    <h4 className="font-semibold text-gray-950 mb-2">Vertragsabschluss</h4>
                                    <p className="text-sm text-gray-950">Bei beidseitigem Interesse erfolgt die Vertragsunterzeichnung</p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-950 mb-6">Häufig gestellte Fragen</h3>
                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-950 mb-2">💰 Wie funktioniert die erfolgsbasierte Abrechnung?</h4>
                                    <p className="text-gray-950 text-sm">Sie zahlen nur bei erfolgreicher Vermittlung. Keine Vorabkosten, keine versteckten Gebühren. Die Provision wird erst nach Vertragsunterzeichnung fällig.</p>
                                </div>
                                
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-950 mb-2">⏱️ Wie schnell kann der Kandidat starten?</h4>
                                    <p className="text-gray-950 text-sm">Dieser Kandidat ist sofort verfügbar und kann innerhalb von 2 Wochen starten. Bei laufenden Projekten besprechen wir flexible Übergangslösungen.</p>
                                </div>
                                
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-950 mb-2">🔒 Wie läuft die Qualitätssicherung ab?</h4>
                                    <p className="text-gray-950 text-sm">Alle Kandidaten durchlaufen ein mehrstufiges Screening-Verfahren. Referenzen werden geprüft und fachliche Kompetenzen validiert.</p>
                                </div>
                                
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-950 mb-2">📝 Welche Vertragsmodelle sind möglich?</h4>
                                    <p className="text-gray-950 text-sm">Wir bieten flexible Vertragsmodelle: Festanstellung, Freelancer-Basis oder Projekteinsatz. Je nach Ihren Anforderungen finden wir die passende Lösung.</p>
                                </div>
                                
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-950 mb-2">🎯 Was passiert bei Nicht-Zufriedenheit?</h4>
                                    <p className="text-gray-950 text-sm">Wir bieten eine 90-Tage-Garantie. Sollten Sie nicht zufrieden sein, suchen wir kostenfrei nach einer alternativen Lösung.</p>
                                </div>
                            </div>
                        </div>

                        {/* Kontakt */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-gray-950 mb-4">Weitere Fragen?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-blue" />
                                    <div>
                                        <p className="font-medium text-gray-950">Telefon</p>
                                        <p className="text-gray-950 text-sm">+49 2111 7607 313</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-blue" />
                                    <div>
                                        <p className="font-medium text-gray-950">E-Mail</p>
                                        <p className="text-gray-950 text-sm">kontakt@getexperts.io</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-950 text-center">
                                    ⚡ Durchschnittliche Antwortzeit: 2 Stunden | 📞 Telefonisch erreichbar: Mo-Fr 9-18 Uhr
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer für sticky bottom bar - größer für mobile */}
            <div className="h-24 sm:h-20 no-print-element"></div>

            {/* Handwritten underline style */}
            <style jsx global>{`
        .handwritten-underline::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0,1.5 Q 5,0 10,1.5 T 20,1.5 T 30,1.5 T 40,1.5 T 50,1.5 T 60,1.5 T 70,1.5 T 80,1.5 T 90,1.5 T 100,1.5' stroke='%230a2e65' strokeWidth='1.5' fill='none' strokeLinecap='round' strokeDasharray='0,0'/%3E%3C/svg%3E");
          background-position: 0 100%;
          background-size: cover;
          background-repeat: no-repeat;
          opacity: 0.8;
          pointer-events: none;
        }
        
        /* Druckspezifische Styles */
        @media print {
          .print-only {
            display: block !important;
          }
          
          .print-logo {
            filter: invert(1);
          }
          
          .no-print-element {
            display: none !important;
          }
          
          /* Seitenzahlen */
          @page {
            counter-increment: page;
          }
          
          .print-page-number:after {
            content: counter(page);
          }
        }
        
        .hidden.print-only {
          display: none;
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1.1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.15);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
        </main>
    )
}


