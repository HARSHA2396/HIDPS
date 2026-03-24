import { ShieldAlert } from 'lucide-react';
import type { NavigationItem } from '../lib/navigation';
import type { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  items: NavigationItem[];
}

export function Sidebar({ activeView, onSelectView, items }: SidebarProps) {
  return (
    <aside className="hidden xl:flex w-64 bg-slate-950 border-r border-slate-800 flex-col justify-between">
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <ShieldAlert className="text-cyan-400 w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider">
              NEXUS<span className="text-cyan-400">SOC</span>
            </h1>
            <p className="text-xs text-slate-500 uppercase">Edge-Cloud IDPS</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const isActive = item.view === activeView;

            return (
              <button
                key={item.view}
                onClick={() => onSelectView(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 shadow-[inset_2px_0_0_#22d3ee]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 m-4 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 uppercase">System Status</span>
        </div>
        <p className="text-xs text-slate-500">
          Cloud Sync: <span className="text-green-400 relative">Active</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">AI Model: GAN+BiLSTM</p>
      </div>
    </aside>
  );
}
