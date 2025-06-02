"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { transformKandidatenDaten } from "@/utils/data-transformer"
import type { Kandidat, AccountManager } from "@/types/kandidat"

interface KandidatenSelectorProps {
  onKandidatenSelected: (kandidat: Kandidat, accountManager: AccountManager) => void
  defaultAccountManager: AccountManager
}

export function KandidatenSelector({ onKandidatenSelected, defaultAccountManager }: KandidatenSelectorProps) {
  const [profilJson, setProfilJson] = useState("")
  const [resumeJson, setResumeJson] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      // Parse die JSON-Daten
      const profilDaten = JSON.parse(profilJson)
      const resumeDaten = JSON.parse(resumeJson)

      // Transformiere die Daten
      const kandidat = transformKandidatenDaten(profilDaten, resumeDaten)

      // Rufe den Callback mit den transformierten Daten auf
      onKandidatenSelected(kandidat, defaultAccountManager)
    } catch (err) {
      setError("Fehler beim Verarbeiten der JSON-Daten. Bitte überprüfen Sie das Format.")
      console.error("Fehler beim Verarbeiten der JSON-Daten:", err)
    }
  }

  const handleLoadExample = () => {
    setProfilJson(
      JSON.stringify(
        {
          kurzprofil_text:
            "Kandidat:in A ist Gründer:in und CEO einer spezialisierten Personalberatung im DACH-Raum, die sich auf IT, Engineering und Sales fokussiert. Mit über vier Jahren Erfahrung in der Leitung von Recruiting-Prozessen hat er/sie innovative Ansätze entwickelt, die messbare Ergebnisse und hohe Prozesssicherheit gewährleisten. Durch ein umfangreiches Netzwerk von über 5.000 qualifizierten Fachkräften und eine datengetriebene Ansprache von passiven Kandidat:innen hat Kandidat:in A sich als vertrauenswürdiger Partner für Unternehmen etabliert, die auf der Suche nach hochqualifizierten Talenten sind. Seine/ihre Expertise erstreckt sich über verschiedene Branchen, darunter Cloud-Technologien, Embedded Systems und Business Development, was ihn/sie zu einem wertvollen Ansprechpartner für Fachbereichsleiter:innen und HR-Manager:innen macht.",
          lebenslauf_text:
            "Kandidat:in A ist Gründer:in und CEO einer innovativen Personalberatung, die sich auf die Rekrutierung von Fachkräften in den Bereichen IT, Engineering und Sales im DACH-Raum spezialisiert hat. Seit 2021 leitet er/sie erfolgreich die Geschäfte und hat dabei den Rekrutierungsprozess neu definiert, um maximale Prozesssicherheit und nachweisbaren ROI zu gewährleisten. Zuvor sammelte er/sie wertvolle Erfahrungen in verschiedenen Positionen, unter anderem im Projektmanagement bei einem großen Beratungsunternehmen sowie in der Assistenz der Geschäftsführung. Mit einem Bachelor-Abschluss in Wirtschaftsinformatik und einem weiteren in Psychologie bringt Kandidat:in A eine fundierte akademische Grundlage mit, die durch relevante Zertifizierungen, wie die SAP Certified Application Associate, ergänzt wird. Seine/ihre Sprachkenntnisse in Deutsch und Englisch ermöglichen eine effektive Kommunikation in internationalen Kontexten.",
          profil_einschaetzung:
            "Kandidat:in A bringt umfangreiche Erfahrung im Recruiting und eine starke unternehmerische Denkweise mit. Seine/ihre Fähigkeit, maßgeschneiderte Rekrutierungsstrategien zu entwickeln und ein breites Netzwerk von Fachkräften zu nutzen, macht ihn/sie zu einem idealen Partner für Unternehmen, die auf der Suche nach hochqualifizierten Talenten sind. Die Kombination aus technischer Expertise und einem tiefen Verständnis für die Bedürfnisse der Branche positioniert Kandidat:in A als wertvolle Ressource für Fachbereichsleiter:innen und HR-Manager:innen.",
          senioritaet: "Senior",
          potenziell_passende_jobrollen: ["Leiter:in Recruiting", "Talent Acquisition Manager", "HR Business Partner"],
          kernthemen: ["Recruiting", "Talent Acquisition", "Prozessoptimierung", "Datenanalyse"],
        },
        null,
        2,
      ),
    )

    setResumeJson(
      JSON.stringify(
        {
          basics: {
            name: "Kandidat:in A",
            label: "Gründer:in & CEO",
            image: "",
            email: "",
            phone: "",
            url: "",
            summary:
              "Gründer:in und CEO einer spezialisierten Personalberatung im DACH-Raum mit Fokus auf IT, Engineering und Sales.",
            location: {
              address: "Rudolfplatz 3",
              postalCode: "50674",
              city: "Köln",
              countryCode: "DE",
              region: "Nordrhein-Westfalen",
            },
            profiles: [],
          },
          work: [
            {
              name: "getexperts GmbH",
              position: "Gründer:in & CEO",
              url: "",
              startDate: "2021-01-01",
              endDate: "Present",
              summary: "Spezialisierte Personalberatung für IT, Engineering und Sales im DACH-Raum.",
              highlights: [],
            },
            {
              name: "Accenture",
              position: "Projektmitarbeiter",
              url: "",
              startDate: "2021-04-01",
              endDate: "2021-07-01",
              summary: "Mitwirkung im Projektmanagement.",
              highlights: [],
            },
            {
              name: "H&PS Project/Program Management Office",
              position: "Projektmitarbeiter",
              url: "",
              startDate: "2020-10-01",
              endDate: "2021-03-01",
              summary: "Unterstützung im Projektmanagement.",
              highlights: [],
            },
            {
              name: "THE 9TH",
              position: "Assistenz der Geschäftsführung",
              url: "",
              startDate: "2019-10-01",
              endDate: "2020-09-01",
              summary: "Assistenzaufgaben im Management.",
              highlights: [],
            },
            {
              name: "ABRACON GmbH",
              position: "Praktikant:in SAP Business Intelligence",
              url: "",
              startDate: "2017-02-01",
              endDate: "2019-09-01",
              summary: "Praktische Erfahrungen im Bereich SAP Business Intelligence.",
              highlights: [],
            },
          ],
          volunteer: [],
          education: [
            {
              institution: "Hochschule Bonn-Rhein-Sieg",
              url: "",
              area: "Wirtschaftsinformatik",
              studyType: "Bachelor of Science",
              startDate: "",
              endDate: "",
              score: "",
              courses: [],
            },
            {
              institution: "FernUniversität in Hagen",
              url: "",
              area: "Psychologie",
              studyType: "Bachelor of Science",
              startDate: "",
              endDate: "",
              score: "",
              courses: [],
            },
          ],
          awards: [],
          certificates: [
            {
              name: "SAP Certified Application Associate",
              date: "",
              issuer: "",
              url: "",
            },
            {
              name: "Stipendium",
              date: "",
              issuer: "",
              url: "",
            },
          ],
          publications: [],
          skills: [],
          languages: [
            {
              language: "Deutsch",
              fluency: "Muttersprache",
            },
            {
              language: "Englisch",
              fluency: "Berufliche Kenntnisse",
            },
          ],
          interests: [],
          references: [],
          projects: [],
        },
        null,
        2,
      ),
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Kandidatenprofil laden</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profil-json">Profil JSON</Label>
            <Textarea
              id="profil-json"
              value={profilJson}
              onChange={(e) => setProfilJson(e.target.value)}
              placeholder="Fügen Sie hier das Profil JSON ein"
              className="min-h-[200px] font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume-json">Resume JSON</Label>
            <Textarea
              id="resume-json"
              value={resumeJson}
              onChange={(e) => setResumeJson(e.target.value)}
              placeholder="Fügen Sie hier das Resume JSON ein"
              className="min-h-[200px] font-mono text-sm"
              required
            />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red p-3 rounded-md">{error}</div>}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleLoadExample}>
              Beispieldaten laden
            </Button>
            <Button type="submit">Kandidatenprofil generieren</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
