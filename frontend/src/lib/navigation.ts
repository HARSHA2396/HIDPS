import {
  Activity,
  BellRing,
  BarChart3,
  FileText,
  Server,
  Settings,
  ShieldAlert,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { AppView, AuthUser } from '../types';

export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  shortLabel: string;
  view: AppView;
  description: string;
  allowedRoles?: string[];
}

export const NAV_ITEMS: NavigationItem[] = [
  {
    icon: Activity,
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    view: 'dashboard',
    description: 'Live SOC telemetry, map, alert stream, and response operations.',
  },
  {
    icon: BellRing,
    label: 'Alerts',
    shortLabel: 'Alerts',
    view: 'alerts',
    description: 'Unified analyst queue for triage, escalation, reporting, and closure.',
  },
  {
    icon: ShieldAlert,
    label: 'Threat Intelligence',
    shortLabel: 'Threat Intel',
    view: 'threat-intelligence',
    description: 'Threat family trends, origin regions, and active adversarial campaigns.',
  },
  {
    icon: Server,
    label: 'Edge Nodes',
    shortLabel: 'Nodes',
    view: 'edge-nodes',
    description: 'Inference node posture, health, throughput, and deployment readiness.',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    shortLabel: 'Analytics',
    view: 'analytics',
    description: 'Severity mix, confidence curves, and attack distribution analytics.',
  },
  {
    icon: FileText,
    label: 'Logs & Forensics',
    shortLabel: 'Forensics',
    view: 'logs-forensics',
    description: 'Searchable incident logs, packet metadata, and investigation pivots.',
  },
  {
    icon: Users,
    label: 'SOC Manager',
    shortLabel: 'Manager',
    view: 'access-control',
    description: 'User administration, analyst performance, MTTA, MTTD, MTTR, and leadership oversight.',
    allowedRoles: ['SOC Manager', 'Compliance Lead'],
  },
  {
    icon: Settings,
    label: 'Settings',
    shortLabel: 'Settings',
    view: 'settings',
    description: 'Runtime endpoints, deployment flags, and production readiness controls.',
  },
];

const VIEW_SET = new Set<AppView>(NAV_ITEMS.map((item) => item.view));

export function isAppView(value: string): value is AppView {
  return VIEW_SET.has(value as AppView);
}

export function parseViewHash(hash: string): AppView {
  const normalized = hash.replace(/^#\/?/, '').trim();
  return isAppView(normalized) ? normalized : 'dashboard';
}

export function toViewHash(view: AppView) {
  return `#/${view}`;
}

export function getViewMeta(view: AppView) {
  return NAV_ITEMS.find((item) => item.view === view) || NAV_ITEMS[0];
}

export function getNavigationItemsForUser(user: AuthUser | null) {
  if (!user) {
    return [];
  }
  return NAV_ITEMS.filter((item) => !item.allowedRoles || item.allowedRoles.includes(user.role));
}

export function canAccessView(view: AppView, user: AuthUser | null) {
  const item = getViewMeta(view);
  if (!user) {
    return false;
  }
  return !item.allowedRoles || item.allowedRoles.includes(user.role);
}
