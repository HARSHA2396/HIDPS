import { Activity, Bell, Clock3, LogOut, Play, Search, ShieldAlert, Square } from 'lucide-react';
import type { AuthUser, ConnectionState } from '../types';

interface TopBarProps {
  simulationActive: boolean;
  toggleSimulation: () => void;
  connectionState: ConnectionState;
  activeThreatCount: number;
  activeViewLabel: string;
  activeViewDescription: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currentUser: AuthUser;
  onLogout: () => void;
}

export function TopBar({
  simulationActive,
  toggleSimulation,
  connectionState,
  activeThreatCount,
  activeViewLabel,
  activeViewDescription,
  searchQuery,
  onSearchChange,
  currentUser,
  onLogout,
}: TopBarProps) {
  const nowLabel = new Date().toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const userInitials = currentUser.name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
  const statusTone =
    connectionState === 'online'
      ? 'bg-green-500/10 text-green-400 border-green-500/30'
      : connectionState === 'connecting'
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        : 'bg-red-500/10 text-red-400 border-red-500/30';

  return (
    <header className="shrink-0 border-b border-white/6 bg-[linear-gradient(180deg,rgba(8,17,31,0.92),rgba(11,21,37,0.96))] px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex items-center gap-3 xl:hidden shrink-0">
          <ShieldAlert className="text-cyan-400 w-6 h-6" />
        </div>

        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-semibold text-white">{activeViewLabel}</p>
          <p className="truncate text-xs text-slate-500">{activeViewDescription}</p>
        </div>

        <div className="group relative w-full max-w-xl md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search alerts, IPs, countries, nodes..."
            className="w-full rounded-2xl border border-white/6 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-200 transition-all placeholder:text-slate-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:shadow-[0_0_18px_rgba(34,211,238,0.12)]"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 md:gap-4">
        <div className="hidden items-center gap-2 rounded-2xl border border-white/6 bg-slate-950/80 px-3 py-2 lg:flex">
          <Activity className="h-4 w-4 text-cyan-300" />
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Threat Load</p>
            <p className="text-sm font-semibold text-white">{activeThreatCount} active vectors</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-2xl border border-white/6 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 xl:flex">
          <Clock3 className="h-4 w-4 text-amber-300" />
          <span>{nowLabel}</span>
        </div>

        <div className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-semibold uppercase tracking-wider ${statusTone}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
          </span>
          {connectionState}
        </div>

        <button
          onClick={toggleSimulation}
          disabled={connectionState !== 'online'}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            simulationActive
              ? 'border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/18'
              : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/18'
          }`}
        >
          {simulationActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {simulationActive ? 'Pause Simulation' : 'Resume Simulation'}
        </button>

        <div className="relative cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-800">
          <Bell className="w-5 h-5 text-slate-400 hover:text-white" />
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 border border-slate-900 animate-pulse" />
        </div>

        <div className="group hidden cursor-pointer items-center gap-3 border-l border-slate-800 pl-4 md:pl-6 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-bold text-cyan-400 transition-colors group-hover:border-cyan-500">
            {userInitials || 'NA'}
          </div>
          <div className="hidden xl:block">
            <p className="text-sm font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
            <p className="text-xs text-slate-500 font-medium">{currentUser.role}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="hidden rounded-2xl border border-white/6 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-500/30 hover:text-white xl:flex xl:items-center xl:gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
      </div>
    </header>
  );
}
