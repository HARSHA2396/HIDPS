import { useEffect, useState } from 'react';
import { BellRing, Radar, ShieldCheck, Siren, Waypoints } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { formatRelativeTime } from '../lib/insights';
import { AnalyticsPanel } from './AnalyticsPanel';
import { GlobalMap } from './GlobalMap';
import type { AlertData, CorrelationCase, PendingAction, TelemetrySourceStatus } from '../types';

interface DashboardPageProps {
  alerts: AlertData[];
}

export function DashboardPage({ alerts }: DashboardPageProps) {
  const [telemetrySources, setTelemetrySources] = useState<TelemetrySourceStatus[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [cases, setCases] = useState<CorrelationCase[]>([]);

  useEffect(() => {
    let ignore = false;

    const loadOverview = async () => {
      try {
        const [telemetryResponse, pendingResponse, casesResponse] = await Promise.all([
          apiFetch('/api/telemetry/sources'),
          apiFetch('/api/action/pending'),
          apiFetch('/api/correlation/cases'),
        ]);
        if (!telemetryResponse.ok || !pendingResponse.ok || !casesResponse.ok) {
          throw new Error('Overview services unavailable.');
        }
        const [telemetryData, pendingData, casesData] = (await Promise.all([
          telemetryResponse.json(),
          pendingResponse.json(),
          casesResponse.json(),
        ])) as [TelemetrySourceStatus[], PendingAction[], CorrelationCase[]];

        if (!ignore) {
          setTelemetrySources(telemetryData);
          setPendingActions(pendingData);
          setCases(casesData);
        }
      } catch {
        if (!ignore) {
          setTelemetrySources([]);
          setPendingActions([]);
          setCases([]);
        }
      }
    };

    void loadOverview();

    return () => {
      ignore = true;
    };
  }, []);

  const unassignedAlerts = alerts.filter((alert) => !alert.assigned_analyst && alert.status !== 'closed').length;
  const investigatingAlerts = alerts.filter((alert) => alert.status === 'investigating').length;
  const escalatedAlerts = alerts.filter((alert) => alert.status === 'escalated').length;
  const closedToday = alerts.filter((alert) => alert.status === 'closed').length;

  return (
    <main className="flex-1 overflow-auto p-4 space-y-4">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Unassigned Queue</p>
              <p className="mt-2 text-3xl font-bold text-white">{unassignedAlerts}</p>
            </div>
            <BellRing className="h-6 w-6 text-amber-400" />
          </div>
        </div>
        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Investigating</p>
              <p className="mt-2 text-3xl font-bold text-white">{investigatingAlerts}</p>
            </div>
            <Radar className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Escalated</p>
              <p className="mt-2 text-3xl font-bold text-white">{escalatedAlerts}</p>
            </div>
            <Siren className="h-6 w-6 text-fuchsia-400" />
          </div>
        </div>
        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Closed</p>
              <p className="mt-2 text-3xl font-bold text-white">{closedToday}</p>
            </div>
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <GlobalMap alerts={alerts.slice(0, 20)} />
        </div>
        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-wide text-white">SOC Essentials</h2>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Telemetry posture and approval backlog
            </p>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Pending approvals</p>
              <p className="mt-2 text-2xl font-bold text-white">{pendingActions.length}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Correlation cases</p>
              <p className="mt-2 text-2xl font-bold text-white">{cases.length}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Telemetry sources online</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {telemetrySources.filter((source) => source.status !== 'Delayed').length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <AnalyticsPanel alerts={alerts} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-5">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-wide text-white">Telemetry Health</h2>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Source coverage and freshness
            </p>
          </div>
          <div className="space-y-3">
            {telemetrySources.slice(0, 5).map((source) => (
              <div key={source.source_id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{source.source_id}</p>
                    <p className="text-xs text-slate-500">{source.kind}</p>
                  </div>
                  <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-200">
                    {source.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{source.coverage}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Last seen {formatRelativeTime(source.last_seen)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-wide text-white">Priority Cases</h2>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Escalation watchlist for leadership
            </p>
          </div>
          <div className="space-y-3">
            {cases.slice(0, 4).map((item) => (
              <div key={item.case_id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <span className="rounded-full bg-fuchsia-500/10 px-2 py-1 text-xs font-semibold text-fuchsia-200">
                    {(item.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Waypoints className="h-4 w-4 text-amber-400" />
            <h2 className="text-lg font-bold tracking-wide text-white">Approvals</h2>
          </div>
          <div className="space-y-3">
            {pendingActions.slice(0, 4).map((action) => (
              <div key={action.action_id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <p className="text-sm font-semibold text-white">{action.action_type}</p>
                <p className="mt-2 text-xs text-slate-400">{action.target_ip}</p>
                <p className="mt-2 text-xs text-slate-500">{action.recommended_playbook}</p>
              </div>
            ))}
            {pendingActions.length === 0 && (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                No pending approvals right now.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
