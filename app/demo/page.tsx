import { KandidatenProfile } from "@/components/kandidaten-profile"
import { loadKandidatenDaten } from "@/services/data-service"
import type { NavigationItem } from "@/types/kandidat"

// Navigation für die Demo-Seite
const navSections: NavigationItem[] = [
  { id: "highlights", label: "Highlights" },
  { id: "profil", label: "Profil" },
  { id: "ausbildung", label: "Ausbildung" },
  { id: "erfahrung", label: "Erfahrung" },
  { id: "kontakt", label: "Kontakt" }
]

export default async function DemoPage() {
  // Lade die Test-Kandidatendaten
  const { kandidat, accountManager } = await loadKandidatenDaten()
  
  return (
    <KandidatenProfile 
      kandidat={kandidat}
      accountManager={accountManager}
      navSections={navSections}
    />
  )
} 