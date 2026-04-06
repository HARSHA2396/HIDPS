import { Activity, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import type { NavigationItem } from '../lib/navigation';
import type { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  items: NavigationItem[];
}

export function Sidebar({ activeView, onSelectView, items }: SidebarProps) {
  return (
    <aside className="hidden xl:flex w-72 border-r border-white/6 bg-[linear-gradient(180deg,#08111f_0%,#0c1728_48%,#09111d_100%)] flex-col justify-between">
      <div className="px-5 py-6">
        <div className="rounded-[28px] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.98))] p-5 shadow-[0_30px_80px_rgba(2,12,27,0.45)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">
                NEXUS<span className="text-cyan-300">SOC</span>
              </h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                AI-Driven IDPS
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Activity className="h-3.5 w-3.5 text-emerald-300" />
                Live Fabric
              </div>
              <p className="mt-2 text-sm font-semibold text-white">Connected</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                Response
              </div>
              <p className="mt-2 text-sm font-semibold text-white">Guardrailed</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Analyst Workflow
          </p>
          <nav className="mt-3 space-y-1.5">
            {items.map((item) => {
              const isActive = item.view === activeView;

              return (
                <button
                  key={item.view}
                  onClick={() => onSelectView(item.view)}
                  className={`group w-full rounded-2xl px-4 py-3 text-left transition-all ${
                    isActive
                      ? 'border border-cyan-400/18 bg-cyan-400/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_24px_rgba(6,182,212,0.08)]'
                      : 'border border-transparent text-slate-400 hover:border-white/6 hover:bg-white/4 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                        isActive
                          ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-200'
                          : 'border-white/6 bg-slate-950/70 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.label}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">{item.shortLabel}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="rounded-[24px] border border-white/6 bg-slate-950/70 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Operator Notes
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Use Dashboard for live posture, Alerts for triage and closure, and Settings to verify
            deployed API, WebSocket, and model runtime before the demo.
          </p>
        </div>
      </div>
    </aside>
  );
}
