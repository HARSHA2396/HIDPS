import { Activity, Bell, LogOut, Play, Search, ShieldAlert, Square } from 'lucide-react';
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
    <header className="flex items-center justify-between gap-4 min-h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 shrink-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-3 xl:hidden shrink-0">
          <ShieldAlert className="text-cyan-400 w-6 h-6" />
        </div>

        <div className="min-w-0 hidden lg:block">
          <p className="text-sm font-semibold text-white truncate">{activeViewLabel}</p>
          <p className="text-xs text-slate-500 truncate">{activeViewDescription}</p>
        </div>

        <div className="relative w-full max-w-xl md:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search alerts, IPs, countries, nodes..."
            className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 appearance-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-cyan-500/50 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800">
          <Activity className="w-4 h-4 text-cyan-400" />
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Live Threat Load</p>
            <p className="text-sm font-semibold text-white">{activeThreatCount} active vectors</p>
          </div>
        </div>

        <div className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider ${statusTone}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
          </span>
          {connectionState}
        </div>

        <button
          onClick={toggleSimulation}
          disabled={connectionState !== 'online'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            simulationActive
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]'
              : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]'
          }`}
        >
          {simulationActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {simulationActive ? 'STOP ATTACK SIM' : 'START ATTACK SIM'}
        </button>

        <div className="relative cursor-pointer hover:bg-slate-800 p-2 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-slate-400 hover:text-white" />
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 border border-slate-900 animate-pulse" />
        </div>

        <div className="hidden sm:flex items-center gap-3 border-l border-slate-800 pl-4 md:pl-6 cursor-pointer group">
          <div className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 text-cyan-400 flex items-center justify-center text-xs font-bold group-hover:border-cyan-500 transition-colors">
            {userInitials || 'NA'}
          </div>
          <div className="hidden xl:block">
            <p className="text-sm font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
            <p className="text-xs text-slate-500 font-medium">{currentUser.role}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="hidden rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-500/30 hover:text-white xl:flex xl:items-center xl:gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
