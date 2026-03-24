import type { NavigationItem } from '../lib/navigation';
import type { AppView } from '../types';

interface ViewSwitcherProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  items: NavigationItem[];
}

export function ViewSwitcher({ activeView, onSelectView, items }: ViewSwitcherProps) {
  return (
    <div className="xl:hidden border-b border-slate-800 bg-slate-950/90 backdrop-blur px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => {
          const isActive = item.view === activeView;
          return (
            <button
              key={item.view}
              onClick={() => onSelectView(item.view)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold tracking-wide transition-colors ${
                isActive
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
