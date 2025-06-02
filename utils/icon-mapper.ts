import {
  Users,
  TrendingUp,
  Target,
  Zap,
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
  Download,
  Star,
  Shield,
  Clock,
  ChevronRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  Users,
  TrendingUp,
  Target,
  Zap,
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
  Download,
  Star,
  Shield,
  Clock,
  ChevronRight,
}

export function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || Users // Default to Users if icon not found
}
