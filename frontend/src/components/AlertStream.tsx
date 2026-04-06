import { useMemo, useState } from 'react';
import type { AlertData } from '../types';
import { AlertTriangle, Info, Search, UserPlus } from 'lucide-react';
import { getSeverityTone, sortAlertsNewest } from '../lib/insights';

interface AlertStreamProps {
  alerts: AlertData[];
  selectedAlertId?: string | null;
  onSelectAlert: (alert: AlertData) => void;
  onAssignAlert?: (alert: AlertData) => void;
}

type QueueFilter = 'all' | 'open' | 'assigned' | 'critical';

export function AlertStream({
  alerts,
  selectedAlertId,
  onSelectAlert,
  onAssignAlert,
}: AlertStreamProps) {
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [localQuery, setLocalQuery] = useState('');

  const queue = useMemo(() => {
    const query = localQuery.trim().toLowerCase();
    return sortAlertsNewest(alerts)
      .filter((alert) => {
        if (filter === 'open') {
          return alert.status !== 'closed';
        }
        if (filter === 'assigned') {
          return Boolean(alert.assigned_analyst);
        }
        if (filter === 'critical') {
          return alert.severity === 'Critical' || alert.severity === 'High';
        }
        return true;
      })
      .filter((alert) => {
        if (!query) {
          return true;
        }
        return [
          alert.id,
          alert.attack_type,
          alert.source_ip,
          alert.asset_name,
          alert.severity,
          alert.status,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);
      });
  }, [alerts, filter, localQuery]);

  const filterOptions: Array<{ id: QueueFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'critical', label: 'High Risk' },
  ];

  return (
    <div className="flex h-full min-h-[40rem] flex-col rounded-[26px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] shadow-[0_24px_60px_rgba(2,12,27,0.28)]">
      <div className="border-b border-white/6 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-white">Alert Queue</h2>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Analyst-ready detections with assignment and triage context
            </p>
          </div>
          <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            {queue.length} visible
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === option.id
                  ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
                  : 'border-white/6 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={localQuery}
            onChange={(event) => setLocalQuery(event.target.value)}
            placeholder="Search by ID, threat, IP, or asset"
            className="w-full rounded-2xl border border-white/6 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {queue.map((alert) => {
            const isSelected = selectedAlertId === alert.id;

            return (
              <button
                key={alert.id}
                onClick={() => onSelectAlert(alert)}
                className={`w-full rounded-[22px] border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-cyan-400/25 bg-cyan-400/8 shadow-[0_14px_30px_rgba(6,182,212,0.08)]'
                    : 'border-white/6 bg-slate-950/60 hover:border-white/10 hover:bg-slate-950/80'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{alert.attack_type}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getSeverityTone(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {alert.id} • {alert.asset_name} • Node {alert.edge_node_id}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/6 bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    {alert.status}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/6 bg-slate-900/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Source</p>
                    <p className="mt-2 text-sm font-medium text-white">{alert.source_ip}</p>
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-slate-900/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Queue</p>
                    <p className="mt-2 text-sm font-medium text-white">{alert.queue_level}</p>
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-slate-900/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Confidence</p>
                    <p className="mt-2 text-sm font-medium text-white">{(alert.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    <span>Threat Score Proxy</span>
                    <span>{(alert.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-300 to-red-400"
                      style={{ width: `${Math.min(alert.confidence * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                    Owner {alert.assigned_analyst || 'Unassigned'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectAlert(alert);
                      }}
                      className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200"
                    >
                      Open Workbench
                    </button>
                    {onAssignAlert && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onAssignAlert(alert);
                        }}
                        className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200"
                      >
                        <UserPlus className="h-3 w-3" />
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {queue.length === 0 && (
          <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed border-white/8 bg-slate-950/50 text-slate-500">
            <Info className="h-8 w-8 opacity-60" />
            <p className="text-sm font-medium">No alerts match the current queue filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
