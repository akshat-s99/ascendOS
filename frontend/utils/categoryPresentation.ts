import {
  Activity,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Clapperboard,
  Code2,
  Film,
  Gamepad2,
  HeartPulse,
  Library,
  LucideIcon,
  Moon,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Activity,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Clapperboard,
  Code2,
  Film,
  Gamepad2,
  HeartPulse,
  Library,
  Moon,
  Sparkles,
  Users,
  Wallet,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICONS);

export function getCategoryIcon(icon: string): LucideIcon {
  return CATEGORY_ICONS[icon] ?? Sparkles;
}
